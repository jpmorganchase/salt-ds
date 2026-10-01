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
  indexPathFor,
  run,
  upsertBlock,
  withClaudeImport,
} from "../agents-md.mjs";
import { REPOSITORY_ROOT } from "../generate.mjs";

const block = agentsBlock("node_modules/@salt-ds/core/docs/index.md");
const roots = [];

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
    const stale = upsertBlock("# Rules\n", agentsBlock("old/index.md"));
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

describe("indexPathFor", () => {
  it("finds docs installed above the project, as in a workspace", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
      "apps/web/package.json": "{}",
    });
    expect(indexPathFor(path.join(root, "apps/web"))).toBe(
      "../../node_modules/@salt-ds/core/docs/index.md",
    );
  });

  it("prefers the docs next to the script that was run", async () => {
    const root = await createProject({
      "apps/web/node_modules/@salt-ds/core/docs/index.md": "",
    });
    expect(
      indexPathFor(
        root,
        path.join(
          root,
          "apps/web/node_modules/@salt-ds/core/docs/agents-md.mjs",
        ),
      ),
    ).toBe("apps/web/node_modules/@salt-ds/core/docs/index.md");
  });

  it("falls back to the usual location", async () => {
    const root = await createProject();
    expect(indexPathFor(root)).toBe("node_modules/@salt-ds/core/docs/index.md");
  });
});

describe("run", () => {
  it("writes AGENTS.md and CLAUDE.md, then reports them up to date", async () => {
    const root = await createProject({
      "node_modules/@salt-ds/core/docs/index.md": "",
      "CLAUDE.md": "# Claude\n",
    });
    const log = [];
    const options = { log: (line) => log.push(line) };

    expect(run(["--check", "--dir", root], options)).toBe(1);
    expect(run(["--dir", root], options)).toBe(0);
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).toBe(
      `${block}\n`,
    );
    expect(await readFile(path.join(root, "CLAUDE.md"), "utf8")).toBe(
      "# Claude\n\n@AGENTS.md\n",
    );
    expect(run(["--check", `--dir=${root}`], options)).toBe(0);
    expect(log).toContain("Created AGENTS.md.");
    expect(log).toContain("Updated CLAUDE.md.");
    expect(log.at(-1)).toBe("CLAUDE.md is up to date.");
  });

  it("can leave CLAUDE.md alone", async () => {
    const root = await createProject();
    run(["--dir", root, "--no-claude"], { log: () => {} });
    await expect(readFile(path.join(root, "CLAUDE.md"))).rejects.toThrow();
  });

  it("leaves a CLAUDE.md that links to AGENTS.md alone", async () => {
    const root = await createProject({ "AGENTS.md": "# Rules\n" });
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

describe("core README", () => {
  it("shows the same block that the script writes", async () => {
    const readme = await readFile(
      path.join(REPOSITORY_ROOT, "packages/core/README.md"),
      "utf8",
    );
    expect(readme).toContain(block);
  });
});
