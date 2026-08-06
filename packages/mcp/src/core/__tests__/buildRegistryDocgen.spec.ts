import { beforeAll, describe, expect, it } from "vitest";
import { REPO_ROOT } from "../../__tests__/registryTestUtils.js";
import {
  DOCGEN_PACKAGES,
  loadPropMetadata,
  type PropMetadata,
  sanitizePublicDocgenText,
  selectDocgenComponent,
  toComponentPropSubjects,
  toComponentProps,
} from "../build/buildRegistryDocgen.js";
import { buildPackageValueExportGraph } from "../build/catalogExportGraph.js";

let metadata: PropMetadata;

beforeAll(async () => {
  metadata = await loadPropMetadata(REPO_ROOT);
}, 180_000);

describe("registry docgen metadata", () => {
  it("sanitizes structured JSDoc before publishing prop prose", () => {
    const [prop] = toComponentProps({
      appearance: {
        description: [
          "Controls the visual treatment. Contact design@example.com for help.",
          "@deprecated since 1.36.0. Use {@link ButtonProps.appearance appearance} and {@link ButtonProps.sentiment sentiment} instead.",
          "| old | new |",
          "| --- | --- |",
          "@saltValueMap",
          '{"primary":"accented"}',
          "@since 1.0.0",
          "@param ignored internal metadata",
          "@returns nothing",
          "@see {@link ButtonProps}",
        ].join("\n"),
        required: false,
        type: { name: "string" },
      },
    });

    expect(prop).toMatchObject({
      description:
        "Controls the visual treatment. Contact design@example.com for help.",
      deprecated: true,
      deprecation_note: "since 1.36.0. Use appearance and sentiment instead.",
    });
    expect(JSON.stringify(prop)).not.toMatch(
      /\{@|@salt|@since|@param|@returns|@see|\| old/iu,
    );
  });

  it.each([
    ["", ""],
    ["Use {@link ButtonProps label}.", "Use label."],
    ["Use {@link ButtonProps}.", "Use ButtonProps."],
    ["Email docs@example.com for help.", "Email docs@example.com for help."],
    ["Public prose. @since 1.0.0", "Public prose."],
    ["Public prose.\n@see Button\nInternal continuation", "Public prose."],
  ])("sanitizes public docgen text %#", (raw, expected) => {
    expect(sanitizePublicDocgenText(raw)).toBe(expected);
  });

  it("loads every declared component package and excludes non-value types", () => {
    expect([...metadata.byPackage.keys()]).toEqual(
      DOCGEN_PACKAGES.map(({ packageName }) => packageName),
    );
    for (const { packageName } of DOCGEN_PACKAGES) {
      expect(metadata.byPackage.get(packageName)?.size).toBeGreaterThan(0);
    }
    expect(
      metadata.byPackage
        .get("@salt-ds/date-components")
        ?.has("datepickerstate"),
    ).toBe(false);
    expect(metadata.byPackage.has("@salt-ds/ag-grid-theme")).toBe(false);
    expect(
      metadata.byPackage.has("@salt-ds/react-resizable-panels-theme"),
    ).toBe(false);
  });

  it("loads core Button props directly from TypeScript sources", () => {
    const selection = selectDocgenComponent(
      metadata,
      "@salt-ds/core",
      "Button",
      [],
      "button",
      "packages/core/src/button",
      "Button",
    );
    const propNames = toComponentProps(selection.candidate?.props).map(
      (prop) => prop.name,
    );

    expect(selection.candidate).not.toBeNull();
    expect(propNames).toEqual(
      expect.arrayContaining(["appearance", "sentiment"]),
    );
  });

  it("binds component props to exact public owner identities", async () => {
    const selection = selectDocgenComponent(
      metadata,
      "@salt-ds/core",
      "Button",
      [],
      "button",
      "packages/core/src/button",
      "Button",
    );
    const graph = await buildPackageValueExportGraph(
      REPO_ROOT,
      "@salt-ds/core",
    );
    const subjects = toComponentPropSubjects(
      selection.candidate?.props,
      REPO_ROOT,
      graph,
      ".",
    );

    expect(subjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          package: "@salt-ds/core",
          entrypoint: ".",
          export_name: "ButtonProps",
          symbol_space: "type",
          member_path: [{ kind: "prop", name: "appearance" }],
        }),
      ]),
    );
    expect(subjects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          export_name: "OtherProps",
          member_path: [{ kind: "prop", name: "appearance" }],
        }),
      ]),
    );
  });

  it("binds inherited TextProps.variant to both Text and Link", async () => {
    const graph = await buildPackageValueExportGraph(
      REPO_ROOT,
      "@salt-ds/core",
    );
    for (const [name, routeSuffix, sourceRepoPath] of [
      ["Text", "text", "packages/core/src/text"],
      ["Link", "link", "packages/core/src/link"],
    ] as const) {
      const selection = selectDocgenComponent(
        metadata,
        "@salt-ds/core",
        name,
        [],
        routeSuffix,
        sourceRepoPath,
        name,
      );
      const subjects = toComponentPropSubjects(
        selection.candidate?.props,
        REPO_ROOT,
        graph,
        ".",
      );

      expect(subjects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            package: "@salt-ds/core",
            entrypoint: ".",
            export_name: "TextProps",
            symbol_space: "type",
            member_path: [{ kind: "prop", name: "variant" }],
          }),
        ]),
      );
    }
  });

  it("includes date-components metadata and excludes hooks", () => {
    const selection = selectDocgenComponent(
      metadata,
      "@salt-ds/date-components",
      "DatePicker",
      [],
      "date-picker",
      "packages/date-components/src/date-picker",
      "DatePicker",
    );
    expect(selection.candidate).not.toBeNull();
    expect(toComponentProps(selection.candidate?.props).length).toBeGreaterThan(
      0,
    );

    for (const packageEntries of metadata.byPackage.values()) {
      expect(
        [...packageEntries.values()]
          .flat()
          .some(
            (candidate) =>
              typeof candidate.displayName === "string" &&
              candidate.displayName.startsWith("use"),
          ),
      ).toBe(false);
    }
  });

  it("rejects an authored primary export with equally ranked docgen candidates", () => {
    const duplicateMetadata: PropMetadata = {
      byPackage: new Map([
        [
          "@salt-ds/fixture",
          new Map([
            [
              "fixtureaction",
              [
                { displayName: "FixtureAction", props: {} },
                { displayName: "FixtureAction", props: {} },
              ],
            ],
          ]),
        ],
      ]),
    };

    expect(() =>
      selectDocgenComponent(
        duplicateMetadata,
        "@salt-ds/fixture",
        "Fixture action",
        [],
        "fixture-action",
        "packages/fixture/src/fixture-action",
        "FixtureAction",
      ),
    ).toThrow(/equally ranked docgen candidates/u);
  });

  it.each([
    {
      componentName: "Date input",
      aliases: ["DateInputSingle", "DateInputRange"],
      routeSuffix: "date-input",
      sourceRepoPath: "packages/date-components/src/date-input",
    },
    {
      componentName: "Range date picker",
      aliases: [],
      routeSuffix: "date-picker/range-date-picker",
      sourceRepoPath: "packages/date-components/src/date-picker",
    },
  ])("does not select an arbitrary docgen export for $componentName when primaryExport is explicitly null", ({
    componentName,
    aliases,
    routeSuffix,
    sourceRepoPath,
  }) => {
    const selection = selectDocgenComponent(
      metadata,
      "@salt-ds/date-components",
      componentName,
      aliases,
      routeSuffix,
      sourceRepoPath,
      null,
    );

    expect(selection.inference.candidate_count).toBeGreaterThan(0);
    expect(selection.candidate).toBeNull();
    expect(selection.inference.selected_display_name).toBeNull();
    expect(selection.inference.selected_score).toBeNull();
  });
});
