import { describe, expect, it } from "vitest";
import {
  analyzeFiles,
  analyzeSource,
  ancestors,
  parseSource,
  selectElements,
} from "../analysis/jsx";
import type { GradeContext } from "../checks/context";
import { propAbsent, propValue } from "../checks/jsx-elements";

function analyze(code: string) {
  return analyzeSource("src/A.tsx", parseSource("src/A.tsx", code));
}

function contextFor(code: string): GradeContext {
  const files = { "src/A.tsx": code };
  const analyses = analyzeFiles(files);
  const unavailable = () => {
    throw new Error("not needed");
  };
  return {
    files,
    fixture: "workspace-vite-react",
    analyses: () => analyses,
    registry: unavailable,
    typecheck: unavailable,
    biome: unavailable,
  };
}

describe("import resolution", () => {
  it("resolves aliased named imports to the exported name", () => {
    const analysis = analyze(
      'import { FormField as Field } from "@salt-ds/core";\nexport const A = () => <Field />;',
    );
    expect(analysis.elements.map((e) => [e.tagName, e.name, e.from])).toEqual([
      ["Field", "FormField", "@salt-ds/core"],
    ]);
  });

  it("resolves namespace member tags", () => {
    const analysis = analyze(
      'import * as Salt from "@salt-ds/core";\nexport const A = () => <Salt.FormField />;',
    );
    expect(analysis.elements[0]).toMatchObject({
      tagName: "Salt.FormField",
      name: "FormField",
      from: "@salt-ds/core",
    });
  });

  it("marks locally defined components as having no origin", () => {
    const analysis = analyze(
      "const FormField = () => null;\nexport const A = () => <FormField />;",
    );
    expect(analysis.elements[0]).toMatchObject({
      name: "FormField",
      from: null,
    });
    expect(
      selectElements([analysis], {
        element: "FormField",
        from: "@salt-ds/core",
      }),
    ).toEqual([]);
    expect(selectElements([analysis], { element: "FormField" })).toHaveLength(
      1,
    );
  });

  it("records where each import binding lives", () => {
    const analysis = analyze('\nimport { Input } from "@salt-ds/core";\n');
    expect(analysis.imports).toEqual([
      {
        local: "Input",
        imported: "Input",
        from: "@salt-ds/core",
        line: 2,
        column: 1,
        text: 'import { Input } from "@salt-ds/core";',
      },
    ]);
  });
});

describe("attribute values", () => {
  const code = `import { FormField } from "@salt-ds/core";
export const A = ({ flag }: { flag: boolean }) => (
  <FormField readOnly disabled={false} labelPlacement="left" id={"x"} necessity={flag ? "required" : "optional"} tabIndex={-1} />
);`;
  const [element] = analyze(code).elements;

  it("parses literals and keeps computed values as expressions", () => {
    expect(element.attributes.get("readOnly")).toMatchObject({
      kind: "literal",
      value: true,
    });
    expect(element.attributes.get("disabled")).toMatchObject({
      kind: "literal",
      value: false,
    });
    expect(element.attributes.get("labelPlacement")).toMatchObject({
      kind: "literal",
      value: "left",
    });
    expect(element.attributes.get("id")).toMatchObject({
      kind: "literal",
      value: "x",
    });
    expect(element.attributes.get("tabIndex")).toMatchObject({
      kind: "literal",
      value: -1,
    });
    expect(element.attributes.get("necessity")).toMatchObject({
      kind: "expression",
      text: 'flag ? "required" : "optional"',
    });
  });

  it("treats a computed value as undecidable, not as a failure", () => {
    const context = contextFor(
      'import { FormField } from "@salt-ds/core";\nexport const A = ({ ro }: { ro: boolean }) => <FormField readOnly={ro} />;',
    );
    const params = propValue.parse({
      element: "FormField",
      prop: "readOnly",
      equals: true,
    });
    expect(propValue.run(context, params).verdict).toBe("error");
  });

  it("treats spread props as undecidable for absence, and explicit props as decisive", () => {
    const spread = contextFor(
      'import { FormField } from "@salt-ds/core";\nexport const A = (p: object) => <FormField {...p} />;',
    );
    const params = propAbsent.parse({ element: "FormField", prop: "disabled" });
    expect(propAbsent.run(spread, params).verdict).toBe("error");
    const explicit = contextFor(
      'import { FormField } from "@salt-ds/core";\nexport const A = (p: object) => <FormField {...p} disabled />;',
    );
    expect(propAbsent.run(explicit, params).verdict).toBe("wrong");
  });
});

describe("ancestry", () => {
  it("walks through fragments and intrinsic elements", () => {
    const analysis = analyze(
      'import { FormField, Input } from "@salt-ds/core";\nexport const A = () => (<FormField><><div><Input /></div></></FormField>);',
    );
    const input = analysis.elements.find((e) => e.name === "Input");
    expect(input && ancestors(input).map((a) => a.name)).toEqual([
      "div",
      "FormField",
    ]);
  });
});
