import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const siteDocsRoot = path.join(repositoryRoot, "site", "docs");
const supportUrl =
  "https://www.saltdesignsystem.com/salt/support-and-contributions";

async function walk(root, predicate = () => true) {
  const files = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      else if (predicate(absolute)) files.push(absolute);
    }
  }
  return files.sort();
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

function publicRoute(file) {
  const relative = path
    .relative(siteDocsRoot, file)
    .replaceAll("\\", "/")
    .replace(/\.mdx$/u, "");
  return relative.endsWith("/index")
    ? `/salt/${relative.slice(0, -"/index".length)}`
    : `/salt/${relative}`;
}

function links(source) {
  const results = [];
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu)) {
    results.push(match[1]);
  }
  for (const match of source.matchAll(/\b(?:href|src|srcDark)=["']([^"']+)["']/gu)) {
    results.push(match[1]);
  }
  return results;
}

const mdxFiles = await walk(siteDocsRoot, (file) => file.endsWith(".mdx"));
const routes = new Set(
  mdxFiles.flatMap((file) => {
    const normalized = publicRoute(file);
    return path.basename(file) === "index.mdx"
      ? [normalized, `${normalized}/index`]
      : [normalized];
  }),
);
for (const file of mdxFiles) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/^\s*-\s+(\/salt\/[^\s]+)\s*$/gmu)) {
    routes.add(match[1]);
  }
}
routes.add("/salt");
routes.add("/salt/index");

for (const file of mdxFiles) {
  const source = await readFile(file, "utf8");
  for (const href of links(source)) {
    if (
      /^(?:<?https?:|mailto:|tel:|#|data:)/u.test(href) ||
      href.includes("{")
    ) {
      continue;
    }
    const target = href.split(/[?#]/u)[0];
    if (!target) continue;
    if (target.startsWith("/img/")) {
      assert.ok(
        await exists(path.join(repositoryRoot, "site", "public", target)),
        `${path.relative(repositoryRoot, file)}: missing public asset ${target}`,
      );
      continue;
    }
    if (target.startsWith("/salt/")) {
      const normalizedTarget = target.replace(/\/$/u, "");
      assert.ok(
        routes.has(normalizedTarget),
        `${path.relative(repositoryRoot, file)}: missing local route ${target}`,
      );
      continue;
    }
    if (target.startsWith("/")) continue;
    const resolved = path.resolve(path.dirname(file), target);
    assert.ok(
      (await exists(resolved)) ||
        (await exists(`${resolved}.mdx`)) ||
        (await exists(path.join(resolved, "index.mdx"))),
      `${path.relative(repositoryRoot, file)}: missing relative link ${href}`,
    );
  }
}

const packageDirectories = (
  await readdir(path.join(repositoryRoot, "packages"), { withFileTypes: true })
).filter((entry) => entry.isDirectory());
const publicPackages = [];
for (const directory of packageDirectories) {
  const packageRoot = path.join(repositoryRoot, "packages", directory.name);
  const manifestPath = path.join(packageRoot, "package.json");
  if (!(await exists(manifestPath))) continue;
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.private === true) continue;
  publicPackages.push({ manifest, packageRoot });
}
assert.equal(publicPackages.length, 13, "Expected 13 publishable Salt packages");

for (const { manifest, packageRoot } of publicPackages) {
  const relativePackageRoot = path.relative(repositoryRoot, packageRoot);
  const readmePath = path.join(packageRoot, "README.md");
  assert.ok(await exists(readmePath), `${manifest.name}: README.md is missing`);
  const readme = await readFile(readmePath, "utf8");
  assert.ok(readme.length >= 500, `${manifest.name}: README.md is not useful enough`);
  assert.match(readme, /^## (?:Install|Installation)$/mu, `${manifest.name}: README needs installation guidance`);
  assert.match(readme, /^## (?:Usage|Quick start)$/mu, `${manifest.name}: README needs usage guidance`);
  assert.ok(manifest.description?.length >= 20, `${manifest.name}: description is missing`);
  assert.match(manifest.homepage ?? "", /^https:\/\/www\.saltdesignsystem\.com\//u, `${manifest.name}: canonical homepage is missing`);
  assert.ok(Array.isArray(manifest.keywords) && manifest.keywords.length >= 3, `${manifest.name}: keywords are missing`);
  assert.equal(manifest.license, "Apache-2.0", `${manifest.name}: license must be Apache-2.0`);
  assert.match(manifest.repository?.url ?? "", /github\.com\/jpmorganchase\/salt-ds/u, `${manifest.name}: repository URL is missing`);
  assert.equal(manifest.repository?.directory, relativePackageRoot.replaceAll("\\", "/"));
  assert.equal(manifest.bugs?.url, supportUrl, `${manifest.name}: support URL is not canonical`);

  const distRoot = path.join(
    repositoryRoot,
    "dist",
    manifest.name.replace("@salt-ds/", "salt-ds-"),
  );
  const distManifestPath = path.join(distRoot, "package.json");
  assert.ok(await exists(distManifestPath), `${manifest.name}: built package is missing`);
  const distManifest = JSON.parse(await readFile(distManifestPath, "utf8"));
  for (const field of [
    "description",
    "homepage",
    "keywords",
    "license",
    "repository",
    "bugs",
  ]) {
    assert.deepEqual(distManifest[field], manifest[field], `${manifest.name}: built ${field} is stale`);
  }
  assert.ok(await exists(path.join(distRoot, "README.md")), `${manifest.name}: built README is missing`);
  const pack = await execa(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["pack", "--dry-run", "--json", distRoot],
    { cwd: repositoryRoot },
  );
  const metadata = JSON.parse(pack.stdout)[0];
  assert.ok(metadata.files.some(({ path: file }) => file === "README.md"), `${manifest.name}: npm pack omits README.md`);
}

const publicTextFiles = [
  path.join(repositoryRoot, "README.md"),
  path.join(repositoryRoot, "CONTRIBUTING.md"),
  ...mdxFiles,
  ...(await walk(path.join(repositoryRoot, "examples", "apps"), (file) =>
    /\.(?:css|html|js|json|md|mjs|ts|tsx)$/u.test(file),
  )),
  ...publicPackages.map(({ packageRoot }) => path.join(packageRoot, "README.md")),
];
for (const file of publicTextFiles) {
  const source = await readFile(file, "utf8");
  assert.doesNotMatch(source, /https:\/\/storybook\.saltdesignsystem\.com/iu, `${path.relative(repositoryRoot, file)} exposes a Storybook URL`);
  assert.doesNotMatch(source, /https:\/\/github\.com\/jpmorganchase\/salt-ds\/issues/iu, `${path.relative(repositoryRoot, file)} uses GitHub Issues as support`);
  if (!file.endsWith(path.join("packages", "mcp", "README.md"))) {
    assert.doesNotMatch(source, /@salt-ds\/mcp/iu, `${path.relative(repositoryRoot, file)} presents unreleased AI tooling`);
  }
}

const patternManifest = JSON.parse(
  await readFile(
    path.join(repositoryRoot, "site", "src", "examples", "patterns", "manifest.json"),
    "utf8",
  ),
);
for (const example of patternManifest.examples) {
  const doc = await readFile(
    path.join(siteDocsRoot, "patterns", `${example.id}.mdx`),
    "utf8",
  );
  assert.match(
    doc,
    new RegExp(
      `<LivePreview\\s+componentName="patterns/${example.id}"\\s+exampleName="${example.exportName}"\\s*/>`,
    ),
    `${example.id}: public pattern page does not render its canonical example`,
  );
}

console.log(
  `Verified ${mdxFiles.length} MDX files, ${publicPackages.length} publishable package presentations, and ${patternManifest.examples.length} public pattern pages.`,
);
