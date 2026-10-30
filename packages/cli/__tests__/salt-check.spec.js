import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";
import { run } from "../lib/salt-check.mjs";

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

function install(root, directory, version, data) {
  const packageDir = path.join(root, "node_modules", "@salt-ds", directory);
  const name = `@salt-ds/${directory}`;
  write(packageDir, "package.json", { name, version });
  write(packageDir, "docs/index.md", `# ${name}`);
  write(packageDir, "docs/page.md", "# Page");
  write(packageDir, "docs/manifest.json", {
    schemaVersion: 1,
    name,
    version,
    pages: [{ path: "page.md", title: "Page" }],
  });
  if (data) {
    write(packageDir, "docs/salt-check.json", {
      schemaVersion: 1,
      name,
      version,
      ...data,
    });
  }
}

const THEME = {
  pages: [
    "tokens/characteristics.md",
    "tokens/deprecated.md",
    "tokens/palette.md",
  ],
  tokens: {
    "--salt-container-bold-borderColor": ["current", 0],
    "--salt-container-primary-borderColor": [
      "deprecated",
      1,
      ["--salt-container-bold-borderColor"],
    ],
    "--salt-content-primary-foreground": ["current", 0],
    "--salt-palette-corner-weak": ["current", 2],
    "--salt-palette-neutral-border": ["palette", 2],
    "--salt-size-border": ["deprecated", 1, ["--salt-size-fixed-100"]],
    "--salt-size-fixed-100": ["current", 0],
  },
};

const CORE = {
  components: {
    Button: {
      page: "components/button.md",
      deprecatedProps: { variant: "since 1.36.0. Use `appearance` instead." },
    },
    Toast: { page: "components/toast.md", parts: ["ToastContent"] },
    ToastContent: { page: "components/toast.md" },
  },
};

function project(files = {}, { theme = THEME, core = CORE } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "salt-check-test-"));
  roots.push(root);
  write(root, "package.json", { name: "app" });
  install(root, "core", "1.0.0", core);
  install(root, "theme", "2.0.0", theme);
  for (const [name, content] of Object.entries(files))
    write(root, name, content);
  return root;
}

function check(root, args = ["src"], options = {}) {
  const log = [];
  const code = run(args, {
    cwd: root,
    log: (line) => log.push(line),
    typescript: ts,
    ...options,
  });
  return { code, log };
}

describe("salt-check", () => {
  it("reports deprecated, unknown and palette tokens in CSS and ignores comments and declarations", () => {
    const root = project({
      "src/app.css": `/* --salt-size-border in a comment */
:root { --salt-container-primary-borderColor: red; }
.panel {
  border: var(--salt-size-border) solid var(--salt-container-primary-borderColor);
  color: var(--salt-text-secondary);
  background: var(--salt-palette-neutral-border);
  border-radius: var(--salt-palette-corner-weak);
  outline-color: var(--salt-container-bold-border-color);
}
`,
    });
    const { code, log } = check(root);
    expect(code).toBe(1);
    expect(log).toEqual([
      "src/app.css:4:15: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      "src/app.css:4:45: error deprecated-token: --salt-container-primary-borderColor is deprecated; use --salt-container-bold-borderColor instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      "src/app.css:5:14: error unknown-token: --salt-text-secondary isn't a Salt token. See node_modules/@salt-ds/theme/docs/tokens.md.",
      "src/app.css:6:19: warning palette-token: --salt-palette-neutral-border is a palette token, which characteristic tokens use to support modes. Use a characteristic or foundation token instead. See node_modules/@salt-ds/theme/docs/tokens/palette.md.",
      "src/app.css:8:22: error unknown-token: --salt-container-bold-border-color isn't a Salt token; did you mean --salt-container-bold-borderColor? See node_modules/@salt-ds/theme/docs/tokens/characteristics.md.",
      "salt-check: checked 1 file: 4 errors, 1 warning.",
    ]);
  });

  it("doesn't claim a deprecated token with no recorded replacement has none", () => {
    const root = project(
      { "src/app.css": ".a { color: var(--salt-old-color); }\n" },
      {
        theme: {
          ...THEME,
          tokens: { ...THEME.tokens, "--salt-old-color": ["deprecated", 1] },
        },
      },
    );
    const { code, log } = check(root);
    expect(code).toBe(1);
    expect(log).toEqual([
      "src/app.css:1:17: error deprecated-token: --salt-old-color is deprecated and no replacement is recorded for it. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      "salt-check: checked 1 file: 1 error, 0 warnings.",
    ]);
  });

  it("prints paths relative to a current folder reached through a symlink", () => {
    const root = project({
      "src/app.css": ".a { color: var(--salt-size-border); }\n",
    });
    const link = `${root}-link`;
    symlinkSync(root, link, "dir");
    roots.push(link);
    for (const args of [["src"], [path.join(link, "src")], []]) {
      const { log } = check(link, args);
      expect(log[0]).toBe(
        "src/app.css:1:17: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      );
    }
  });

  it("checks props, parts and tokens in TSX, leaving out names built at runtime", () => {
    const root = project({
      "src/App.tsx": `import { Button, Toast, ToastContent } from "@salt-ds/core";
import * as Salt from "@salt-ds/core";
// --salt-size-border in a comment
export const App = ({ extra, hue }) => (
  <div style={{ "--app-gap": "var(--salt-size-fixed-100)", color: \`var(--salt-palette-\${hue}-600)\`, padding: "var(--salt-size-border)" }}>
    <Button variant="cta">Save</Button>
    <Salt.Button variant="cta">Save</Salt.Button>
    <Toast>Saved</Toast>
    <Toast><ToastContent>Saved</ToastContent></Toast>
    <Toast>{extra}</Toast>
    <Toast children={extra} />
    <Toast />
  </div>
);
document.body.style.setProperty("--salt-size-border", "2px");
`,
    });
    const { code, log } = check(root);
    expect(code).toBe(1);
    expect(log).toEqual([
      "src/App.tsx:5:115: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      "src/App.tsx:6:13: error deprecated-prop: Button's variant prop is deprecated since 1.36.0. Use `appearance` instead. See node_modules/@salt-ds/core/docs/components/button.md.",
      "src/App.tsx:7:18: error deprecated-prop: Button's variant prop is deprecated since 1.36.0. Use `appearance` instead. See node_modules/@salt-ds/core/docs/components/button.md.",
      "src/App.tsx:8:5: warning missing-part: Toast has no ToastContent, which every Salt example of it includes. See node_modules/@salt-ds/core/docs/components/toast.md.",
      "src/App.tsx:12:5: warning missing-part: Toast has no ToastContent, which every Salt example of it includes. See node_modules/@salt-ds/core/docs/components/toast.md.",
      "salt-check: checked 1 file: 3 errors, 2 warnings.",
    ]);
  });

  it("checks parts past attribute expressions and isn't fooled by Object.prototype names or escapes", () => {
    const source = `import { Button, Toast } from "@salt-ds/core";
export const App = ({ save, props }) => (
  <>
    <Toast><Button onClick={save} constructor="x">Undo</Button></Toast>
    <Toast><Button {...props} /></Toast>
  </>
);
export const padding = "a\\tb\\tc var(--salt-size-border)";
`;
    const root = project({ "src/App.tsx": source });
    const { code, log } = check(root);
    expect(code).toBe(1);
    const tokenLine = source.split("\n")[7];
    expect(log).toEqual([
      // An attribute such as onClick doesn't hide what the children are; a
      // spread can pass children, so it does.
      "src/App.tsx:4:5: warning missing-part: Toast has no ToastContent, which every Salt example of it includes. See node_modules/@salt-ds/core/docs/components/toast.md.",
      `src/App.tsx:8:${tokenLine.indexOf("--salt-size-border") + 1}: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.`,
      "salt-check: checked 1 file: 1 error, 1 warning.",
    ]);
  });

  it("only checks Salt imports where local bindings do not shadow them", () => {
    const root = project({
      "src/App.tsx": `import { Button, Button as SaltButton, Toast, ToastContent } from "@salt-ds/core";
import * as Salt from "@salt-ds/core";
export const Before = () => <Button variant="cta" />;
export function Parameter({ Button, Salt }) {
  return <><Button variant="custom" /><Salt.Button variant="custom" /></>;
}
export function Local() {
  const Button = ({ variant }) => <span>{variant}</span>;
  const Salt = { Button };
  return <><Button variant="custom" /><Salt.Button variant="custom" /></>;
}
export function Aliased(SaltButton) {
  return <SaltButton variant="custom" />;
}
export function CustomPart(ToastContent) {
  return <Toast><ToastContent /></Toast>;
}
export const After = () => <><SaltButton variant="cta" /><Salt.Button variant="cta" /><Toast>Saved</Toast></>;
`,
    });
    const { code, log } = check(root, ["src", "--json"]);
    expect(code).toBe(1);
    const result = JSON.parse(log.join("\n"));
    expect(result.problems.map(({ line, rule }) => ({ line, rule }))).toEqual([
      { line: 3, rule: "deprecated-prop" },
      { line: 18, rule: "deprecated-prop" },
      { line: 18, rule: "deprecated-prop" },
      { line: 18, rule: "missing-part" },
    ]);
  });

  it("keeps each file's bindings to itself when checking many files", () => {
    const files = {
      // A script, whose declarations are global, and a module with its own
      // Button, both mentioning Salt so they're checked with the others.
      "src/global.jsx": `// Not @salt-ds/core's Button.
function Button({ variant }) { return <span>{variant}</span>; }
`,
      "src/Local.tsx": `// Not @salt-ds/core's Button.
const Button = ({ variant }) => <span>{variant}</span>;
export const Local = () => <Button variant="cta" />;
`,
    };
    // More files than are bound in one program.
    for (let index = 0; index < 120; index += 1) {
      files[`src/App${index}.tsx`] = `import { Button } from "@salt-ds/core";
export const App = () => <Button variant="cta" />;
`;
    }
    const { log } = check(project(files), ["src", "--json"]);
    const { problems } = JSON.parse(log.join("\n"));
    expect(problems).toHaveLength(120);
    expect(
      problems.every(
        ({ file, line, rule }) =>
          /App\d+\.tsx$/.test(file) && line === 2 && rule === "deprecated-prop",
      ),
    ).toBe(true);
  });

  it("doesn't take a slash-star inside a string or url() for a comment", () => {
    const root = project({
      "src/a.scss": `.a { background: url("img/*.png"); }
.b { background: url(img/*.png); color: var(--salt-size-border); }
/* end */
`,
      "src/App.jsx": `const prefix = "/*";
export const A = () => <b style={{ padding: "var(--salt-size-border)" }} />;
/* end */
`,
    });
    const { code, log } = check(root, ["src"], { typescript: null });
    expect(code).toBe(1);
    expect(
      log.filter((line) => line.includes("deprecated-token")),
    ).toHaveLength(2);
  });

  it("reads a protocol-relative URL in Sass as a URL, not a comment", () => {
    const root = project({
      "src/a.scss": `// --salt-size-border in a comment
.a { background: url(//cdn.example.com/a.png); padding: var(--salt-size-border); }
`,
    });
    const { code, log } = check(root);
    expect(code).toBe(1);
    expect(log[0]).toMatch(
      /^src\/a\.scss:2:\d+: error deprecated-token: --salt-size-border /,
    );
    expect(log.at(-1)).toBe("salt-check: checked 1 file: 1 error, 0 warnings.");
  });

  it("checks files passed explicitly in a build folder, and reports a missing project", () => {
    const root = project({
      "out/shared/a.css": ".a { color: var(--salt-size-border); }\n",
    });
    expect(check(root, ["out/shared/a.css"]).code).toBe(1);
    // Without paths, build output is left out.
    expect(check(root, [])).toEqual({
      code: 2,
      log: [
        "salt-check: No files to check. Pass the files or folders to check.",
      ],
    });
    expect(check(root, ["--project", "missing"])).toEqual({
      code: 2,
      log: ["salt-check: --project must name an existing directory: missing"],
    });
  });

  it("checks tokens without TypeScript and says the other checks were skipped", () => {
    const root = project({
      "src/App.jsx":
        'export const A = () => <b style={{ padding: "var(--salt-size-border)" }} variant="cta" />;\n',
    });
    const { code, log } = check(root, ["src"], { typescript: null });
    expect(code).toBe(1);
    expect(log[0]).toBe(
      "salt-check: TypeScript isn't installed for this application, so prop and part checks are skipped.",
    );
    expect(log).toContain(
      "src/App.jsx:1:50: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
    );
  });

  it("checks only changed files with --changed", () => {
    const root = project({
      "src/old.css": ".a { color: var(--salt-size-border); }\n",
    });
    const git = (...args) =>
      execFileSync(
        "git",
        ["-c", "user.name=t", "-c", "user.email=t@t", ...args],
        { cwd: root },
      );
    git("init", "-q");
    git("add", "-A");
    git("commit", "-q", "-m", "init");
    // Nothing changed is a clean result, not a setup error.
    expect(check(root, ["--changed"])).toEqual({
      code: 0,
      log: [
        "salt-check: No changed script or style files to check.",
        "salt-check: checked 0 files: 0 errors, 0 warnings.",
      ],
    });
    // Git quotes non-ASCII names unless they're NUL-separated.
    write(
      root,
      "src/Überblick.css",
      ".b { color: var(--salt-size-border); }\n",
    );
    const { code, log } = check(root, ["--changed"]);
    expect(code).toBe(1);
    expect(log.at(-1)).toBe("salt-check: checked 1 file: 1 error, 0 warnings.");
  });

  it("checks every file with --changed before the first commit", () => {
    const root = project({
      "src/staged.css": ".a { color: var(--salt-size-border); }\n",
      "src/untracked.css": ".b { color: var(--salt-size-border); }\n",
    });
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["add", "src/staged.css"], { cwd: root });
    const { code, log } = check(root, ["--changed"]);
    expect(code).toBe(1);
    expect(log.at(-1)).toBe(
      "salt-check: checked 2 files: 2 errors, 0 warnings.",
    );
  });

  it("explains that --changed needs Git outside a repository", () => {
    const root = project({
      "src/a.css": ".a { color: var(--salt-size-border); }\n",
    });
    expect(check(root, ["--changed"])).toEqual({
      code: 2,
      log: [
        "salt-check: --changed needs a Git repository. Pass the files to check instead.",
      ],
    });
  });

  it("checks JSX in .js files, and reports a malformed token instead of failing", () => {
    const root = project({
      "src/App.js": `import { Toast } from "@salt-ds/core";
export const App = () => <Toast>Saved</Toast>;
`,
      "src/a.css": ".a { color: var(--salt-color--x); }\n",
    });
    const { code, log } = check(root);
    expect(code).toBe(1);
    expect(
      log.some((line) =>
        line.startsWith("src/App.js:2:26: warning missing-part"),
      ),
    ).toBe(true);
    expect(
      log.some((line) => line.includes("unknown-token: --salt-color--x")),
    ).toBe(true);
  });

  it("skips packages without check data or with newer data, and reports setup problems", () => {
    const root = project(
      { "src/a.css": ".a { color: var(--salt-size-border); }\n" },
      { theme: { ...THEME, schemaVersion: 2 }, core: null },
    );
    const { code, log } = check(root);
    expect(code).toBe(0);
    expect(log).toEqual([
      "salt-check: @salt-ds/core@1.0.0 has no salt-check.json, so its checks are skipped.",
      "salt-check: @salt-ds/theme@2.0.0 has newer check data than this @salt-ds/cli reads, so its checks are skipped; upgrade @salt-ds/cli to check it.",
      "salt-check: No installed @salt-ds/theme check data, so token checks are skipped.",
      "salt-check: checked 1 file: 0 errors, 0 warnings.",
    ]);
    expect(check(root, ["missing"]).code).toBe(2);
    expect(check(root, ["--nope"]).code).toBe(2);
  });

  it.each([
    ["no schemaVersion", { name: "@salt-ds/theme", version: "2.0.0" }],
    ["a string schemaVersion", { ...THEME, schemaVersion: "2" }],
    ["JSON that isn't an object", null],
  ])("reports check data with %s as a setup problem", (_label, data) => {
    const root = project({
      "src/a.css": ".a { color: var(--salt-size-border); }\n",
    });
    const file = path.join(
      root,
      "node_modules/@salt-ds/theme/docs/salt-check.json",
    );
    writeFileSync(file, JSON.stringify(data));
    const { code, log } = check(root);
    expect(code).toBe(2);
    expect(log).toEqual([
      // The real path: the temp folder can be a symlink, as on macOS.
      `salt-check: Invalid check data ${realpathSync(file)}: schemaVersion must be 1.`,
    ]);
  });

  it("prints JSON with --json", () => {
    const root = project({
      "src/a.css": ".a { color: var(--salt-size-border); }\n",
    });
    const { code, log } = check(root, ["src", "--json"]);
    expect(code).toBe(1);
    expect(JSON.parse(log.join("\n"))).toMatchObject({
      files: 1,
      errors: 1,
      warnings: 0,
      problems: [
        {
          file: "src/a.css",
          line: 1,
          rule: "deprecated-token",
          severity: "error",
        },
      ],
    });
  });
});
