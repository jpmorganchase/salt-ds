import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { run } from "../lib/cli.mjs";

const roots = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function write(root, name, content) {
  const file = path.join(root, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    typeof content === "string" ? content : JSON.stringify(content),
  );
}

/** An application with Salt packages that ship agent docs, and optionally check data. */
function project({
  manifest = { name: "app", scripts: { typecheck: "tsc --noEmit" } },
  withCheckData = true,
} = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "salt-ds-cli-test-"));
  roots.push(root);
  write(root, "package.json", `${JSON.stringify(manifest, null, 2)}\n`);
  for (const [directory, version, data] of [
    [
      "core",
      "1.73.0",
      {
        components: {
          Button: {
            page: "components/button.md",
            deprecatedProps: { variant: "Use `appearance` instead." },
          },
        },
      },
    ],
    [
      "theme",
      "1.48.0",
      {
        pages: ["tokens.md"],
        tokens: {
          "--salt-size-fixed-100": ["current", 0],
          "--salt-size-border": ["deprecated", 0, ["--salt-size-fixed-100"]],
        },
      },
    ],
  ]) {
    const name = `@salt-ds/${directory}`;
    const docs = path.join(root, "node_modules", "@salt-ds", directory, "docs");
    write(root, `node_modules/${name}/package.json`, { name, version });
    write(docs, "index.md", `# ${name}`);
    write(docs, "components/button.md", "# Button");
    write(docs, "manifest.json", {
      schemaVersion: 1,
      name,
      version,
      pages: [{ path: "components/button.md", title: "Button" }],
    });
    if (withCheckData) {
      write(docs, "salt-check.json", {
        schemaVersion: 1,
        name,
        version,
        ...data,
      });
    }
  }
  return root;
}

async function salt(root, args) {
  const log = [];
  const code = await run(args, { cwd: root, log: (line) => log.push(line) });
  return { code, log };
}

const readManifest = (root) =>
  JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

describe("salt-ds init", () => {
  it("sets up AGENTS.md with the check command and suggests --script", async () => {
    const root = project();
    const { code, log } = await salt(root, ["init", "--project", root]);
    expect(code).toBe(0);
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).toContain(
      "run `npx @salt-ds/cli check --changed` from this file's folder",
    );
    expect(log).toContain("Created AGENTS.md.");
    expect(log.at(-1)).toBe(
      "Add --script typecheck (or lint) to run salt-ds check whenever that script runs, in CI or by an agent.",
    );
  });

  it("adds salt-ds check to a script once, and creates the script when missing", async () => {
    const root = project();
    let result = await salt(root, [
      "init",
      "--project",
      root,
      "--script",
      "typecheck",
    ]);
    expect(result.code).toBe(0);
    expect(readManifest(root).scripts.typecheck).toBe(
      "tsc --noEmit && salt-ds check",
    );
    expect(result.log).toContain(
      "Updated the typecheck script to run salt-ds check.",
    );
    expect(result.log.at(-1)).toBe(
      "Add @salt-ds/cli to devDependencies so the typecheck script can run salt-ds, for example with npm install --save-dev @salt-ds/cli.",
    );

    result = await salt(root, [
      "init",
      "--project",
      root,
      "--script=typecheck",
      "--check",
    ]);
    expect(result.code).toBe(0);
    expect(result.log).toContain("The typecheck script runs salt-ds check.");
    expect(readManifest(root).scripts.typecheck).toBe(
      "tsc --noEmit && salt-ds check",
    );

    result = await salt(root, ["init", "--project", root, "--script", "lint"]);
    expect(readManifest(root).scripts).toEqual({
      typecheck: "tsc --noEmit && salt-ds check",
      lint: "salt-ds check",
    });
  });

  it("recognises a script that already runs the check through npx", async () => {
    for (const lint of [
      "npx @salt-ds/cli check --changed",
      "eslint . && npx @salt-ds/cli@1.0.0 check",
    ]) {
      const root = project({ manifest: { name: "app", scripts: { lint } } });
      for (const extra of [[], ["--check"]]) {
        const result = await salt(root, [
          "init",
          "--project",
          root,
          "--script",
          "lint",
          ...extra,
        ]);
        expect(result.code).toBe(0);
        expect(result.log).toContain("The lint script runs salt-ds check.");
      }
      expect(readManifest(root).scripts.lint).toBe(lint);
    }
  });

  it("writes nothing when --script's package.json is missing or broken", async () => {
    const root = project();
    writeFileSync(path.join(root, "package.json"), "{ not json");
    const { code, log } = await salt(root, [
      "init",
      "--project",
      root,
      "--script",
      "typecheck",
    ]);
    expect(code).toBe(2);
    expect(log[0]).toMatch(/^salt-ds: Cannot read .*package\.json: /);
    expect(existsSync(path.join(root, "AGENTS.md"))).toBe(false);
    expect(existsSync(path.join(root, "CLAUDE.md"))).toBe(false);
  });

  it("reports a script that needs the check with --check, without changing it", async () => {
    const root = project({
      manifest: { name: "app", devDependencies: { "@salt-ds/cli": "^0.1.0" } },
    });
    await salt(root, ["init", "--project", root]);
    const { code, log } = await salt(root, [
      "init",
      "--project",
      root,
      "--check",
      "--script",
      "lint",
    ]);
    expect(code).toBe(1);
    expect(log).toContain("The lint script needs to run salt-ds check.");
    expect(readManifest(root).scripts).toBeUndefined();
  });

  it("keeps the package.json's indentation and line endings", async () => {
    const root = project();
    writeFileSync(
      path.join(root, "package.json"),
      '{\r\n\t"name": "app",\r\n\t"devDependencies": { "@salt-ds/cli": "^0.1.0" }\r\n}\r\n',
    );
    const { log } = await salt(root, [
      "init",
      "--project",
      root,
      "--no-claude",
      "--script",
      "lint",
    ]);
    expect(readFileSync(path.join(root, "package.json"), "utf8")).toBe(
      '{\r\n\t"name": "app",\r\n\t"devDependencies": {\r\n\t\t"@salt-ds/cli": "^0.1.0"\r\n\t},\r\n\t"scripts": {\r\n\t\t"lint": "salt-ds check"\r\n\t}\r\n}\r\n',
    );
    expect(log.at(-1)).toBe("Added the lint script to run salt-ds check.");
  });
});

describe("salt-ds check", () => {
  it("checks the application against the installed packages' data", async () => {
    const root = project();
    write(root, "src/app.css", ".a { padding: var(--salt-size-border); }\n");
    const { code, log } = await salt(root, ["check", "src"]);
    expect(code).toBe(1);
    expect(log).toEqual([
      "salt-check: TypeScript isn't installed for this application, so prop and part checks are skipped.",
      "src/app.css:1:19: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens.md.",
      "salt-check: checked 1 file: 1 error, 0 warnings.",
    ]);
  });
});

describe("salt-ds", () => {
  it("explains what's missing without Salt docs, and falls back for Salt without check data", async () => {
    const empty = mkdtempSync(path.join(tmpdir(), "salt-ds-cli-test-"));
    roots.push(empty);
    const init = await salt(empty, ["init"]);
    expect(init.code).toBe(2);
    expect(init.log[0]).toMatch(
      /^salt-ds: No installed Salt documentation found/,
    );
    const check = await salt(empty, ["check"]);
    expect(check.code).toBe(2);
    expect(check.log[0]).toMatch(
      /^salt-check: No installed Salt packages with agent docs found/,
    );

    // Older Salt with docs but no check data: the manual checks instead.
    const older = project({ withCheckData: false });
    expect((await salt(older, ["init"])).code).toBe(0);
    expect(readFileSync(path.join(older, "AGENTS.md"), "utf8")).toContain(
      "check each Salt prop against its component page's props table",
    );
  });

  it("prints help, its version, and rejects unknown commands", async () => {
    const root = project();
    expect((await salt(root, ["--help"])).code).toBe(0);
    expect((await salt(root, [])).code).toBe(2);
    expect((await salt(root, ["--version"])).log).toEqual(["0.0.0"]);
    const unknown = await salt(root, ["deploy"]);
    expect(unknown.code).toBe(2);
    expect(unknown.log[0]).toMatch(/^salt-ds: Unknown command: deploy/);
    const initHelp = await salt(root, ["init", "--help"]);
    expect(initHelp.log[0]).toContain("Usage: salt-ds init");
    expect(initHelp.log[0]).toContain("--script <name>");
    const checkHelp = await salt(root, ["check", "--help"]);
    expect(checkHelp.log[0]).toContain("Usage: salt-ds check");
  });
});
