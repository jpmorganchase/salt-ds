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
  checkCommand,
  discoverManifests,
  indexLines,
  run,
  upsertBlock,
  withClaudeImport,
} from "../lib/agents-md.mjs";

const roots = [];
const quiet = { log: () => {} };
const cliRoot = fileURLToPath(new URL("..", import.meta.url));
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

const guidePages = [
  {
    path: "getting-started/choosing-the-right-primitive.md",
    title: "Choosing the right primitive",
  },
  {
    path: "getting-started/composition-pitfalls.md",
    title: "Composition pitfalls",
  },
  {
    path: "getting-started/fixing-accessibility.md",
    title: "Fixing accessibility",
  },
];

function addGuides(packageDir, pages = guidePages) {
  for (const page of pages) write(packageDir, `docs/${page.path}`, page.title);
  changeManifest(packageDir, (manifest) => manifest.pages.push(...pages));
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
    expect(content).toContain(
      "|apps/web/node_modules/@salt-ds/core/docs/components:",
    );
    expect(content).not.toContain("|node_modules/@salt-ds/core/");
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
      "|node_modules/@salt-ds/core/docs/components:{button.md}",
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
      const docsPath = content.match(/\|(.+)\/components:\{button\.md\}/)[1];
      expect(docsPath).toBe(
        `${separateOutput ? ".." : "../.."}/node_modules/@salt-ds/core/docs`,
      );
      // The repository's Core (2.0.0), not the one above it (1.0.0).
      expect(
        JSON.parse(
          readFileSync(path.join(output, docsPath, "../package.json"), "utf8"),
        ).version,
      ).toBe("2.0.0");
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

  it("uses the target application rather than where the CLI is installed", async () => {
    const root = project();
    // As npx runs a copy from its cache, beside other Salt packages.
    const cache = project();
    install(root, "core", { version: "4.0.0" });
    install(cache, "core", { version: "9.0.0" });
    const cli = path.join(cache, "node_modules/@salt-ds/cli");
    for (const entry of ["bin", "lib", "package.json"]) {
      cpSync(path.join(cliRoot, entry), path.join(cli, entry), {
        recursive: true,
      });
    }
    await execFile(
      process.execPath,
      [path.join(cli, "bin/salt-ds.mjs"), "init"],
      {
        cwd: root,
      },
    );
    const content = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(content).toContain(
      "|node_modules/@salt-ds/core/docs/components:{button.md}",
    );
    expect(content).not.toContain(cache);
    expect(existsSync(path.join(cache, "AGENTS.md"))).toBe(false);
  });

  it("reports a useful error for an empty project", () => {
    const root = project();
    expect(() => run(["--project", root], quiet)).toThrow("--project");
    expect(existsSync(path.join(root, "AGENTS.md"))).toBe(false);
  });
});

describe("task guidance", () => {
  it("points accessibility repairs to the selected app's guide for AGENTS and Copilot", () => {
    const root = project();
    mkdirSync(path.join(root, ".git"));
    const app = path.join(root, "apps/web");
    const output = path.join(root, "instructions");
    mkdirSync(output);
    addGuides(install(root, "core", { version: "1.0.0" }));
    addGuides(install(app, "core", { version: "2.0.0" }));
    const args = ["--project", app, "--dir", output, "--copilot"];

    expect(run(args, quiet)).toBe(0);
    const agents = readFileSync(path.join(output, "AGENTS.md"), "utf8");
    const copilot = readFileSync(
      path.join(root, ".github/copilot-instructions.md"),
      "utf8",
    );
    const guide = `apps/web/node_modules/@salt-ds/core/docs/${guidePages[2].path}`;
    expect(readFileSync(path.join(root, guide), "utf8")).toBe(
      guidePages[2].title,
    );
    for (const [content, prefix] of [
      [agents, "../"],
      [copilot, ""],
    ]) {
      expect(content).toContain(
        `For an accessibility repair or a failing accessibility check, also read \`${prefix}${guide}\` and the affected components' accessibility guidance.`,
      );
      // The other guides are in the index, without a route of their own.
      for (const page of guidePages.slice(0, 2)) {
        expect(content).not.toContain(`docs/${page.path}`);
      }
      expect(content).toContain("Guide and index paths are relative to");
    }
    expect(run([...args, "--check"], quiet)).toBe(0);
    expect(run(args, quiet)).toBe(0);
    expect(readFileSync(path.join(output, "AGENTS.md"), "utf8")).toBe(agents);
    expect(
      readFileSync(path.join(root, ".github/copilot-instructions.md"), "utf8"),
    ).toBe(copilot);
  });

  it("leaves the accessibility line out for older packages without borrowing newer guides", () => {
    const root = project();
    const app = path.join(root, "apps/web");
    addGuides(install(root, "core", { version: "2.0.0" }));
    install(app, "core", { version: "1.0.0" });

    expect(run(["--project", app], quiet)).toBe(0);
    const content = readFileSync(path.join(app, "AGENTS.md"), "utf8");
    for (const page of guidePages) expect(content).not.toContain(page.path);
    expect(content).not.toContain("accessibility repair");
    expect(content).toContain("Index paths are relative to");
    expect(content).not.toContain("undefined");
  });

  it("adds only guides present in the upgraded manifest", () => {
    const root = project();
    const core = install(root);
    run(["--project", root], quiet);
    addGuides(core, [guidePages[2]]);

    expect(run(["--project", root, "--check"], quiet)).toBe(1);
    expect(run(["--project", root], quiet)).toBe(0);
    const content = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(content).toContain(
      "`node_modules/@salt-ds/core/docs/getting-started/fixing-accessibility.md`",
    );
    expect(content).not.toContain(guidePages[0].path);
    expect(content).not.toContain(guidePages[1].path);
    expect(run(["--project", root, "--check"], quiet)).toBe(0);
  });

  it("rejects a listed guide missing from the package before updating files", () => {
    const root = project();
    const core = install(root);
    run(["--project", root], quiet);
    const before = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    changeManifest(core, (manifest) => manifest.pages.push(guidePages[2]));

    expect(() => run(["--project", root], quiet)).toThrow(
      "Missing documentation file:",
    );
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(before);
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
      "missing schema",
      (manifest) => {
        delete manifest.schemaVersion;
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

  it("needs no update for a new installed version with the same pages", () => {
    const root = project();
    install(root);
    run(["--project", root], quiet);
    const before = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    install(root, "core", { version: "1.0.1" });
    expect(run(["--project", root, "--check"], quiet)).toBe(0);
    expect(run(["--project", root], quiet)).toBe(0);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(before);
    expect(before).not.toContain("1.0.0");
  });

  it("detects a changed page list after an upgrade", () => {
    const root = project();
    const core = install(root);
    run(["--project", root], quiet);
    install(root, "core", { version: "1.1.0" });
    write(core, "docs/components/dialog.md", "# Dialog");
    changeManifest(core, (manifest) => {
      manifest.pages.push({ path: "components/dialog.md", title: "Dialog" });
    });
    expect(run(["--project", root, "--check"], quiet)).toBe(1);
    expect(run(["--project", root], quiet)).toBe(0);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toContain(
      "|node_modules/@salt-ds/core/docs/components:{button.md,dialog.md}",
    );
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

describe("salt-check instruction", () => {
  const withCheck = (packageDir) =>
    write(
      packageDir,
      "docs/salt-check.json",
      JSON.stringify({ schemaVersion: 1 }),
    );

  it("finds check data through a symlinked instructions folder at another depth", () => {
    const root = project();
    const app = path.join(root, "app");
    mkdirSync(app);
    withCheck(install(root));
    // The link is deeper than the folder it points to, so the docs path,
    // relative to the real folder, doesn't resolve from the link.
    const link = path.join(root, "a/b/app-link");
    mkdirSync(path.dirname(link), { recursive: true });
    symlinkSync(app, link, "junction");
    expect(run(["--project", app, "--dir", link], quiet)).toBe(0);
    expect(readFileSync(path.join(app, "AGENTS.md"), "utf8")).toContain(
      "run `npx @salt-ds/cli check --changed` from this file's folder",
    );
  });

  it("names the check command when the packages ship check data, and the manual checks otherwise", () => {
    const root = project();
    withCheck(install(root));
    run(["--project", root], quiet);
    const content = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(content).toContain(
      "Before you finish, run `npx @salt-ds/cli check --changed` from this file's folder and fix what it reports",
    );
    expect(content).not.toContain("check each Salt prop against");

    const older = project();
    install(older);
    run(["--project", older], quiet);
    expect(readFileSync(path.join(older, "AGENTS.md"), "utf8")).toContain(
      "check each Salt prop against its component page's props table",
    );
  });

  it("gives commands that work from each instruction file's base", () => {
    const root = project();
    mkdirSync(path.join(root, ".git"));
    const app = path.join(root, "apps/web");
    withCheck(install(app));
    run(["--project", app, "--copilot"], quiet);
    expect(readFileSync(path.join(app, "AGENTS.md"), "utf8")).toContain(
      "run `npx @salt-ds/cli check --changed` from this file's folder",
    );
    expect(
      readFileSync(path.join(root, ".github/copilot-instructions.md"), "utf8"),
    ).toContain(
      "run `npx @salt-ds/cli check --project apps/web --changed` from the repository root",
    );

    run(["--project", app, "--dir", root, "--no-claude"], quiet);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toContain(
      "run `npx @salt-ds/cli check --project apps/web --changed` from this file's folder",
    );
  });
});

describe("check command", () => {
  it("quotes an application path a shell would split", () => {
    expect(checkCommand({ base: "/repo", project: "/repo/apps/web" })).toBe(
      "npx @salt-ds/cli check --project apps/web --changed",
    );
    expect(checkCommand({ base: "/repo", project: "/repo/apps/my app" })).toBe(
      'npx @salt-ds/cli check --project "apps/my app" --changed',
    );
    expect(checkCommand({ base: "/repo", project: "/repo" })).toBe(
      "npx @salt-ds/cli check --changed",
    );
  });
});

describe("GitHub Copilot instructions", () => {
  const copilotFile = (root) =>
    path.join(root, ".github", "copilot-instructions.md");

  it("is only written with --copilot", () => {
    const root = project();
    mkdirSync(path.join(root, ".git"));
    install(root);
    expect(run(["--project", root], quiet)).toBe(0);
    expect(existsSync(path.join(root, ".github"))).toBe(false);
  });

  it("adds the index to the repository's file, keeping its other instructions", () => {
    const root = project();
    mkdirSync(path.join(root, ".git"));
    install(root);
    write(root, ".github/copilot-instructions.md", "# Team rules\n");

    const log = [];
    expect(
      run(["--project", root, "--copilot"], { log: (line) => log.push(line) }),
    ).toBe(0);
    expect(log).toContain("Updated .github/copilot-instructions.md.");
    const content = readFileSync(copilotFile(root), "utf8");
    expect(content).toMatch(
      /^# Team rules\n\n<!-- BEGIN:salt-ds-agent-docs -->/,
    );
    expect(content).toContain(
      "Index paths are relative to `root`, which is relative to the repository root.",
    );
    expect(content).toContain(
      "[Salt docs index]|root: .\n|node_modules/@salt-ds/core/docs/components:{button.md}",
    );
    // AGENTS.md keeps paths relative to itself.
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toContain(
      "which is relative to this file.",
    );

    expect(run(["--project", root, "--copilot", "--check"], quiet)).toBe(0);
    expect(run(["--project", root, "--copilot"], quiet)).toBe(0);
    expect(readFileSync(copilotFile(root), "utf8")).toBe(content);
  });

  it("indexes an application's packages relative to the repository root", () => {
    const root = project();
    // A worktree or submodule has a .git file rather than a folder.
    write(root, ".git", "gitdir: ../main/.git/worktrees/root\n");
    const app = path.join(root, "apps/web");
    install(app);
    install(root, "theme");

    expect(run(["--project", app, "--copilot"], quiet)).toBe(0);
    const content = readFileSync(copilotFile(root), "utf8");
    expect(content).toContain(
      "|apps/web/node_modules/@salt-ds/core/docs/components:{button.md}",
    );
    expect(content).toContain(
      "|node_modules/@salt-ds/theme/docs/components:{button.md}",
    );
    expect(existsSync(path.join(app, ".github"))).toBe(false);
    expect(readFileSync(path.join(app, "AGENTS.md"), "utf8")).toContain(
      "|../../node_modules/@salt-ds/theme/docs/components:",
    );
  });

  it("uses --dir outside a Git repository", () => {
    const root = project();
    install(root);
    expect(run(["--project", root, "--copilot"], quiet)).toBe(0);
    expect(readFileSync(copilotFile(root), "utf8")).toContain(
      "|node_modules/@salt-ds/core/docs/components:{button.md}",
    );
  });

  it("reports a missing file with --check without creating it", () => {
    const root = project();
    mkdirSync(path.join(root, ".git"));
    install(root);
    run(["--project", root], quiet);
    const log = [];
    expect(
      run(["--project", root, "--copilot", "--check"], {
        log: (line) => log.push(line),
      }),
    ).toBe(1);
    expect(log).toContain(".github/copilot-instructions.md needs updating.");
    expect(existsSync(path.join(root, ".github"))).toBe(false);
  });

  it("leaves a Copilot file that is AGENTS.md to the AGENTS.md block", () => {
    const root = project();
    mkdirSync(path.join(root, ".git"));
    install(root);
    mkdirSync(path.join(root, ".github"));
    symlinkSync("../AGENTS.md", copilotFile(root));
    const log = [];
    expect(
      run(["--project", root, "--copilot", "--no-claude"], {
        log: (line) => log.push(line),
      }),
    ).toBe(0);
    expect(log).toContain(
      ".github/copilot-instructions.md is the same file as AGENTS.md.",
    );
    expect(readFileSync(copilotFile(root), "utf8")).toContain(
      "which is relative to this file.",
    );
    expect(
      run(["--project", root, "--copilot", "--no-claude", "--check"], quiet),
    ).toBe(0);
  });
});

describe("compressed index", () => {
  it("keeps core first and makes aliases safe", () => {
    expect(
      indexLines([
        {
          name: "@salt-ds/theme",
          docsPath: "theme/docs",
          pages: [{ path: "tokens.md" }],
        },
        {
          name: "@salt-ds/core",
          docsPath: "core/docs",
          pages: [
            { path: "components/button.md", aliases: ["a,b", "c|d", "[e]"] },
          ],
        },
      ]),
    ).toEqual([
      "|core/docs/components:{button.md[a b;c d;e]}",
      "|theme/docs:{tokens.md}",
    ]);
  });
});
