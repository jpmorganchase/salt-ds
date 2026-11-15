import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { verifyMosaicSnapshot } from "../../site/scripts/verify-mosaic-snapshot.mjs";

const temporaryDirs = [];
const pages = {
  "/salt/index": "# Salt",
  "/salt/components/button": "# Button",
};
const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.test/salt/index</loc><priority>0.5</priority></url>
  <url><loc>https://example.test/salt/components/button</loc><changefreq>weekly</changefreq></url>
</urlset>`;

async function fixture(overrides = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "salt-snapshot-"));
  temporaryDirs.push(directory);
  const files = {
    "sitemap.xml": sitemap,
    "markdown-pages.json": JSON.stringify({ version: 1, pages }),
    "llms.txt": "# Salt\n- [Button](/salt/components/button.md)",
    "llms-full.txt": "# Salt\n# Button",
    ...overrides,
  };
  await Promise.all(
    Object.entries(files)
      .filter(([, content]) => content !== undefined)
      .map(([name, content]) => writeFile(path.join(directory, name), content)),
  );
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirs
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Mosaic snapshot completeness", () => {
  it("accepts a complete snapshot", async () => {
    await expect(verifyMosaicSnapshot(await fixture())).resolves.toEqual({
      sitemapRoutes: 2,
      markdownPages: 2,
    });
  });

  it("rejects a partial Markdown result from a failed plugin", async () => {
    const directory = await fixture({
      "markdown-pages.json": JSON.stringify({
        version: 1,
        pages: { "/salt/index": "# Salt" },
      }),
    });
    await expect(verifyMosaicSnapshot(directory)).rejects.toThrow(
      "Missing or empty (1): /salt/components/button",
    );
  });

  it("rejects an accidentally exported release feed", async () => {
    const directory = await fixture({
      "markdown-pages.json": JSON.stringify({
        version: 1,
        pages: { ...pages, "/salt-github/releases": "Private feed metadata" },
      }),
    });
    await expect(verifyMosaicSnapshot(directory)).rejects.toThrow(
      "Unexpected (1): /salt-github/releases",
    );
  });

  it.each(["sitemap.xml", "markdown-pages.json", "llms.txt", "llms-full.txt"])(
    "rejects missing %s",
    async (name) => {
      await expect(
        verifyMosaicSnapshot(await fixture({ [name]: undefined })),
      ).rejects.toThrow(name);
    },
  );

  it.each(["sitemap.xml", "llms.txt", "llms-full.txt"])(
    "rejects empty %s",
    async (name) => {
      await expect(
        verifyMosaicSnapshot(await fixture({ [name]: " \n" })),
      ).rejects.toThrow(`${name} is empty`);
    },
  );

  it.each([
    "<urlset></urlset>",
    "<urlset><url><loc>/salt/index</loc></url>",
    "<urlset><url><loc>/salt/index</url></urlset>",
    "<urlset><url><loc>/salt/index</loc><loc>/salt/other</loc></url></urlset>",
    "<urlset><url><loc>/salt-github/index</loc></url></urlset>",
  ])("rejects a malformed or nonpublic sitemap: %s", async (xml) => {
    await expect(
      verifyMosaicSnapshot(await fixture({ "sitemap.xml": xml })),
    ).rejects.toThrow("sitemap.xml");
  });

  it("rejects unsupported Markdown manifests", async () => {
    await expect(
      verifyMosaicSnapshot(
        await fixture({
          "markdown-pages.json": JSON.stringify({ version: 2, pages }),
        }),
      ),
    ).rejects.toThrow("version 1");
  });
});
