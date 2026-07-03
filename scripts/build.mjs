import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const data = require(path.join(root, "assets/js/data.js"));

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside project root: ${target}`);
  }
}

async function copyEntry(entry) {
  const source = path.join(root, entry);
  const target = path.join(dist, entry);
  await fs.cp(source, target, { recursive: true });
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function plainText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function writeGeneratedFiles() {
  const now = new Date().toISOString();
  const searchIndex = [
    {
      type: "profile",
      title: `${data.profile.name} ${data.profile.chineseName}`,
      text: [
        data.profile.role,
        data.profile.affiliation,
        data.profile.department,
        data.profile.location
      ].join(" "),
      url: "#about"
    },
    ...data.publications.map((publication) => ({
      type: "publication",
      title: publication.title,
      text: [
        publication.venue,
        publication.year,
        publication.authors.join(" "),
        publication.summary,
        publication.keywords.join(" ")
      ].join(" "),
      url: `#${publication.id}`
    })),
    ...data.projects.map((project) => ({
      type: "project",
      title: project.title,
      text: [project.status, project.summary, project.bullets.join(" ")].join(" "),
      url: "#projects"
    }))
  ].map((entry) => ({
    ...entry,
    title: plainText(entry.title),
    text: plainText(entry.text)
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(data.site.url)}</loc>
    <lastmod>${now.slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  await fs.writeFile(path.join(dist, "search-index.json"), JSON.stringify(searchIndex, null, 2), "utf8");
  await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
  await fs.writeFile(path.join(dist, ".nojekyll"), "", "utf8");
}

async function build() {
  assertInsideRoot(dist);
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });

  for (const entry of ["index.html", "404.html", "robots.txt", "assets"]) {
    await copyEntry(entry);
  }

  await writeGeneratedFiles();
  console.log(`Built ${path.relative(root, dist)} for ${data.site.url}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
