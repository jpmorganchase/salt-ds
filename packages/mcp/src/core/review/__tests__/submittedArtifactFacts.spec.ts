import { describe, expect, it } from "vitest";
import { parseSubmittedArtifact } from "../submittedArtifactFacts.js";

describe("submitted artifact fact parsing", () => {
  it("grounds JSX through its lexical import regardless of source order", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: [
        'export const Demo = () => <Button href="/next" />;',
        'import { Button } from "@salt-ds/core";',
      ].join("\n"),
    });

    expect(parsed.parser).toBe("babel");
    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "jsx_element",
          subject: "@salt-ds/core#Button",
          package_name: "@salt-ds/core",
          export_name: "Button",
        }),
        expect.objectContaining({
          kind: "jsx_prop",
          property: "href",
          package_name: "@salt-ds/core",
          export_name: "Button",
        }),
      ]),
    );
  });

  it("parses JavaScript once into used, unused, type-only, JSX, prop, style, and token facts", () => {
    const text = [
      'import type { ButtonProps } from "@salt-ds/core";',
      'import { Button, Card } from "@salt-ds/core";',
      '// <Button href="/comment">ignored</Button>',
      'const history = `<Button href="/string">ignored</Button>`;',
      "export function Demo(_props: ButtonProps) {",
      '  return <Button href="/next" data-x={history} style={{ color: "var(--salt-content-primary-foreground)" }} />;',
      "}",
    ].join("\n");
    const parsed = parseSubmittedArtifact({ language: "tsx", text });

    expect(parsed.parser).toBe("babel");
    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "import",
          subject: "@salt-ds/core#ButtonProps",
          value_kind: "type_usage",
        }),
        expect.objectContaining({
          kind: "import",
          subject: "@salt-ds/core#Button",
          value_kind: "value_usage",
        }),
        expect.objectContaining({
          kind: "import",
          subject: "@salt-ds/core#Card",
          value_kind: "unused",
        }),
        expect.objectContaining({
          kind: "jsx_prop",
          subject: "@salt-ds/core#Button",
          property: "href",
          value_kind: "static_string",
        }),
        expect.objectContaining({
          kind: "token_use",
          subject: "--salt-content-primary-foreground",
          property: "color",
        }),
      ]),
    );
    expect(
      parsed.facts.filter(
        (fact) => fact.kind === "jsx_prop" && fact.property === "href",
      ),
    ).toHaveLength(1);
    const href = parsed.facts.find(
      (fact) => fact.kind === "jsx_prop" && fact.property === "href",
    )!;
    expect(
      text.slice(href.location.start_offset, href.location.end_offset),
    ).toBe('href="/next"');
    expect(href.location).toMatchObject({
      start_line: 6,
      start_column: 18,
    });
  });

  it("parses CSS declarations without turning comments into facts", () => {
    const text = [
      "/* color: var(--salt-comment-only); */",
      ".demo {",
      "  color: var(--salt-content-primary-foreground);",
      "}",
    ].join("\n");
    const parsed = parseSubmittedArtifact({ language: "css", text });

    expect(parsed.parser).toBe("postcss");
    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "style_declaration",
          property: "color",
        }),
        expect.objectContaining({
          kind: "token_use",
          subject: "--salt-content-primary-foreground",
        }),
      ]),
    );
    expect(JSON.stringify(parsed.facts)).not.toContain("comment-only");
  });

  it("does not scan another language after a malformed script", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: "export function Broken( { color: var(--salt-comment-only); }",
    });

    expect(parsed).toMatchObject({
      parser: "failed",
      facts: [],
      unknown_fact_count: 0,
    });
    expect(parsed.limitations.join(" ")).toMatch(/no fallback language scan/iu);
  });

  it("returns an atomic limited result when structural budgets are exceeded", () => {
    const script = parseSubmittedArtifact({
      language: "javascript",
      text: `const values = [${Array.from({ length: 60_000 }, () => "0").join(",")}];`,
    });
    expect(script).toMatchObject({
      parser: "limited",
      facts: [],
      unknown_fact_count: 0,
    });
    expect(script.limitations.join(" ")).toMatch(/AST analysis budget/iu);

    const css = parseSubmittedArtifact({
      language: "css",
      text: `.x { color: ${"calc(".repeat(129)}1px${")".repeat(129)}; }`,
    });
    expect(css).toMatchObject({ parser: "limited", facts: [] });
    expect(css.limitations.join(" ")).toMatch(/nesting depth/iu);

    const nestedCss = parseSubmittedArtifact({
      language: "css",
      text: `${"@media (min-width: 1px) {".repeat(129)}.x { color: red; }${"}".repeat(129)}`,
    });
    expect(nestedCss).toMatchObject({ parser: "limited", facts: [] });
    expect(nestedCss.limitations.join(" ")).toMatch(/depth 128/iu);
  });

  it("classifies many nested references in one bounded traversal", () => {
    const references = Array.from(
      { length: 100 },
      (_, index) => `${"(".repeat(index)}Button${")".repeat(index)}`,
    ).join(",");
    const parsed = parseSubmittedArtifact({
      language: "typescript",
      text: [
        'import { Button } from "@salt-ds/core";',
        `export const references = [${references}];`,
      ].join("\n"),
    });

    expect(parsed.parser).toBe("babel");
    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "import",
          subject: "@salt-ds/core#Button",
          value_kind: "value_usage",
        }),
      ]),
    );
  });

  it("records dynamic and spread props as unknown facts", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: [
        'import { Button } from "@salt-ds/core";',
        "export const Demo = (props: object, target: string) => (",
        "  <Button {...props} href={target} />",
        ");",
      ].join("\n"),
    });

    expect(parsed.unknown_fact_count).toBe(2);
    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "jsx_prop",
          value_kind: "spread",
          certainty: "unknown",
        }),
        expect.objectContaining({
          kind: "jsx_prop",
          property: "href",
          value_kind: "dynamic",
          certainty: "unknown",
        }),
      ]),
    );
  });

  it("ignores quoted CSS token text and locates real tokens exactly", () => {
    const text = [
      '.demo::before { content: "var(--salt-string-only)"; }',
      '.demo { background: url("var(--salt-url-only)"); }',
      ".demo { color: var(/* authored comment */ --salt-content-primary-foreground); }",
    ].join("\n");
    const parsed = parseSubmittedArtifact({ language: "css", text });
    const tokens = parsed.facts.filter((fact) => fact.kind === "token_use");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      subject: "--salt-content-primary-foreground",
      property: "color",
    });
    expect(
      Buffer.from(text, "utf8")
        .subarray(
          tokens[0]!.location.start_offset,
          tokens[0]!.location.end_offset,
        )
        .toString("utf8"),
    ).toBe("--salt-content-primary-foreground");
  });

  it("grounds namespace JSX usage and treats typeof imports as erased type usage", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: [
        'import * as Salt from "@salt-ds/core";',
        'import { Button } from "@salt-ds/core";',
        "type ButtonConstructor = typeof Button;",
        "export const Demo = () => <Salt.Button />;",
      ].join("\n"),
    });

    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "jsx_element",
          subject: "@salt-ds/core#Button",
          local_name: "Salt",
        }),
        expect.objectContaining({
          kind: "import",
          subject: "@salt-ds/core#Button",
          value_kind: "type_usage",
        }),
      ]),
    );
  });

  it("does not ground JSX through a type-only import", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: [
        'import type { Button } from "@salt-ds/core";',
        'export const Demo = () => <Button href="/next" />;',
      ].join("\n"),
    });

    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "jsx_element",
          local_name: "Button",
          package_name: null,
          export_name: null,
        }),
        expect.objectContaining({
          kind: "jsx_prop",
          property: "href",
          package_name: null,
          export_name: null,
        }),
      ]),
    );
    expect(parsed.limitations).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/type-only Salt import/iu),
      ]),
    );
  });

  it("treats erased TypeScript contexts as type usage while preserving runtime class heritage", () => {
    const parsed = parseSubmittedArtifact({
      language: "typescript",
      text: [
        'import { Button, Card, Checkbox, Dialog, Link, Text } from "@salt-ds/core";',
        "declare class AmbientDemo extends Button {}",
        "class RuntimeDemo extends Card {}",
        "interface ComputedInterface { [Checkbox]: string }",
        "type ComputedType = { [Dialog]: string };",
        "class DeclaredMember { declare [Link]: string }",
        "abstract class AbstractMember { abstract [Text](): void }",
      ].join("\n"),
    });

    for (const subject of ["Button", "Checkbox", "Dialog", "Link", "Text"]) {
      expect(parsed.facts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "import",
            subject: `@salt-ds/core#${subject}`,
            value_kind: "type_usage",
          }),
        ]),
      );
    }
    expect(parsed.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "import",
          subject: "@salt-ds/core#Card",
          value_kind: "value_usage",
        }),
      ]),
    );
  });

  it("treats interface heritage, class implementations, and type re-exports as erased type usage", () => {
    const parsed = parseSubmittedArtifact({
      language: "typescript",
      text: [
        'import { ButtonProps, Button as ButtonType, Card } from "@salt-ds/core";',
        "interface Fixture extends ButtonProps {}",
        "class Demo implements ButtonType {}",
        "export type { Card };",
      ].join("\n"),
    });

    for (const subject of [
      "@salt-ds/core#ButtonProps",
      "@salt-ds/core#Button",
      "@salt-ds/core#Card",
    ]) {
      expect(parsed.facts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "import",
            subject,
            value_kind: "type_usage",
          }),
        ]),
      );
    }
  });

  it("does not attribute compound JSX members to a direct Salt export", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: [
        'import * as Salt from "@salt-ds/core";',
        'import { Button } from "@salt-ds/core";',
        "export const Demo = () => (",
        '  <><Salt.Button.Group href="/one" /><Button.Group href="/two" /></>',
        ");",
      ].join("\n"),
    });
    const hrefFacts = parsed.facts.filter(
      (fact) => fact.kind === "jsx_prop" && fact.property === "href",
    );

    expect(hrefFacts).toHaveLength(2);
    expect(hrefFacts).toEqual([
      expect.objectContaining({
        subject: "Salt.Button.Group",
        package_name: null,
        export_name: null,
      }),
      expect.objectContaining({
        subject: "Button.Group",
        package_name: null,
        export_name: null,
      }),
    ]);
  });

  it("does not ground shadowed or intrinsic-lowercase JSX names", () => {
    const parsed = parseSubmittedArtifact({
      language: "tsx",
      text: [
        'import * as Salt from "@salt-ds/core";',
        'import { Button, Button as button } from "@salt-ds/core";',
        'function Named(Button: React.ElementType) { return <Button href="/shadow" />; }',
        'function Namespace(Salt: { Button: React.ElementType }) { return <Salt.Button href="/shadow" />; }',
        'export const Intrinsic = () => <button href="/intrinsic" />;',
      ].join("\n"),
    });
    const hrefFacts = parsed.facts.filter(
      (fact) => fact.kind === "jsx_prop" && fact.property === "href",
    );

    expect(hrefFacts).toHaveLength(3);
    expect(hrefFacts.every((fact) => fact.package_name === null)).toBe(true);
    expect(hrefFacts.every((fact) => fact.export_name === null)).toBe(true);
  });

  it("reports exact PostCSS declaration ranges", () => {
    const text = ".x { color:red;\nbackground:blue; }";
    const parsed = parseSubmittedArtifact({ language: "css", text });
    const styles = parsed.facts.filter(
      (fact) => fact.kind === "style_declaration",
    );

    expect(
      styles.map((fact) =>
        Buffer.from(text, "utf8")
          .subarray(fact.location.start_offset, fact.location.end_offset)
          .toString("utf8"),
      ),
    ).toEqual(["color:red;", "background:blue;"]);
    expect(styles[0]!.location.end_line).toBe(1);
  });

  it("requires exact case-sensitive custom property identities", () => {
    const text = [
      'import { Button } from "@salt-ds/core";',
      "export const Demo = () => (",
      "  <Button style={{",
      '    color: "var(--salt-known)",',
      '    background: "var(--Salt-known) var(--salt-known_EXTRA) var(--salt-knownÉ) var(--salt-known\\\\2d extra)",',
      "  }} />",
      ");",
    ].join("\n");
    const parsed = parseSubmittedArtifact({ language: "tsx", text });
    const tokens = parsed.facts.filter((fact) => fact.kind === "token_use");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      subject: "--salt-known",
      property: "color",
    });
  });

  it("reports token-specific UTF-8 locations in multiline style values", () => {
    const text = [
      'import { Button } from "@salt-ds/core";',
      'const emoji = "😀";',
      "export const Demo = () => (",
      "  <Button style={{ color: `first",
      "    var(--salt-deprecated-token),",
      "  last` }} />",
      ");",
    ].join("\r\n");
    const parsed = parseSubmittedArtifact({ language: "tsx", text });
    const token = parsed.facts.find(
      (fact) =>
        fact.kind === "token_use" && fact.subject === "--salt-deprecated-token",
    )!;

    expect(token.location).toMatchObject({ start_line: 5, end_line: 5 });
    expect(
      Buffer.from(text, "utf8")
        .subarray(token.location.start_offset, token.location.end_offset)
        .toString("utf8"),
    ).toBe("--salt-deprecated-token");
  });

  it("maps JavaScript token evidence to the real CSS occurrence", () => {
    for (const value of [
      'url("var(--salt-x)") var(--salt-x)',
      "/* var(--salt-x) */ var(--salt-x)",
    ]) {
      const text = [
        'import { Button } from "@salt-ds/core";',
        `export const Demo = () => <Button style={{ color: '${value}' }} />;`,
      ].join("\n");
      const parsed = parseSubmittedArtifact({ language: "tsx", text });
      const token = parsed.facts.find((fact) => fact.kind === "token_use")!;

      expect(token.location.start_offset).toBe(
        Buffer.byteLength(text.slice(0, text.lastIndexOf("--salt-x")), "utf8"),
      );
    }
  });

  it("rejects malformed var fallbacks and identifier-boundary lookalikes", () => {
    for (const value of [
      "var(--salt-unclosed-calc, calc(1px)",
      'var(--salt-quoted-close, "unterminated)',
      "var(--salt-comment-close, /* ) */ fallback",
      "évar(--salt-prefixed)",
      String.raw`x\var(--salt-escaped-prefix)`,
    ]) {
      const text = [
        'import { Button } from "@salt-ds/core";',
        `export const Demo = () => <Button style={{ color: \`${value}\` }} />;`,
      ].join("\n");
      const parsed = parseSubmittedArtifact({ language: "tsx", text });
      expect(parsed.facts.filter((fact) => fact.kind === "token_use")).toEqual(
        [],
      );
    }
  });

  it("discloses unsupported escaped CSS token references", () => {
    const text = String.raw`.a { color: v\61 r(--salt-x); background: var(--salt\2d x); }`;
    const parsed = parseSubmittedArtifact({ language: "css", text });

    expect(parsed.limitations.join(" ")).toMatch(/CSS escapes/iu);
  });

  it("uses the declared grammar and reports exact UTF-8 byte locations", () => {
    expect(
      parseSubmittedArtifact({
        language: "javascript",
        text: "const value: string = 'not JavaScript';",
      }).parser,
    ).toBe("failed");

    const text = [
      'import { Button } from "@salt-ds/core";',
      'const emoji = "😀";',
      'export const Demo = () => <Button href="/next" />;',
    ].join("\r\n");
    const parsed = parseSubmittedArtifact({ language: "tsx", text });
    const href = parsed.facts.find(
      (fact) => fact.kind === "jsx_prop" && fact.property === "href",
    )!;
    const expectedStart = Buffer.byteLength(
      text.slice(0, text.indexOf("href")),
      "utf8",
    );

    expect(href.location).toMatchObject({
      start_offset: expectedStart,
      end_offset: expectedStart + Buffer.byteLength('href="/next"', "utf8"),
      start_line: 3,
    });
    expect(
      Buffer.from(text, "utf8")
        .subarray(href.location.start_offset, href.location.end_offset)
        .toString("utf8"),
    ).toBe('href="/next"');
  });
});
