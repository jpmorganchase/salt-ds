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

const COLOR_THEME = {
  pages: [
    ...THEME.pages,
    "tokens/foundations/color.md",
    "tokens/foundations/alpha.md",
  ],
  tokens: {
    ...THEME.tokens,
    "--salt-color-blue-500": ["current", 3],
    "--salt-color-blue-500-rgb": ["current", 3],
    "--salt-color-blue-500-40a": ["current", 4],
    "--salt-spacing-100": ["current", 0],
  },
  themeOnlyTokens: [
    "--salt-color-blue-500",
    "--salt-color-blue-500-rgb",
    "--salt-color-blue-500-40a",
  ],
};

const CORE = {
  components: {
    Button: {
      page: "components/button.md",
      deprecatedProps: { variant: "since 1.36.0. Use `appearance` instead." },
    },
    Toast: { page: "components/toast.md", parts: ["ToastContent"] },
    ToastContent: { page: "components/toast.md" },
    Input: { page: "components/input.md" },
    NumberInput: { page: "components/number-input.md" },
    ToggleButton: { page: "components/toggle-button.md" },
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
  it("reports deprecated, unknown and palette tokens in CSS, ignores comments, and reports declarations as overrides", () => {
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
      "src/app.css:2:9: warning token-override: This sets Salt's --salt-container-primary-borderColor token, which Salt's themes set and Salt recommends against overriding. Use the Salt variant or token for what the element is instead; a brand's colours come from its Salt theme. See node_modules/@salt-ds/theme/docs/themes/extended-styling.md.",
      "src/app.css:4:15: error deprecated-token: --salt-size-border is deprecated; use --salt-size-fixed-100 instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      "src/app.css:4:45: error deprecated-token: --salt-container-primary-borderColor is deprecated; use --salt-container-bold-borderColor instead. See node_modules/@salt-ds/theme/docs/tokens/deprecated.md.",
      "src/app.css:5:14: error unknown-token: --salt-text-secondary isn't a Salt token. See node_modules/@salt-ds/theme/docs/tokens.md.",
      "src/app.css:6:19: warning palette-token: --salt-palette-neutral-border is a palette token used by Salt themes. Use a component prop or a characteristic token for the element's semantic role. See node_modules/@salt-ds/theme/docs/tokens/palette.md.",
      "src/app.css:8:22: error unknown-token: --salt-container-bold-border-color isn't a Salt token; did you mean --salt-container-bold-borderColor? See node_modules/@salt-ds/theme/docs/tokens/characteristics.md.",
      "salt-check: checked 1 file: 4 errors, 2 warnings.",
    ]);
  });

  it("warns on current colour, RGB and alpha foundations in application styles without deprecating them", () => {
    const root = project(
      {
        "src/app.css": `.a {
  color: var(--salt-color-blue-500);
  background: rgb(var(--salt-color-blue-500-rgb));
  border-color: var(--salt-color-blue-500-40a);
  padding: var(--salt-spacing-100);
}`,
        "src/App.tsx":
          'export const style = { color: "var(--salt-color-blue-500)" };',
      },
      { theme: COLOR_THEME },
    );
    const { code, log } = check(root, ["src", "--json"]);
    const result = JSON.parse(log[0]);
    expect(code).toBe(0);
    expect(result).toMatchObject({ errors: 0, warnings: 4 });
    expect(result.problems.map(({ rule }) => rule)).toEqual(
      Array(4).fill("theme-only-color"),
    );
    expect(result.problems.map(({ page }) => page)).toEqual([
      "node_modules/@salt-ds/theme/docs/tokens/foundations/color.md",
      "node_modules/@salt-ds/theme/docs/tokens/foundations/color.md",
      "node_modules/@salt-ds/theme/docs/tokens/foundations/color.md",
      "node_modules/@salt-ds/theme/docs/tokens/foundations/alpha.md",
    ]);
    for (const { message } of result.problems) {
      expect(message).toContain("element's semantic role");
      expect(message).not.toContain("deprecated");
      expect(message).not.toContain("--salt-spacing-100");
    }
  });

  it("doesn't suggest theme colour foundations as typo fixes or deprecated replacements", () => {
    const root = project(
      {
        "src/app.css": `.a {
  color: var(--salt-color-blue-0500);
  background: var(--salt-old-color);
  border-color: var(--salt-oldColor);
  padding: var(--salt-size-fixed-10);
}`,
      },
      {
        theme: {
          ...COLOR_THEME,
          tokens: {
            ...COLOR_THEME.tokens,
            "--salt-oldColor": ["deprecated", 1, ["--salt-color-blue-500"]],
          },
        },
      },
    );
    const { code, log } = check(root, ["src", "--json"]);
    const { problems } = JSON.parse(log[0]);
    expect(code).toBe(1);
    expect(problems).toHaveLength(4);
    for (const { message } of problems.slice(0, 3)) {
      expect(message).not.toContain("did you mean");
      expect(message).not.toContain("--salt-color-blue-500");
    }
    expect(problems[2]).toMatchObject({
      rule: "deprecated-token",
      severity: "error",
    });
    expect(problems[2].message).toContain(
      "recorded replacements are for theme implementation",
    );
    expect(problems[3].message).toContain("did you mean --salt-size-fixed-100");
  });

  it("keeps older schema 1 data usable and rejects malformed optional theme usage data", () => {
    const { themeOnlyTokens: _themeOnlyTokens, ...olderTheme } = COLOR_THEME;
    const files = {
      "src/app.css": ".a { color: var(--salt-color-blue-500); }",
    };
    const { code, log } = check(project(files, { theme: olderTheme }), [
      "src",
      "--json",
    ]);
    expect(code).toBe(0);
    expect(JSON.parse(log[0]).problems).toEqual([]);

    const invalid = check(
      project(files, { theme: { ...COLOR_THEME, themeOnlyTokens: [null] } }),
    );
    expect(invalid.code).toBe(2);
    expect(invalid.log[0]).toContain(
      "themeOnlyTokens must be an array of token names",
    );
  });

  it("links an unknown token to the page of its suggestion, or of the tokens sharing the longest start", () => {
    const theme = {
      pages: [
        "tokens/characteristics.md",
        "tokens/deprecated.md",
        "tokens/palette/corner.md",
        "tokens/palette/interact.md",
        "tokens/palette/neutral.md",
      ],
      tokens: {
        "--salt-content-primary-foreground": ["current", 0],
        "--salt-palette-corner-weak": ["current", 2],
        "--salt-palette-corner-strong": ["current", 2],
        "--salt-palette-interact-background": ["palette", 3],
        "--salt-palette-neutral-border": ["palette", 4],
        "--salt-palette-neutral-background": ["palette", 4],
        "--salt-palette-neutral-foreground": ["palette", 4],
        "--salt-palette-neutral-secondary-border": ["deprecated", 1, []],
        "--salt-palette-neutral-tertiary-border": ["deprecated", 1, []],
        "--salt-palette-neutral-quaternary-border": ["deprecated", 1, []],
        "--salt-palette-neutral-quinary-border": ["deprecated", 1, []],
      },
    };
    const root = project(
      {
        "src/app.css": `.a {
  color: var(--salt-content-primary-forground);
  color: var(--salt-palette-interact-foo);
  color: var(--salt-palette-neutral-bordr);
  color: var(--salt-palette-foo);
  color: var(--salt-shadow-foo);
}
`,
      },
      { theme },
    );
    const pages = check(root)
      .log.filter((line) => line.includes("unknown-token"))
      .map((line) =>
        line.replace(/^.*unknown-token: (\S+) .* See (\S+)\.$/, "$1 $2"),
      );
    const docs = "node_modules/@salt-ds/theme/docs";
    expect(pages).toEqual([
      `--salt-content-primary-forground ${docs}/tokens/characteristics.md`,
      `--salt-palette-interact-foo ${docs}/tokens/palette/interact.md`,
      `--salt-palette-neutral-bordr ${docs}/tokens/palette/neutral.md`,
      `--salt-palette-foo ${docs}/tokens/palette/neutral.md`,
      `--salt-shadow-foo ${docs}/tokens.md`,
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
      "src/App.tsx:15:33: warning token-override: This sets Salt's --salt-size-border token, which Salt's themes set and Salt recommends against overriding. Use the Salt variant or token for what the element is instead; a brand's colours come from its Salt theme. See node_modules/@salt-ds/theme/docs/themes/extended-styling.md.",
      "salt-check: checked 1 file: 3 errors, 3 warnings.",
    ]);
  });

  it.each([
    { imported: 'import { css } from "@emotion/react";', tag: "css" },
    {
      imported: 'import { css as styles } from "@emotion/css";',
      tag: "styles",
    },
    { imported: 'import styled from "@emotion/styled";', tag: "styled.div" },
    {
      imported: 'import styled from "styled-components";',
      tag: 'styled("section")',
    },
    {
      imported: 'import { styled as makeStyles } from "styled-components";',
      tag: 'makeStyles.section.attrs({ role: "region" })',
    },
    {
      imported: 'import * as emotion from "@emotion/react";',
      tag: "emotion.css",
    },
  ])(
    "checks comments, live tokens and overrides in $tag CSS templates",
    ({ imported, tag }) => {
      const lines = [
        imported,
        `export const styles = ${tag}\``,
        "  /* --salt-size-border; --salt-content-primary-foreground: red; */",
        "  --salt-content-primary-foreground: pink;",
        "  color: var(--salt-container-primary-borderColor);",
        "  background: var(--salt-color-blue-500);",
        "`;",
      ];
      const { code, log } = check(
        project({ "src/styles.ts": lines.join("\n") }, { theme: COLOR_THEME }),
        ["--json"],
      );
      expect(code).toBe(1);
      const result = JSON.parse(log.join("\n"));
      expect(result).toMatchObject({ errors: 1, warnings: 2 });
      expect(
        result.problems.map(({ line, column, rule }) => ({
          line,
          column,
          rule,
        })),
      ).toEqual([
        { line: 4, column: 3, rule: "token-override" },
        {
          line: 5,
          column: lines[4].indexOf("--salt-") + 1,
          rule: "deprecated-token",
        },
        {
          line: 6,
          column: lines[5].indexOf("--salt-") + 1,
          rule: "theme-only-color",
        },
      ]);
    },
  );

  it("keeps CSS comment and quote state across interpolations and checks live JavaScript separately", () => {
    const lines = [
      'import { css } from "@emotion/react";',
      "export const styles = css`",
      `  /* \${getComputedStyle(document.body).getPropertyValue("--salt-size-border")}`,
      "     --salt-container-primary-borderColor",
      `     \${"note"} --salt-content-primary-foreground: pink;`,
      "  */",
      `  content: "/* \${"*/"} remains a quoted value";`,
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Generated TypeScript source contains this interpolation.
      "  --salt-size-fixed-100: ${width};",
      "  border-width: var(--salt-size-border);",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Generated TypeScript source contains this interpolation.
      "  color: var(--salt-color-${hue});",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Generated TypeScript source contains this interpolation.
      "  outline-width: var(--salt-size${suffix});",
      "`;",
    ];
    const { code, log } = check(
      project({ "src/styles.ts": lines.join("\n") }),
      ["--json"],
    );
    expect(code).toBe(1);
    const result = JSON.parse(log.join("\n"));
    expect(result).toMatchObject({ errors: 2, warnings: 1 });
    expect(
      result.problems.map(({ line, column, rule }) => ({ line, column, rule })),
    ).toEqual([
      {
        line: 3,
        column: lines[2].indexOf("--salt-") + 1,
        rule: "deprecated-token",
      },
      { line: 8, column: 3, rule: "token-override" },
      {
        line: 9,
        column: lines[8].indexOf("--salt-") + 1,
        rule: "deprecated-token",
      },
    ]);
  });

  it.each([
    String.raw`content: "\\"/* remains quoted";`,
    String.raw`content: "\u{1f600}\u0041\x42";`,
    String.raw`content: "\t";`,
    String.raw`content: "\U0041\X20";`,
  ])(
    "preserves source positions and CSS quoting after JavaScript escapes: %s",
    (content) => {
      const line = `export const styles = css\`/* --salt-size-border */ ${content} padding: var(--salt-size-border);\`;`;
      const source = `import { css } from "@emotion/react";\n${line}\n`;
      const { code, log } = check(project({ "src/styles.ts": source }), [
        "--json",
      ]);
      expect(code).toBe(1);
      const { problems } = JSON.parse(log.join("\n"));
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatchObject({
        line: 2,
        column: line.lastIndexOf("--salt-size-border") + 1,
        rule: "deprecated-token",
      });
    },
  );

  it("keeps ordinary strings, unrelated tags and shadowed CSS imports as JavaScript", () => {
    const lines = [
      'import { css } from "@emotion/react";',
      'import styled from "styled-components";',
      'import { css as customCss } from "./custom-format";',
      'const query = document.body.style.getPropertyValue("--salt-size-border");',
      'const string = "/* --salt-size-border */";',
      "const template = `/* --salt-size-border */`;",
      "const raw = String.raw`/* --salt-size-border */`;",
      "const custom = customCss`/* --salt-size-border */`;",
      "function parameter(css) { return css`/* --salt-size-border */`; }",
      "function local() { const styled = customCss; return styled.div`/* --salt-size-border */`; }",
    ];
    const { code, log } = check(project({ "src/query.ts": lines.join("\n") }), [
      "--json",
    ]);
    expect(code).toBe(1);
    const { problems } = JSON.parse(log.join("\n"));
    expect(problems.map(({ line, rule }) => ({ line, rule }))).toEqual(
      [4, 5, 6, 7, 8, 9, 10].map((line) => ({
        line,
        rule: "deprecated-token",
      })),
    );
  });

  it("suggests NumberInput for an Input set up for numbers, when the installed core has it", () => {
    const source = `import { Input } from "@salt-ds/core";
export const App = ({ props, mode }) => (
  <>
    <Input inputProps={{ inputMode: "numeric" }} />
    <Input inputProps={{ "inputMode": "decimal", min: 1 }} />
    <Input inputProps={{ type: "number" }} />
    <Input inputMode="numeric" />
    <Input inputProps={{ inputMode: "email" }} />
    <Input inputProps={{ inputMode: mode }} />
    <Input inputProps={props} />
    <input inputMode="numeric" />
  </>
);
`;
    const { code, log } = check(project({ "src/App.tsx": source }));
    expect(code).toBe(0);
    const warning = (line) =>
      `src/App.tsx:${line}:5: warning number-input: Input is set up for numbers: for an exact number within a set range, such as a quantity, use NumberInput, which adds increment and decrement controls and min and max. Keep Input for numbers with no set range or for numeric codes, such as postcodes. See node_modules/@salt-ds/core/docs/components/number-input.md.`;
    expect(log).toEqual([
      warning(4),
      warning(5),
      warning(6),
      warning(7),
      "salt-check: checked 1 file: 0 errors, 4 warnings.",
    ]);

    // A core without NumberInput gets no suggestion.
    const { NumberInput, ...older } = CORE.components;
    const { log: olderLog } = check(
      project({ "src/App.tsx": source }, { core: { components: older } }),
    );
    expect(olderLog).toEqual([
      "salt-check: checked 1 file: 0 errors, 0 warnings.",
    ]);
  });

  it("suggests ToggleButton for a Button with aria-pressed", () => {
    const source = `import { Button } from "@salt-ds/core";
export const App = ({ on }: { on: boolean }) => (
  <>
    <Button aria-pressed={on}>Favourite</Button>
    <Button aria-pressed="false">Mute</Button>
    <Button aria-label="Save">Save</Button>
    <button aria-pressed={on}>Plain</button>
  </>
);
`;
    const { code, log } = check(project({ "src/App.tsx": source }));
    expect(code).toBe(0);
    const warning = (line) =>
      `src/App.tsx:${line}:13: warning toggle-button: Button has aria-pressed, which makes it a toggle: use ToggleButton, which keeps its selected state and shows it as Salt's toggles do. Use ToggleButtonGroup for a set of options. See node_modules/@salt-ds/core/docs/components/toggle-button.md.`;
    expect(log).toEqual([
      warning(4),
      warning(5),
      "salt-check: checked 1 file: 0 errors, 2 warnings.",
    ]);

    // A core without ToggleButton gets no suggestion.
    const { ToggleButton, ...older } = CORE.components;
    const { log: olderLog } = check(
      project({ "src/App.tsx": source }, { core: { components: older } }),
    );
    expect(olderLog).toEqual([
      "salt-check: checked 1 file: 0 errors, 0 warnings.",
    ]);
  });

  it("asks for the clamped value to be announced", () => {
    const silent = `import { NumberInput } from "@salt-ds/core";
export const App = () => (
  <>
    <NumberInput clamp min={0} max={100} />
    <NumberInput clamp={true} min={0} max={100} />
    <NumberInput clamp={false} min={0} max={100} />
    <NumberInput min={0} max={100} />
  </>
);
`;
    const announced = `import { NumberInput, useAriaAnnouncer } from "@salt-ds/core";
export const App = () => {
  const { announce } = useAriaAnnouncer();
  return <NumberInput clamp onNumberChange={(_e, v) => announce(String(v))} />;
};
`;
    const liveRegion = `import { NumberInput } from "@salt-ds/core";
export const App = ({ message }: { message: string }) => (
  <>
    <NumberInput clamp />
    <span aria-live="polite">{message}</span>
  </>
);
`;
    const { code, log } = check(
      project({
        "src/Silent.tsx": silent,
        "src/Announced.tsx": announced,
        "src/LiveRegion.tsx": liveRegion,
      }),
    );
    expect(code).toBe(0);
    const warning = (line) =>
      `src/Silent.tsx:${line}:18: warning clamp-announcement: NumberInput's clamp changes the value when the field loses focus, and nothing in this file announces it: announce the clamped value with useAriaAnnouncer, as NumberInput's docs ask, so screen reader users hear the change. See node_modules/@salt-ds/core/docs/components/number-input.md.`;
    expect(log).toEqual([
      warning(4),
      warning(5),
      "salt-check: checked 3 files: 0 errors, 2 warnings.",
    ]);
  });

  it("asks for a NumberInput's range in its FormField's helper text", () => {
    const source = `import { FormField, FormFieldHelperText, FormFieldLabel, NumberInput, Slider } from "@salt-ds/core";
export const App = ({ hint }: { hint: string }) => (
  <>
    <FormField>
      <FormFieldLabel>Discount</FormFieldLabel>
      <NumberInput min={0} max={100} />
    </FormField>
    <FormField>
      <FormFieldLabel>Quantity</FormFieldLabel>
      <NumberInput min={1} max={10} />
      <FormFieldHelperText>From 1 to 10.</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Rate</FormFieldLabel>
      <NumberInput min={0} max={5} />
      {hint}
    </FormField>
    <FormField>
      <FormFieldLabel>Count</FormFieldLabel>
      <NumberInput min={0} />
    </FormField>
    <FormField>
      <FormFieldLabel>Volume</FormFieldLabel>
      <NumberInput min={0} max={10} />
      <Slider min={0} max={10} />
    </FormField>
    <NumberInput min={1} max={5} aria-label="Page" />
  </>
);
`;
    const { code, log } = check(project({ "src/App.tsx": source }));
    expect(code).toBe(0);
    expect(log).toEqual([
      "src/App.tsx:6:20: warning range-helper-text: NumberInput has a min and max, and its FormField has no FormFieldHelperText: tell users the accepted range in helper text, as NumberInput's docs ask. See node_modules/@salt-ds/core/docs/components/number-input.md.",
      "salt-check: checked 1 file: 0 errors, 1 warning.",
    ]);
  });

  it("reports an app's overrides of Salt's tokens", () => {
    const css = `/* --salt-content-primary-foreground: red; in a comment */
.brand {
  --salt-content-primary-foreground: #e91e63;
  --salt-app-own: 4px;
  --salt-size-fixed-100: var(--salt-container-bold-borderColor);
  color: var(--salt-content-primary-foreground);
}
`;
    const source = `import { Button } from "@salt-ds/core";
export const App = ({ el }: { el: HTMLElement }) => {
  el.style.setProperty("--salt-size-fixed-100", "2px");
  return (
    <Button style={{ "--salt-content-primary-foreground": "pink", "--salt-size-border": "var(--salt-size-fixed-100)" } as object}>
      Go
    </Button>
  );
};
`;
    const { code, log } = check(
      project({ "src/brand.css": css, "src/App.tsx": source }),
    );
    expect(code).toBe(0);
    const warning = (file, line, column, name) =>
      `src/${file}:${line}:${column}: warning token-override: This sets Salt's ${name} token, which Salt's themes set and Salt recommends against overriding. Use the Salt variant or token for what the element is instead; a brand's colours come from its Salt theme. See node_modules/@salt-ds/theme/docs/themes/extended-styling.md.`;
    expect(log).toEqual([
      warning("App.tsx", 3, 24, "--salt-size-fixed-100"),
      warning("App.tsx", 5, 22, "--salt-content-primary-foreground"),
      // Set to another Salt token, it's still an override.
      warning("App.tsx", 5, 67, "--salt-size-border"),
      warning("brand.css", 3, 3, "--salt-content-primary-foreground"),
      warning("brand.css", 5, 3, "--salt-size-fixed-100"),
      "salt-check: checked 2 files: 0 errors, 5 warnings.",
    ]);
  });

  it("suggests Salt layouts for CSS grids and media queries on width", () => {
    const css = `/* display: grid in a comment */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.row { display: inline-grid; }
.list { display: flex; }
@media (max-width: 599px) {
  .cards { grid-template-columns: 1fr; }
}
@media screen and (min-width: 600px) and (prefers-reduced-motion: reduce) {}
@media print, (prefers-color-scheme: dark) {}
`;
    const { code, log } = check(project({ "src/app.css": css }));
    expect(code).toBe(0);
    const grid = (line, column) =>
      `src/app.css:${line}:${column}: warning css-grid: A CSS grid lays out what Salt's GridLayout does, with Salt's spacing and columns for each breakpoint. Use GridLayout or another Salt layout instead. See node_modules/@salt-ds/core/docs/components/layouts/grid-layout.md.`;
    const media = (line) =>
      `src/app.css:${line}:1: warning media-query: A media query on width repeats Salt's breakpoints. Use a Salt layout's responsive props, useResponsiveProp or useBreakpoint instead. See node_modules/@salt-ds/theme/docs/foundations/responsiveness/breakpoints.md.`;
    expect(log).toEqual([
      grid(3, 3),
      grid(6, 8),
      media(8),
      media(11),
      "salt-check: checked 1 file: 0 errors, 4 warnings.",
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

  it("treats unresolved JSX members as unknown children regardless of namespace casing", () => {
    const source = `import { FormField, NumberInput, Toast, ToastContent } from "@salt-ds/core";
import * as salt from "@salt-ds/core";
const parts = { Body: () => <ToastContent>Saved</ToastContent> };
export const App = ({ slots }) => (
  <>
    <Toast><parts.Body /></Toast>
    <Toast><div><slots.toast.Body /></div></Toast>
    <Toast><salt.ToastContent>Saved</salt.ToastContent></Toast>
    <Toast><salt.Button>Save</salt.Button></Toast>
    <Toast><span>Saved</span></Toast>
    <FormField><NumberInput min={0} max={5} /><slots.Helper /></FormField>
    <FormField><NumberInput min={0} max={5} /><span>Quantity</span></FormField>
  </>
);
`;
    const { code, log } = check(project({ "src/App.tsx": source }), ["--json"]);
    expect(code).toBe(0);
    const { problems } = JSON.parse(log.join("\n"));
    expect(problems.map(({ line, rule }) => ({ line, rule }))).toEqual([
      { line: 9, rule: "missing-part" },
      { line: 10, rule: "missing-part" },
      { line: 12, rule: "range-helper-text" },
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
