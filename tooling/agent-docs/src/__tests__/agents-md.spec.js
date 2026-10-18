import { execFile as execFileCallback } from "node:child_process";
import {
  cpSync,
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import {
  agentsBlock,
  discoverManifests,
  indexLines,
  run,
  upsertBlock,
  withClaudeImport,
} from "../agents-md.mjs";

const roots = [];
const quiet = { log: () => {} };
const scriptPath = fileURLToPath(new URL("../agents-md.mjs", import.meta.url));
const execFile = promisify(execFileCallback);

function project() {
  const root = mkdtempSync(path.join(tmpdir(), "salt-agent-docs-test-"));
  roots.push(root);
  return root;
}

function write(root, name, content) {
  const file = path.join(root, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function install(
  root,
  directory = "core",
  { version = "1.0.0", docs = true } = {},
) {
  const packageDir = path.join(root, "node_modules", "@salt-ds", directory);
  const name = `@salt-ds/${directory}`;
  write(packageDir, "package.json", JSON.stringify({ name, version }));
  if (docs) {
    write(packageDir, "docs/index.md", `# ${name}`);
    write(packageDir, "docs/components/button.md", "# Button");
    write(
      packageDir,
      "docs/manifest.json",
      JSON.stringify({
        schemaVersion: 1,
        name,
        version,
        pages: [{ path: "components/button.md", title: "Button" }],
      }),
    );
  }
  return packageDir;
}

function changeManifest(packageDir, update) {
  const file = path.join(packageDir, "docs/manifest.json");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  update(manifest);
  writeFileSync(file, JSON.stringify(manifest));
}

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("application package discovery", () => {
  it("indexes mixed hoisting and selects the application's nearest version", () => {
    const root = project();
    const app = path.join(root, "apps/web");
    install(root, "core", { version: "1.0.0" });
    install(app, "core", { version: "2.0.0" });
    install(root, "theme", { version: "3.0.0" });
    install(root, "lab");
    install(root, "styles", { docs: false });

    expect(run(["--project", app, "--dir", root], quiet)).toBe(0);
    const content = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(content).toContain("[Salt docs index]|root: .");
    expect(content).toContain("[Package @salt-ds/core@2.0.0]");
    expect(content).not.toContain("[Package @salt-ds/core@1.0.0]");
    expect(content).toContain(
      "|apps/web/node_modules/@salt-ds/core/docs/components:",
    );
    expect(content).toContain("|node_modules/@salt-ds/theme/docs/components:");
    expect(content).toContain("|node_modules/@salt-ds/lab/docs/components:");
    expect(content).not.toContain("|node_modules/@salt-ds/styles/");
    expect(run(["--project", app, "--dir", root, "--check"], quiet)).toBe(0);
  });

  it("defaults instruction files to the selected application", () => {
    const root = project();
    const app = path.join(root, "apps/web");
    install(root, "theme");
    install(app);
    run(["--project", app], quiet);
    expect(existsSync(path.join(root, "AGENTS.md"))).toBe(false);
    const content = readFileSync(path.join(app, "AGENTS.md"), "utf8");
    expect(content).toContain("|node_modules/@salt-ds/core/docs/components:");
    expect(content).toContain(
      "|../../node_modules/@salt-ds/theme/docs/components:",
    );
  });

  it("uses --dir as the application when --project is not specified", () => {
    const root = project();
    install(root);
    expect(run(["--dir", root], quiet)).toBe(0);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toContain(
      "[Package @salt-ds/core@1.0.0]",
    );
  });

  it.each([false, true])(
    "resolves a symlinked application and emits usable paths (separate linked output: %s)",
    (separateOutput) => {
      const root = project();
      const repo = path.join(root, "repo");
      const app = path.join(repo, "apps/web");
      mkdirSync(app, { recursive: true });
      install(root, "core", { version: "1.0.0" });
      install(repo, "core", { version: "2.0.0" });
      const linkedApp = path.join(root, "web-link");
      symlinkSync(app, linkedApp, "junction");
      const args = ["--project", linkedApp];
      let output = app;
      if (separateOutput) {
        output = path.join(repo, "instructions");
        mkdirSync(output);
        const linkedOutput = path.join(root, "instructions-link");
        symlinkSync(output, linkedOutput, "junction");
        args.push("--dir", linkedOutput);
      }

      expect(run(args, quiet)).toBe(0);
      const content = readFileSync(path.join(output, "AGENTS.md"), "utf8");
      expect(content).toContain("[Package @salt-ds/core@2.0.0]");
      expect(content).not.toContain("[Package @salt-ds/core@1.0.0]");
      const docsPath = content.match(
        /\[Package @salt-ds\/core@2\.0\.0\]\|docs: (.+)/,
      )[1];
      expect(docsPath).toBe(
        `${separateOutput ? ".." : "../.."}/node_modules/@salt-ds/core/docs`,
      );
      expect(
        readFileSync(
          path.join(output, docsPath, "components/button.md"),
          "utf8",
        ),
      ).toBe("# Button");
      expect(run([...args, "--check"], quiet)).toBe(0);
    },
  );

  it("does not replace a nearer undocumented package with an older hoisted one", () => {
    const root = project();
    const app = path.join(root, "apps/web");
    install(app);
    install(app, "theme", { docs: false });
    install(root, "theme");
    expect(discoverManifests(app).map(({ name }) => name)).toEqual([
      "@salt-ds/core",
    ]);
  });

  it("fails for undocumented Core instead of falling back to another version", () => {
    const root = project();
    const app = path.join(root, "apps/web");
    install(app, "core", { docs: false });
    install(root);
    expect(() => run(["--project", app], quiet)).toThrow(
      "includes agent documentation",
    );
    expect(existsSync(path.join(app, "AGENTS.md"))).toBe(false);
  });

  it("keeps pnpm symlink paths instead of exposing the package store", () => {
    const root = project();
    const store = path.join(root, "node_modules/.pnpm/core@1.0.0");
    const storedCore = install(store);
    const scope = path.join(root, "node_modules/@salt-ds");
    mkdirSync(scope, { recursive: true });
    symlinkSync(
      path.relative(scope, storedCore),
      path.join(scope, "core"),
      "dir",
    );
    const [manifest] = discoverManifests(root);
    expect(manifest.docsPath).toBe("node_modules/@salt-ds/core/docs");
    expect(manifest.version).toBe("1.0.0");
  });

  it("uses the target application rather than the location of the script", async () => {
    const root = project();
    const cache = project();
    install(root, "core", { version: "4.0.0" });
    install(cache, "core", { version: "9.0.0" });
    const executable = path.join(
      cache,
      "node_modules/@salt-ds/core/docs/agents-md.mjs",
    );
    cpSync(scriptPath, executable);
    await execFile(process.execPath, [executable], { cwd: root });
    const content = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(content).toContain("[Package @salt-ds/core@4.0.0]");
    expect(content).not.toContain("9.0.0");
    expect(content).not.toContain(cache);
    expect(existsSync(path.join(cache, "AGENTS.md"))).toBe(false);
  });

  it("reports a useful error for an empty project", () => {
    const root = project();
    expect(() => run(["--project", root], quiet)).toThrow("--project");
    expect(existsSync(path.join(root, "AGENTS.md"))).toBe(false);
  });
});

describe("manifest validation", () => {
  it.each([
    [
      "schema",
      (manifest) => {
        manifest.schemaVersion = 2;
      },
    ],
    [
      "name",
      (manifest) => {
        manifest.name = "@salt-ds/other";
      },
    ],
    [
      "version",
      (manifest) => {
        manifest.version = "2.0.0";
      },
    ],
    [
      "pages",
      (manifest) => {
        manifest.pages = {};
      },
    ],
    [
      "empty pages",
      (manifest) => {
        manifest.pages = [];
      },
    ],
    [
      "path",
      (manifest) => {
        manifest.pages[0].path = "../outside.md";
      },
    ],
    [
      "title",
      (manifest) => {
        delete manifest.pages[0].title;
      },
    ],
    [
      "aliases",
      (manifest) => {
        manifest.pages[0].aliases = [3];
      },
    ],
    [
      "duplicate page",
      (manifest) => {
        manifest.pages.push(manifest.pages[0]);
      },
    ],
  ])("rejects invalid %s without changing instructions", (_name, update) => {
    const root = project();
    const core = install(root);
    write(root, "AGENTS.md", "# Existing instructions\n");
    changeManifest(core, update);
    expect(() => run(["--project", root], quiet)).toThrow(
      "Invalid documentation manifest",
    );
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(
      "# Existing instructions\n",
    );
    expect(existsSync(path.join(root, "CLAUDE.md"))).toBe(false);
  });

  it("accepts the previous manifest format without a schema version", () => {
    const root = project();
    const core = install(root);
    changeManifest(core, (manifest) => {
      delete manifest.schemaVersion;
    });
    expect(run(["--project", root], quiet)).toBe(0);
  });

  it.each(["index.md", "manifest.json", "components/button.md"])(
    "rejects a missing %s instead of writing an incomplete index",
    (file) => {
      const root = project();
      const core = install(root);
      rmSync(path.join(core, "docs", file));
      expect(() => run(["--project", root, "--check"], quiet)).toThrow();
      expect(existsSync(path.join(root, "AGENTS.md"))).toBe(false);
    },
  );

  it("rejects unreadable JSON in any doc-bearing package", () => {
    const root = project();
    install(root);
    const theme = install(root, "theme");
    write(theme, "docs/manifest.json", "not json");
    expect(() => run(["--project", root], quiet)).toThrow("Cannot read");
    expect(existsSync(path.join(root, "AGENTS.md"))).toBe(false);
  });
});

describe("instruction updates", () => {
  it("preserves existing instructions and line endings and is idempotent", () => {
    const root = project();
    install(root);
    write(root, "AGENTS.md", "# Existing instructions\r\n");
    write(root, "CLAUDE.md", "# Claude instructions\r\n");
    expect(run(["--project", root, "--check"], quiet)).toBe(1);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(
      "# Existing instructions\r\n",
    );
    expect(run(["--project", root], quiet)).toBe(0);
    const before = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(before).toMatch(/^# Existing instructions\r\n\r\n/);
    expect(before.replaceAll("\r\n", "")).not.toContain("\n");
    expect(readFileSync(path.join(root, "CLAUDE.md"), "utf8")).toBe(
      "# Claude instructions\r\n\r\n@AGENTS.md\r\n",
    );
    expect(run(["--project", root, "--check"], quiet)).toBe(0);
    expect(run(["--project", root], quiet)).toBe(0);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(before);
  });

  it("detects a changed installed version even when the page list stays the same", () => {
    const root = project();
    install(root);
    run(["--project", root], quiet);
    install(root, "core", { version: "1.0.1" });
    expect(run(["--project", root, "--check"], quiet)).toBe(1);
  });

  it("validates both output files before writing", () => {
    const root = project();
    install(root);
    write(root, "AGENTS.md", "# Existing\n");
    mkdirSync(path.join(root, "CLAUDE.md"));
    expect(() => run(["--project", root], quiet)).toThrow();
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(
      "# Existing\n",
    );
  });

  it("refuses an incomplete block without touching either file", () => {
    const root = project();
    install(root);
    const incomplete = "<!-- BEGIN:salt-ds-agent-docs -->\nMine.\n";
    write(root, "AGENTS.md", incomplete);
    expect(() => run(["--project", root], quiet)).toThrow(
      "AGENTS.md: Found an incomplete Salt block",
    );
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(incomplete);
    expect(existsSync(path.join(root, "CLAUDE.md"))).toBe(false);
  });

  it.each([true, false])(
    "keeps a CLAUDE.md symlink to AGENTS.md (target exists: %s)",
    (existing) => {
      const root = project();
      install(root);
      if (existing) write(root, "AGENTS.md", "# Existing\n");
      symlinkSync("AGENTS.md", path.join(root, "CLAUDE.md"));
      expect(run(["--project", root], quiet)).toBe(0);
      const content = readFileSync(path.join(root, "AGENTS.md"), "utf8");
      expect(content).toContain("## Salt Design System");
      expect(content).not.toContain("@AGENTS.md");
      expect(run(["--project", root, "--check"], quiet)).toBe(0);
    },
  );

  it("leaves CLAUDE.md alone with --no-claude", () => {
    const root = project();
    install(root);
    expect(run(["--project", root, "--no-claude"], quiet)).toBe(0);
    expect(existsSync(path.join(root, "CLAUDE.md"))).toBe(false);
    expect(run(["--project", root, "--no-claude", "--check"], quiet)).toBe(0);
  });

  it("preserves a dangling CLAUDE.md symlink chain when AGENTS.md is created", () => {
    const root = project();
    install(root);
    const agents = path.join(root, "AGENTS.md");
    const claude = path.join(root, "CLAUDE.md");
    symlinkSync("shared-rules.md", claude);
    symlinkSync("AGENTS.md", path.join(root, "shared-rules.md"));

    expect(run(["--project", root, "--check"], quiet)).toBe(1);
    expect(existsSync(agents)).toBe(false);
    expect(run(["--project", root], quiet)).toBe(0);
    const content = readFileSync(agents, "utf8");
    expect(content).toContain("<!-- BEGIN:salt-ds-agent-docs -->");
    expect(content).not.toContain("@AGENTS.md");
    expect(readFileSync(claude, "utf8")).toBe(content);
    expect(readlinkSync(claude)).toBe("shared-rules.md");
    expect(run(["--project", root, "--check"], quiet)).toBe(0);
    expect(run(["--project", root], quiet)).toBe(0);
    expect(readFileSync(agents, "utf8")).toBe(content);
  });

  it("preserves a dangling absolute CLAUDE.md link through a linked output directory", () => {
    const root = project();
    const app = path.join(root, "app");
    install(app);
    const linkedApp = path.join(root, "linked-app");
    symlinkSync(app, linkedApp, "junction");
    const agents = path.join(app, "AGENTS.md");
    const claude = path.join(app, "CLAUDE.md");
    symlinkSync(agents, claude);

    expect(run(["--project", linkedApp, "--check"], quiet)).toBe(1);
    expect(existsSync(agents)).toBe(false);
    expect(run(["--project", linkedApp], quiet)).toBe(0);
    const content = readFileSync(agents, "utf8");
    expect(content).toContain("<!-- BEGIN:salt-ds-agent-docs -->");
    expect(content).not.toContain("@AGENTS.md");
    expect(readFileSync(claude, "utf8")).toBe(content);
    expect(readlinkSync(claude)).toBe(agents);
    expect(run(["--project", linkedApp, "--check"], quiet)).toBe(0);
  });

  it("updates hard-linked instruction files once without a self-import", () => {
    const root = project();
    install(root);
    const agents = path.join(root, "AGENTS.md");
    const claude = path.join(root, "CLAUDE.md");
    write(root, "AGENTS.md", "# Existing instructions\n");
    linkSync(agents, claude);

    expect(run(["--project", root, "--check"], quiet)).toBe(1);
    expect(readFileSync(agents, "utf8")).toBe("# Existing instructions\n");
    expect(run(["--project", root], quiet)).toBe(0);
    const content = readFileSync(agents, "utf8");
    expect(content).toContain("# Existing instructions\n");
    expect(content).toContain("<!-- BEGIN:salt-ds-agent-docs -->");
    expect(content).not.toContain("@AGENTS.md");
    expect(readFileSync(claude, "utf8")).toBe(content);
    expect(statSync(agents).ino).toBe(statSync(claude).ino);
    expect(run(["--project", root, "--check"], quiet)).toBe(0);
    expect(run(["--project", root], quiet)).toBe(0);
    expect(readFileSync(agents, "utf8")).toBe(content);
  });

  it("updates only the marked block", () => {
    const old = agentsBlock({ root: "old", lines: [] });
    const next = agentsBlock({ lines: [] });
    expect(upsertBlock(`Before\n${old}\nAfter\n`, next)).toBe(
      `Before\n${next}\nAfter\n`,
    );
    expect(withClaudeImport("@AGENTS.md\n# Claude\n")).toBe(
      "@AGENTS.md\n# Claude\n",
    );
  });

  it("prints help and validates option values", () => {
    const log = [];
    expect(run(["--help"], { log: (line) => log.push(line) })).toBe(0);
    expect(log[0]).toContain("--project");
    for (const args of [
      ["--dir"],
      ["--project="],
      ["--dir", "--check"],
      ["--unknown"],
    ]) {
      expect(() => run(args, quiet)).toThrow();
    }
    const root = project();
    install(root);
    expect(
      run([`--project=${root}`, `--dir=${root}`, "--no-claude"], quiet),
    ).toBe(0);
  });
});

describe("compressed index", () => {
  it("keeps core first, aliases safe, and legacy generator entries supported", () => {
    expect(
      indexLines([
        { directory: "theme", pages: [{ path: "tokens.md" }] },
        {
          directory: "core",
          pages: [
            { path: "components/button.md", aliases: ["a,b", "c|d", "[e]", 3] },
          ],
        },
      ]),
    ).toEqual([
      "|core/docs/components:{button.md[a b;c d;e]}",
      "|theme/docs:{tokens.md}",
    ]);
  });
});
