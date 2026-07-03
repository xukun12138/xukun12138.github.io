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
      return `<a href="${escapeHtml(link.url)}"${target}>${escapeHtml(link.label)}</a>`;
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
    if (langLabel) langLabel.textContent = state.lang === "en" ? "EN" : "中";
    renderAll();
  }

  function renderProfileLinks() {
    const primary = ["Google Scholar", "ORCID", "GitHub", "DBLP"];
    const links = data.profile.links.filter((item) => primary.includes(item.label));
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
        <div class="timeline-date">${escapeHtml(item.date)}</div>
        <div class="timeline-body">
          <span class="type-pill">${escapeHtml(item.type)}</span>
          <p>${escapeHtml(item.title)}</p>
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
    const haystack = [
      pub.title,
      pub.venue,
      pub.badge,
      pub.summary,
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
          <span>${escapeHtml(pub.badge)}</span>
          <span>${escapeHtml(pub.type)}</span>
          <span>${escapeHtml(String(pub.year))}</span>
        </div>
        <h3>${escapeHtml(pub.title)}</h3>
        <p class="authors">${pub.authors.map((author) => {
          const isMe = author.replace("*", "") === data.profile.name;
          return `<span class="${isMe ? "me" : ""}">${escapeHtml(author)}</span>`;
        }).join(", ")}</p>
        <p class="venue">${escapeHtml(pub.venue)}</p>
        <p>${escapeHtml(pub.summary)}</p>
        <div class="tag-row">
          ${pub.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
        </div>
        <div class="card-actions">
          ${pub.links.map((link) => {
            const target = link.url.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
            return `<a href="${escapeHtml(link.url)}"${target}>${escapeHtml(link.label)}</a>`;
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
    bindEvents();
  }

  init();
})();
