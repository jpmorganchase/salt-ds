import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultSnapshotDir = fileURLToPath(
  new URL("../snapshots/latest/", import.meta.url),
);

// Mosaic emits a flat urlset with loc, changefreq, priority and optional lastmod
// elements. Validate that known format rather than accepting a partial XML file.
function sitemapRoutes(xml) {
  const document = xml.trim().replace(/^<\?xml[^?]*\?>\s*/, "");
  const urlset = /^<urlset\b[^>]*>([\s\S]*)<\/urlset>$/.exec(document);
  if (!urlset) throw new Error("sitemap.xml is not a complete urlset");
  const entries = [...urlset[1].matchAll(/<url>([\s\S]*?)<\/url>/g)];
  if (
    !entries.length ||
    urlset[1].replace(/<url>[\s\S]*?<\/url>/g, "").trim()
  ) {
    throw new Error("sitemap.xml has no routes or contains malformed entries");
  }
  return entries.map(([, entry]) => {
    const locations = [...entry.matchAll(/<loc>\s*([^<>\s]+)\s*<\/loc>/g)];
    const remaining = entry.replace(
      /<(loc|changefreq|priority|lastmod)>[^<>]*<\/\1>/g,
      "",
    );
    if (locations.length !== 1 || remaining.trim()) {
      throw new Error("sitemap.xml contains a malformed URL entry");
    }
    return new URL(locations[0][1], "https://snapshot.invalid").pathname;
  });
}

export async function verifyMosaicSnapshot(snapshotDir = defaultSnapshotDir) {
  async function readRequiredFile(name) {
    const content = await readFile(path.join(snapshotDir, name), "utf8");
    if (!content.trim()) throw new Error(`${name} is empty`);
    return content;
  }

  const [sitemap, markdown] = await Promise.all([
    readRequiredFile("sitemap.xml"),
    readRequiredFile("markdown-pages.json"),
    readRequiredFile("llms.txt"),
    readRequiredFile("llms-full.txt"),
  ]);
  const routes = new Set(
    sitemapRoutes(sitemap).filter((route) => route.startsWith("/salt/")),
  );
  if (!routes.size)
    throw new Error("sitemap.xml contains no public Salt routes");

  const file = JSON.parse(markdown);
  if (
    file?.version !== 1 ||
    !file.pages ||
    typeof file.pages !== "object" ||
    Array.isArray(file.pages)
  ) {
    throw new Error(
      "markdown-pages.json must contain version 1 and a pages object",
    );
  }
  const missing = [...routes].filter(
    (route) =>
      typeof file.pages[route] !== "string" || !file.pages[route].trim(),
  );
  const unexpected = Object.keys(file.pages).filter(
    (route) => !routes.has(route),
  );
  if (missing.length || unexpected.length) {
    throw new Error(
      [
        "Markdown pages do not match the public sitemap.",
        ...(missing.length
          ? [`Missing or empty (${missing.length}): ${missing.join(", ")}`]
          : []),
        ...(unexpected.length
          ? [`Unexpected (${unexpected.length}): ${unexpected.join(", ")}`]
          : []),
      ].join("\n"),
    );
  }
  return {
    sitemapRoutes: routes.size,
    markdownPages: Object.keys(file.pages).length,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const result = await verifyMosaicSnapshot(process.argv[2]);
    console.log(
      `Verified Mosaic snapshot: ${result.sitemapRoutes} public routes and ${result.markdownPages} Markdown pages.`,
    );
  } catch (error) {
    console.error(`Incomplete Mosaic snapshot: ${error.message}`);
    process.exitCode = 1;
  }
}
