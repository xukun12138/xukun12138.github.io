(function () {
  const data = window.SITE_DATA;
  const state = {
    lang: localStorage.getItem("kx-lang") || "en",
    theme: localStorage.getItem("kx-theme") || "light",
    publicationYear: "all",
    publicationQuery: ""
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function textFor(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[state.lang] || value.en || Object.values(value)[0] || "";
    }
    return value || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function linkList(links, className = "link-list") {
    return `<div class="${className}">${links.map((link) => {
      const target = link.url.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
      return `<a href="${escapeHtml(link.url)}"${target}>${escapeHtml(textFor(link.label))}</a>`;
    }).join("")}</div>`;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const icon = $("[data-theme-icon]");
    if (icon) icon.textContent = state.theme === "dark" ? "☾" : "◐";
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    const translations = data.translations[state.lang] || data.translations.en;
    $$("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (translations[key]) node.textContent = translations[key];
    });
    const langLabel = $("[data-lang-label]");
    if (langLabel) langLabel.textContent = state.lang === "en" ? "中" : "EN";
    const langToggle = $("[data-lang-toggle]");
    if (langToggle) {
      langToggle.setAttribute("aria-label", state.lang === "en" ? "切换至中文" : "Switch to English");
    }
    renderAll();
  }

  function renderProfileLinks() {
    const primary = ["Google Scholar", "ORCID", "OpenReview", "DBLP"];
    const links = primary
      .map((label) => data.profile.links.find((item) => item.label === label))
      .filter(Boolean);
    $("[data-profile-links]").innerHTML = links.map((link) => (
      `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`
    )).join("");
  }

  function renderStats() {
    $("[data-stats]").innerHTML = data.stats.map((stat) => `
      <article class="stat-card">
        <strong>${escapeHtml(stat.value)}</strong>
        <span>${escapeHtml(textFor(stat.label))}</span>
        <p>${escapeHtml(textFor(stat.detail))}</p>
      </article>
    `).join("");
  }

  function renderResearchThemes() {
    $("[data-research-themes]").innerHTML = data.researchThemes.map((theme) => `
      <article class="theme-card ${escapeHtml(theme.tone)}">
        <div class="theme-marker" aria-hidden="true"></div>
        <h3>${escapeHtml(textFor(theme.title))}</h3>
        <p>${escapeHtml(textFor(theme.summary))}</p>
        <div class="tag-row">
          ${theme.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
        </div>
      </article>
    `).join("");
  }

  function renderNews() {
    $("[data-news]").innerHTML = data.news.map((item) => `
      <article class="timeline-item ${item.highlight ? "highlight" : ""}">
        <div class="timeline-date">${escapeHtml(textFor(item.date))}</div>
        <div class="timeline-body">
          <span class="type-pill">${escapeHtml(textFor(item.type))}</span>
          <p>${escapeHtml(textFor(item.title))}</p>
          ${item.links ? linkList(item.links, "mini-links") : ""}
        </div>
      </article>
    `).join("");
  }

  function renderYearFilters() {
    const years = ["all", ...new Set(data.publications.map((pub) => String(pub.year)))];
    $("[data-year-filters]").innerHTML = years.map((year) => `
      <button type="button" class="${state.publicationYear === year ? "active" : ""}" data-year="${escapeHtml(year)}">
        ${year === "all" ? "All" : escapeHtml(year)}
      </button>
    `).join("");
  }

  function publicationMatches(pub) {
    const query = state.publicationQuery.trim().toLowerCase();
    const yearOk = state.publicationYear === "all" || String(pub.year) === state.publicationYear;
    if (!yearOk) return false;
    if (!query) return true;
    const badges = pub.badges || (pub.badge ? [pub.badge] : []);
    const haystack = [
      textFor(pub.title),
      textFor(pub.venue),
      badges.map((badge) => textFor(badge)).join(" "),
      textFor(pub.type),
      textFor(pub.summary),
      pub.authors.join(" "),
      pub.keywords.join(" ")
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  }

  function renderPublications() {
    const publications = data.publications.filter(publicationMatches);
    const list = $("[data-publications]");
    if (!publications.length) {
      list.innerHTML = '<p class="empty-state">No publications match the current filter.</p>';
      return;
    }

    list.innerHTML = publications.map((pub) => `
      <article class="publication-card">
        <div class="pub-meta">
          ${(pub.badges || (pub.badge ? [pub.badge] : [])).map((badge) => (
            `<span>${escapeHtml(textFor(badge))}</span>`
          )).join("")}
          <span>${escapeHtml(textFor(pub.type))}</span>
          <span>${escapeHtml(String(pub.year))}</span>
        </div>
        <h3>${escapeHtml(textFor(pub.title))}</h3>
        <p class="authors">${pub.authors.map((author) => {
          const isMe = author.replace("*", "") === data.profile.name;
          return `<span class="${isMe ? "me" : ""}">${escapeHtml(author)}</span>`;
        }).join(", ")}</p>
        <p class="venue">${escapeHtml(textFor(pub.venue))}</p>
        <p>${escapeHtml(textFor(pub.summary))}</p>
        <div class="tag-row">
          ${pub.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
        </div>
        <div class="card-actions">
          ${pub.links.map((link) => {
            const target = link.url.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
            return `<a href="${escapeHtml(link.url)}"${target}>${escapeHtml(textFor(link.label))}</a>`;
          }).join("")}
          <button type="button" data-copy-bib="${escapeHtml(pub.id)}">BibTeX</button>
        </div>
      </article>
    `).join("");
  }

  function renderProjects() {
    $("[data-projects]").innerHTML = data.projects.map((project) => `
      <article class="project-card">
        <figure>
          <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} visual summary" loading="lazy">
          <figcaption>${escapeHtml(project.status)}</figcaption>
        </figure>
        <div class="project-body">
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.summary)}</p>
          <ul>
            ${project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
          </ul>
          ${linkList(project.links, "card-actions")}
        </div>
      </article>
    `).join("");
  }

  function renderTimelineBlock(items) {
    return items.map((item) => `
      <article class="cv-item">
        <time>${escapeHtml(item.period || item.date)}</time>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.institution || item.organization || "")}</p>
        ${item.location ? `<span>${escapeHtml(item.location)}</span>` : ""}
        ${item.link ? `<a href="${escapeHtml(item.link)}">View document</a>` : ""}
      </article>
    `).join("");
  }

  function renderCv() {
    $("[data-education]").innerHTML = renderTimelineBlock(data.education);
    $("[data-honors]").innerHTML = renderTimelineBlock(data.honors);
    $("[data-services]").innerHTML = data.services.map((group) => `
      <article class="service-group">
        <h4>${escapeHtml(group.category)}</h4>
        <div class="service-tags">
          ${group.items.map((item) => {
            if (item.url) {
              return `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`;
            }
            return `<span>${escapeHtml(item.label)}</span>`;
          }).join("")}
        </div>
      </article>
    `).join("");
  }

  function renderContact() {
    $("[data-emails]").innerHTML = data.profile.emails.map((email) => `
      <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
    `).join("");
    $("[data-contact-links]").innerHTML = data.profile.links.map((link) => (
      `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`
    )).join("");
  }

  function renderAll() {
    renderProfileLinks();
    renderStats();
    renderResearchThemes();
    renderNews();
    renderYearFilters();
    renderPublications();
    renderProjects();
    renderCv();
    renderContact();
  }

  function showToast(message) {
    const toast = $("[data-toast]");
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  const visitorIdKey = "kx-visitor-id";
  let visitorLocationLoaded = false;

  function analyticsBaseUrl() {
    return (data.analytics?.workerUrl || "").trim().replace(/\/+$/, "");
  }

  function analyticsEnabled() {
    return Boolean(analyticsBaseUrl());
  }

  function formatCount(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "--";
    return new Intl.NumberFormat("en-US").format(number);
  }

  function setVisitorCount(name, value) {
    const field = $(`[data-visitor-${name}]`);
    if (field) field.textContent = formatCount(value);
  }

  function applyVisitorStats(stats) {
    if (!stats) return;
    setVisitorCount("pv", stats.pv);
    setVisitorCount("uv", stats.uv);
  }

  function getVisitorId() {
    try {
      let id = localStorage.getItem(visitorIdKey);
      if (!id) {
        id = window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(visitorIdKey, id);
      }
      return id;
    } catch (error) {
      return "";
    }
  }

  function updateVisitorPrivacyCopy() {
    const note = $("[data-visitor-privacy]");
    if (!note) return;
    note.textContent = analyticsEnabled()
      ? "This panel shows the current visitor's approximate public IP location. Visits are stored in a private admin-only analytics database."
      : "This panel shows only the current visitor's approximate public IP location. IP geolocation can be inaccurate and is not stored by this static website.";
  }

  async function loadPrivateVisitorStats() {
    const baseUrl = analyticsBaseUrl();
    if (!baseUrl) return;
    try {
      const response = await fetch(`${baseUrl}/api/stats`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Stats lookup failed: ${response.status}`);
      applyVisitorStats(await response.json());
    } catch (error) {
      // Keep the public counter fallback visible if the private endpoint is unavailable.
    }
  }

  async function trackVisit() {
    const baseUrl = analyticsBaseUrl();
    if (!baseUrl) return;

    try {
      const payload = {
        visitorId: getVisitorId(),
        path: `${window.location.pathname}${window.location.search}`,
        title: document.title,
        referrer: document.referrer,
        language: navigator.language,
        screen: window.screen ? `${window.screen.width}x${window.screen.height}` : "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
      };
      const response = await fetch(`${baseUrl}/api/visit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        keepalive: true
      });
      if (!response.ok) throw new Error(`Visit tracking failed: ${response.status}`);
      const result = await response.json();
      applyVisitorStats(result.stats);
    } catch (error) {
      loadPrivateVisitorStats();
    }
  }

  function normalizePrivateLocation(location) {
    const place = [
      location.location?.city,
      location.location?.region,
      location.location?.country
    ].filter(Boolean).join(", ");

    return {
      ip: location.ip,
      place,
      org: location.network?.organization || location.network?.asn,
      timezone: location.location?.timezone
    };
  }

  function normalizeIpApiLocation(location) {
    const place = [location.city, location.region, location.country_name]
      .filter(Boolean)
      .join(", ");

    return {
      ip: location.ip,
      place,
      org: location.org || location.asn,
      timezone: location.timezone
    };
  }

  async function fetchVisitorLocation() {
    const baseUrl = analyticsBaseUrl();
    if (baseUrl) {
      const response = await fetch(`${baseUrl}/api/me`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Private IP location lookup failed: ${response.status}`);
      return normalizePrivateLocation(await response.json());
    }

    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) throw new Error(`IP location lookup failed: ${response.status}`);
    return normalizeIpApiLocation(await response.json());
  }

  function setVisitorField(name, value) {
    const field = $(`[data-visitor-${name}]`);
    if (field) field.textContent = value || "Not available";
  }

  function setVisitorStatus(message) {
    const status = $("[data-visitor-status]");
    if (status) status.textContent = message;
  }

  function openVisitorModal() {
    const modal = $("[data-visitor-modal]");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    loadVisitorLocation();
  }

  function closeVisitorModal() {
    const modal = $("[data-visitor-modal]");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  async function loadVisitorLocation() {
    if (visitorLocationLoaded) return;
    setVisitorStatus("Loading current visitor IP location...");

    try {
      const location = await fetchVisitorLocation();

      setVisitorField("ip", location.ip);
      setVisitorField("place", location.place);
      setVisitorField("org", location.org);
      setVisitorField("timezone", location.timezone);
      setVisitorStatus("Approximate location loaded for the current visitor.");
      visitorLocationLoaded = true;
    } catch (error) {
      setVisitorStatus("Unable to load IP location right now. Please try again later.");
    }
  }

  function bindEvents() {
    $("[data-theme-toggle]").addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("kx-theme", state.theme);
      applyTheme();
    });

    $("[data-lang-toggle]").addEventListener("click", () => {
      state.lang = state.lang === "en" ? "zh" : "en";
      localStorage.setItem("kx-lang", state.lang);
      applyLanguage();
    });

    $("[data-publication-search]").addEventListener("input", (event) => {
      state.publicationQuery = event.target.value;
      renderPublications();
    });

    $("[data-year-filters]").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-year]");
      if (!button) return;
      state.publicationYear = button.dataset.year;
      renderYearFilters();
      renderPublications();
    });

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-bib]");
      if (!button) return;
      const pub = data.publications.find((item) => item.id === button.dataset.copyBib);
      if (!pub) return;
      try {
        await navigator.clipboard.writeText(pub.bibtex);
        showToast("BibTeX copied");
      } catch (error) {
        showToast("Copy failed");
      }
    });

    $("[data-print-cv]").addEventListener("click", () => window.print());

    const visitorCounter = $("[data-visitor-counter]");
    if (visitorCounter) {
      visitorCounter.addEventListener("click", openVisitorModal);
    }

    $$("[data-visitor-close]").forEach((button) => {
      button.addEventListener("click", closeVisitorModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeVisitorModal();
    });

    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      $("[data-scroll-progress]").style.transform = `scaleX(${ratio})`;
      $("[data-header]").classList.toggle("scrolled", window.scrollY > 16);
    }, { passive: true });
  }

  function init() {
    $("[data-year]").textContent = new Date().getFullYear();
    applyTheme();
    applyLanguage();
    updateVisitorPrivacyCopy();
    bindEvents();
    trackVisit();
    loadPrivateVisitorStats();
  }

  init();
})();
