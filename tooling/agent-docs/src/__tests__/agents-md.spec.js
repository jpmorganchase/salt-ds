import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  agentsBlock,
  findDocs,
  indexLines,
  readManifests,
  run,
  upsertBlock,
  withClaudeImport,
} from "../agents-md.mjs";

const block = agentsBlock({
  root: "node_modules/@salt-ds",
  lines: ["|core/docs/components:{button.md[Action]}"],
});
const roots = [];

function manifest(pages) {
  return JSON.stringify({ name: "@salt-ds/core", version: "1.0.0", pages });
}

const coreManifest = manifest([
  { path: "components/dialog.md", title: "Dialog", aliases: ["Modal"] },
  { path: "components/button.md", title: "Button" },
  { path: "patterns/forms.md", title: "Forms" },
]);
const labManifest = manifest([
  {
    path: "components/layouts/deck-layout.md",
    title: "Deck layout",
    aliases: ["Slide deck", "Step content"],
  },
]);

async function createProject(files = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "salt-agents-md-"));
  roots.push(root);
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("upsertBlock", () => {
  it("creates, appends and replaces the Salt block", () => {
    expect(upsertBlock("", block)).toBe(`${block}\n`);
    expect(upsertBlock("# Rules\n", block)).toBe(`# Rules\n\n${block}\n`);
    const stale = upsertBlock(
      "# Rules\n",
      agentsBlock({ root: "old", lines: [] }),
    );
    expect(upsertBlock(`${stale}More rules.\n`, block)).toBe(
      `# Rules\n\n${block}\nMore rules.\n`,
    );
    expect(upsertBlock(upsertBlock("", block), block)).toBe(`${block}\n`);
  });

  it("refuses to update an incomplete block", () => {
    const [begin] = block.split("\n");
    expect(() => upsertBlock(`# Rules\n${begin}\nMine.\n`, block)).toThrow(
      "Found an incomplete Salt block.",
    );
    const end = block.split("\n").at(-1);
    expect(() => upsertBlock(`${end}\n`, block)).toThrow(
      "Found an incomplete Salt block.",
    );
  });

  it("keeps Windows line endings", () => {
    expect(upsertBlock("# Rules\r\n", block)).toBe(
      `# Rules\r\n\r\n${block.replace(/\n/g, "\r\n")}\r\n`,
    );
  });
});

describe("withClaudeImport", () => {
  it("adds the AGENTS.md import once", () => {
    expect(withClaudeImport("")).toBe("@AGENTS.md\n");
    expect(withClaudeImport("# Claude\n")).toBe("# Claude\n\n@AGENTS.md\n");
    expect(withClaudeImport("@AGENTS.md\n# Claude\n")).toBe(
      "@AGENTS.md\n# Claude\n",
    );
  });
});

describe("indexLines", () => {
  it("lists each docs folder once, core first, with other names in brackets", () => {
    expect(
      indexLines([
        { directory: "lab", pages: JSON.parse(labManifest).pages },
        { directory: "core", pages: JSON.parse(coreManifest).pages },
      ]),
    ).toEqual([
      "|core/docs/components:{button.md,dialog.md[Modal]}",
      "|core/docs/patterns:{forms.md}",
      "|lab/docs/components/layouts:{deck-layout.md[Slide deck;Step content]}",
    ]);
  });

  it("keeps the index syntax intact when names contain its delimiters", () => {
    expect(
      indexLines([
        {
          directory: "core",
          pages: [
            { path: "tokens.md", aliases: ["a, b", "c|d", "[e]", 3] },
            { title: "No path" },
          ],
        },
      ]),
    ).toEqual(["|core/docs:{tokens.md[a b;c d;e]}"]);
  });
});

describe("findDocs", () => {
  it("finds docs installed above the project, as in a workspace", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
      "apps/web/package.json": "{}",
    });
    expect(findDocs(path.join(root, "apps/web"))).toEqual({
      scopeDir: path.join(root, "node_modules/@salt-ds"),
      root: "../../node_modules/@salt-ds",
    });
  });

  it("prefers the docs next to the script that was run", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
      "apps/web/node_modules/@salt-ds/core/docs/index.md": "",
    });
    expect(
      findDocs(
        root,
        path.join(
          root,
          "apps/web/node_modules/@salt-ds/core/docs/agents-md.mjs",
        ),
      )?.root,
    ).toBe("apps/web/node_modules/@salt-ds");
  });

  it("finds nothing when Salt is not installed", async () => {
    const root = await createProject();
    expect(findDocs(root)).toBeUndefined();
  });
});

describe("readManifests", () => {
  it("reads the manifest of each installed package and skips the rest", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/manifest.json": coreManifest,
      "node_modules/@salt-ds/lab/docs/manifest.json": "not json",
      "node_modules/@salt-ds/icons/package.json": "{}",
    });
    expect(readManifests(path.join(root, "node_modules/@salt-ds"))).toEqual([
      { directory: "core", pages: JSON.parse(coreManifest).pages },
    ]);
  });
});

describe("run", () => {
  it("writes the docs index to AGENTS.md and imports it in CLAUDE.md", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
      "node_modules/@salt-ds/core/docs/manifest.json": coreManifest,
      "node_modules/@salt-ds/lab/docs/manifest.json": labManifest,
      "CLAUDE.md": "# Claude\n",
    });
    const log = [];
    const options = { log: (line) => log.push(line) };

    expect(run(["--check", "--dir", root], options)).toBe(1);
    expect(run(["--dir", root], options)).toBe(0);
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).toBe(
      `${agentsBlock({
        root: "node_modules/@salt-ds",
        lines: [
          "|core/docs/components:{button.md,dialog.md[Modal]}",
          "|core/docs/patterns:{forms.md}",
          "|lab/docs/components/layouts:{deck-layout.md[Slide deck;Step content]}",
        ],
      })}\n`,
    );
    expect(await readFile(path.join(root, "CLAUDE.md"), "utf8")).toBe(
      "# Claude\n\n@AGENTS.md\n",
    );
    expect(run(["--check", `--dir=${root}`], options)).toBe(0);
    expect(log).toContain("Created AGENTS.md.");
    expect(log).toContain("Updated CLAUDE.md.");
    expect(log.at(-1)).toBe("CLAUDE.md is up to date.");
  });

  it("reports the block as stale when the installed docs change", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
      "node_modules/@salt-ds/core/docs/manifest.json": coreManifest,
    });
    const options = { log: () => {} };
    expect(run(["--dir", root, "--no-claude"], options)).toBe(0);
    await writeFile(
      path.join(root, "node_modules/@salt-ds/core/docs/manifest.json"),
      manifest([{ path: "components/tabs.md", title: "Tabs" }]),
    );
    expect(run(["--check", "--dir", root, "--no-claude"], options)).toBe(1);
  });

  it("fails without installed Salt docs", async () => {
    const root = await createProject();
    expect(() => run(["--dir", root], { log: () => {} })).toThrow(
      "Cannot find the Salt docs",
    );
  });

  it("can leave CLAUDE.md alone", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
    });
    run(["--dir", root, "--no-claude"], { log: () => {} });
    await expect(readFile(path.join(root, "CLAUDE.md"))).rejects.toThrow();
  });

  it("leaves a CLAUDE.md that links to AGENTS.md alone", async () => {
    const root = await createProject({
      "AGENTS.md": "# Rules\n",
      "node_modules/@salt-ds/core/docs/index.md": "",
    });
    await symlink("AGENTS.md", path.join(root, "CLAUDE.md"));
    const log = [];
    expect(run(["--dir", root], { log: (line) => log.push(line) })).toBe(0);
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).not.toContain(
      "@AGENTS.md",
    );
    expect(log).toContain("CLAUDE.md is the same file as AGENTS.md.");
  });

  it("names the file when its block is incomplete", async () => {
    const root = await createProject({
      "AGENTS.md": "<!-- BEGIN:salt-ds-agent-docs -->\n",
      "node_modules/@salt-ds/core/docs/index.md": "",
    });
    expect(() => run(["--dir", root], { log: () => {} })).toThrow(
      "AGENTS.md: Found an incomplete Salt block.",
    );
  });

  it("prints help and rejects unknown arguments", () => {
    const log = [];
    expect(run(["--help"], { log: (line) => log.push(line) })).toBe(0);
    expect(log[0]).toContain("--no-claude");
    expect(() => run(["--force"], { log: () => {} })).toThrow(
      "Unknown argument: --force",
    );
  });
});
