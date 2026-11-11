const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const data = require(path.join(root, "assets/js/data.js"));
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");

test("profile and education consistently show the awarded Ph.D.", () => {
  assert.equal(data.profile.role, "Ph.D. in Cyberspace Security");
  assert.match(data.translations.en["hero.availability"], /have received my Ph\.D\./);
  assert.match(data.translations.zh["hero.availability"], /已获得.*博士学位/);
  assert.doesNotMatch(JSON.stringify(data), /expect(?:ed)? to receive|degree expected|预计于 2026 年 10 月获得博士学位/);
  assert.equal(data.education[0].title.en, "Ph.D., Cyberspace Security");
  assert.equal(data.education[0].title.zh, "网络空间安全博士");
});

test("the removed academic statistics band is absent", () => {
  assert.equal(data.stats, undefined);
  assert.doesNotMatch(html, /data-stats|stats-band/);
});

test("news defaults to five items and exposes a bilingual folding control", () => {
  assert.match(app, /newsItems\.slice\(0, 5\)/);
  assert.match(app, /data-news-toggle/);
  assert.equal(data.translations.en["news.showMore"], "Show all updates");
  assert.equal(data.translations.zh["news.showMore"], "展开全部消息");
  assert.match(data.news[0].title.en, /survey manuscript on toxic generated content detection/);
  assert.match(data.news[0].title.zh, /毒性生成内容检测的综述论文/);
  assert.deepEqual(data.news[0].links[0], {
    label: { en: "Website", zh: "项目网站" },
    url: "https://xukun12138.github.io/toxicity-evidence/"
  });
});

test("the bilingual identity and About mentor links are current", () => {
  assert.match(html, /class="brand-text">Kun Xu <span class="brand-name-chinese">\(许锟\)<\/span>/);
  assert.match(html, /class="hero-name-chinese">\(许锟\)<\/span>/);
  assert.doesNotMatch(html, /openreview\.net|semanticscholar\.org/);
  assert.match(html, /data-i18n="about\.link\.visitingSupervisorElena">Prof\. Elena Ferrari/);
  assert.match(html, /data-i18n="about\.link\.visitingSupervisorBarbara">Prof\. Barbara Carminati/);
  assert.equal(data.translations.zh["about.link.visitingSupervisorElena"], "Elena Ferrari 教授");
  assert.equal(data.translations.zh["about.link.visitingSupervisorBarbara"], "Barbara Carminati 教授");
});

test("publications and research highlights default to two items with bilingual controls", () => {
  assert.match(app, /publications\.slice\(0, 2\)/);
  assert.match(app, /data-publications-toggle/);
  assert.match(app, /data\.projects\.slice\(0, 2\)/);
  assert.match(app, /data-projects-toggle/);
  assert.equal(data.translations.en["publications.showMore"], "Show all publications");
  assert.equal(data.translations.zh["publications.showMore"], "展开全部论文");
  assert.equal(data.translations.en["projects.showMore"], "Show all research highlights");
  assert.equal(data.translations.zh["projects.showMore"], "展开全部研究亮点");
});

test("publication localization is limited to venues and summaries", () => {
  assert.equal(data.translations.en["publications.title"], data.translations.zh["publications.title"]);
  data.publications.forEach((publication) => {
    assert.equal(typeof publication.title, "string");
    assert.equal(typeof publication.type, "string");
    assert.equal(typeof publication.venue, "object");
    assert.equal(typeof publication.summary, "object");
    assert.ok(publication.venue.en && publication.venue.zh);
    assert.ok(publication.summary.en && publication.summary.zh);
  });
});

test("ACM TOMM is the first journal-review entry", () => {
  const journalReview = data.services.find((group) => group.category === "Journal Reviewer");
  assert.deepEqual(journalReview.items[0], {
    label: "ACM TOMM",
    url: "https://dl.acm.org/journal/tomm"
  });
});

test("section subtitles below Research through CV are removed", () => {
  ["research", "news", "publications", "projects", "cv"].forEach((section) => {
    assert.doesNotMatch(html, new RegExp(`data-i18n="${section}\\.subtitle"`));
  });
  assert.match(html, /data-i18n="contact\.subtitle"/);
});
