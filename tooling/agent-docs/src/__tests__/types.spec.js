import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createTypeIndex, namesIn } from "../types.mjs";

const roots = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function packages(files) {
  const root = await mkdtemp(path.join(tmpdir(), "salt-agent-types-"));
  roots.push(root);
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  return root;
}

describe("createTypeIndex", () => {
  it("resolves the names a props table uses as TypeScript does, through their imports", async () => {
    const root = await packages({
      "core/src/thing/Thing.tsx": `import type { MouseEventHandler } from "react";
        import type { ResponsiveProp } from "../utils";
        export type Value = string | number;
        export interface ThingProps<Item> {
          value?: Value;
          onPick?: (item: Item) => void;
          size?: ResponsiveProp<number>;
          onClick?: MouseEventHandler;
        }
        export const Thing = (props: ThingProps<string>) => null;`,
      "core/src/other/Other.tsx": "export type Value = boolean;",
      "core/src/utils/index.ts": 'export * from "./ResponsiveProp";',
      "core/src/utils/ResponsiveProp.ts": `export type ResponsiveProp<T> = T | BreakpointProp<T>;
        export type BreakpointProp<T> = { [K in keyof Breakpoints]?: T };
        /** Comments are left out. */
        export interface Breakpoints { xs: number; sm: number }`,
      // A private alias elsewhere with React's name isn't React's type.
      "lab/src/dropdown/useClickAway.ts":
        "type MouseEventHandler = (e: MouseEvent) => void;",
      "core/src/__tests__/Thing.spec.tsx": "export type Ignored = 1;",
    });
    const index = createTypeIndex({ packagesDir: root });
    const file = path.join(root, "core/src/thing/Thing.tsx");
    expect(
      index.definitions(
        [
          "Value",
          "((item: Item) => void)",
          "ResponsiveProp<number>",
          "MouseEventHandler",
        ],
        { file, componentName: "Thing" },
      ),
    ).toEqual([
      {
        name: "Value",
        kind: "alias",
        signature: "Value",
        text: "string | number",
        packageDirectory: "core",
      },
      { name: "Item", kind: "parameter", constraint: undefined },
      {
        name: "ResponsiveProp",
        kind: "alias",
        signature: "ResponsiveProp<T>",
        text: "T | BreakpointProp<T>",
        packageDirectory: "core",
      },
      {
        name: "BreakpointProp",
        kind: "alias",
        signature: "BreakpointProp<T>",
        text: "{ [K in keyof Breakpoints]?: T; }",
        packageDirectory: "core",
      },
    ]);
    expect(index.declaringFile("core", "Thing")).toBe(file);
    expect(index.declaringFile("core", "Missing")).toBeUndefined();
  });

  it("takes type parameters from the component's props types, not from other generics", async () => {
    const root = await packages({
      "dates/src/picker/Picker.tsx": `import type { Range } from "../range";
        import type { ListProps } from "./types";
        export type PickerProps = SingleProps | ListProps;
        export interface SingleProps { onFocus?: (event: SyntheticEvent<Element>) => void }
        export const Picker = forwardRef<HTMLDivElement, PickerProps>(() => null);
        function later<Item extends object>() {}`,
      "dates/src/picker/types.ts": `import type { Range } from "../range";
        export interface ListProps<Item extends DateType = DateType> { selected?: Range<Item> }`,
      "dates/src/range.ts": `export type Range<TDate> = { start?: TDate; end?: TDate };
        export type Long = ${Array.from({ length: 30 }, (_, index) => `"value-${index}"`).join(" | ")};`,
      // A generic elsewhere in the package doesn't make Element a parameter.
      "dates/src/useObserver.ts":
        "export function useObserver<Element extends HTMLElement>() {}",
    });
    const index = createTypeIndex({ packagesDir: root });
    const file = path.join(root, "dates/src/picker/Picker.tsx");
    expect(
      index.definitions(["Range<Item>", "Item", "SyntheticEvent<Element>"], {
        file,
        componentName: "Picker",
      }),
    ).toEqual([
      {
        name: "Range",
        kind: "alias",
        signature: "Range<TDate>",
        text: "{ start?: TDate; end?: TDate; }",
        packageDirectory: "dates",
      },
      { name: "Item", kind: "parameter", constraint: "DateType" },
    ]);
  });

  it("leaves out long definitions' text and definitions already shown, without counting them", async () => {
    const names = Array.from({ length: 8 }, (_, index) => `T${index}`);
    const root = await packages({
      "core/src/thing/Thing.tsx": `${names.map((name) => `export type ${name} = "${name}";`).join("\n")}
        export type Long = ${Array.from({ length: 30 }, (_, index) => `"value-${index}"`).join(" | ")};
        export const Thing = () => null;`,
    });
    const index = createTypeIndex({ packagesDir: root });
    const file = path.join(root, "core/src/thing/Thing.tsx");
    const shown = new Set();
    const first = index.definitions(
      ["Long", "T0", "T1"],
      { file, componentName: "Thing" },
      shown,
    );
    expect(
      first.map((definition) => [definition.name, definition.text]),
    ).toEqual([
      ["Long", undefined],
      ["T0", '"T0"'],
      ["T1", '"T1"'],
    ]);
    // Already-shown types don't use up the six definitions under a table.
    const second = index.definitions(
      ["Long", "T0", "T1", ...names.slice(2)],
      { file, componentName: "Thing" },
      shown,
    );
    expect(second.map((definition) => definition.name)).toEqual([
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
    ]);
  });
});

it("finds the elements a component's props extend", async () => {
  const root = await packages({
    "core/src/cell/Cell.tsx": `import type { ComponentPropsWithoutRef } from "react";
      export interface CellProps extends ComponentPropsWithoutRef<"td"> {}
      export const Cell = (props: CellProps) => null;`,
    "core/src/button/Button.tsx": `import type { ComponentPropsWithoutRef } from "react";
      export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {}`,
    "core/src/close/CloseButton.tsx": `import { type ButtonProps } from "../button/Button";
      export const CloseButton = forwardRef<HTMLButtonElement, ButtonProps>(() => null);`,
    "core/src/trigger/Trigger.tsx": `import type { ComponentPropsWithoutRef } from "react";
      export type TriggerProps = ComponentPropsWithoutRef<"button">;
      export const Trigger = (props: TriggerProps) => null;`,
    "core/src/field/Field.tsx": `import type { ComponentPropsWithoutRef } from "react";
      export interface FieldProps extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
        Pick<ComponentPropsWithoutRef<"textarea">, "value"> {}
      export const Field = (props: FieldProps) => null;`,
  });
  const index = createTypeIndex({ packagesDir: root });
  const elements = (name, file) =>
    index.elementsOf(name, path.join(root, "core/src", file));
  expect(elements("Cell", "cell/Cell.tsx")).toEqual(["td"]);
  expect(elements("CloseButton", "close/CloseButton.tsx")).toEqual(["button"]);
  expect(elements("Trigger", "trigger/Trigger.tsx")).toEqual(["button"]);
  expect(elements("Field", "field/Field.tsx")).toEqual(["div", "textarea"]);
});

it("gives a prop's declared type, each type of a union of props types, and describes a conditional type", async () => {
  const root = await packages({
    "adapters/src/types.ts": `export interface DateMap {}
      /**
       * The date object of the adapter, such as \`Date\`.
       *
       * More detail.
       */
      export type DateType = keyof DateMap extends never ? any : DateMap[keyof DateMap];`,
    "core/src/picker/Picker.tsx": `import type { DateType } from "../../../adapters/src/types";
      interface BaseProps<Selection> { value?: Selection; min?: DateType }
      export interface SingleProps extends BaseProps<DateType> { selected?: DateType | null; onPick?: (a: string | null) => void }
      export interface RangeProps extends BaseProps<Range> { selected?: Range | null }
      export type PickerProps = SingleProps | RangeProps;
      export const Picker = (props: PickerProps) => null;`,
  });
  const index = createTypeIndex({ packagesDir: root });
  const file = path.join(root, "core/src/picker/Picker.tsx");
  expect(index.declaredPropType("Picker", file, "selected")).toBe(
    "DateType | Range | null",
  );
  expect(index.declaredPropType("Picker", file, "min")).toBe("DateType");
  // An arrow function's `=>` doesn't split it.
  expect(index.declaredPropType("Picker", file, "onPick")).toBe(
    "(a: string | null) => void",
  );
  // Declared as a generic's own parameter, which means nothing here.
  expect(index.declaredPropType("Picker", file, "value")).toBeUndefined();
  expect(
    index.definitions(["DateType"], { file, componentName: "Picker" }),
  ).toEqual([
    {
      name: "DateType",
      kind: "alias",
      signature: "DateType",
      text: undefined,
      description: "The date object of the adapter, such as `Date`.",
      packageDirectory: "adapters",
    },
  ]);
});

it("finds capitalized type names outside string literals", () => {
  expect(
    namesIn(['"Pending" | Status', "(event: SyntheticEvent) => Item[]"]),
  ).toEqual(["Status", "SyntheticEvent", "Item"]);
});
