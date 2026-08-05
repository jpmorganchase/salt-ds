import { describe, expect, it } from "vitest";
import { linkDeprecationsToComponents } from "../build/buildRegistryComponentDeprecations.js";
import type {
  ApiSymbolIdentity,
  ComponentRecord,
  DeprecationRecord,
} from "../types.js";

function component(name: string): ComponentRecord {
  return {
    id: `component.${name.toLowerCase()}`,
    name,
    aliases: [],
    package: {
      name: "@salt-ds/core",
      status: "stable",
      since: null,
    },
    summary: `${name} fixture.`,
    status: "stable",
    category: [],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [
      {
        name: "legacy",
        type: "string",
        required: false,
        description: "Fixture prop.",
        deprecated: true,
      },
    ],
    prop_subjects: ["ButtonProps", "PublicButtonProps"].map((exportName) => ({
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: exportName,
      symbol_space: "type" as const,
      member_path: [{ kind: "prop" as const, name: "legacy" }],
    })),
    accessibility: { summary: [], rules: [] },
    patterns: [],
    examples: [],
    related_docs: {
      overview: null,
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: `packages/core/src/${name.toLowerCase()}/${name}.tsx`,
      export_name: name,
    },
    deprecations: [],
    last_verified_at: null,
  };
}

function memberDeprecation(
  owner: string,
  member: string,
  kind: ApiSymbolIdentity["member_path"][number]["kind"],
): DeprecationRecord {
  return {
    id: `deprecation.${owner}.${member}.${kind}`,
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: owner,
      symbol_space: kind === "static_method" ? "type_and_value" : "type",
      member_path: [{ kind, name: member }],
    },
    package: "@salt-ds/core",
    component: owner.replace(/Props$/u, ""),
    kind: kind === "prop" ? "prop" : "method",
    name: member,
    deprecated_in: null,
    removed_in: null,
    replacement: {
      mode: "none",
      target: null,
      targets: [],
      type: null,
      name: null,
      notes: null,
    },
    migration: {
      strategy: "manual",
      value_map: null,
      details: [],
    },
    source_paths: ["packages/core/src/button/FixtureApi.ts"],
    source_occurrences: [
      {
        source_path: "packages/core/src/button/FixtureApi.ts",
        source_range: {
          start_offset: 0,
          end_offset: 1,
          start_line: 1,
          start_column: 1,
          end_line: 1,
          end_column: 2,
        },
      },
    ],
    source_urls: [],
  };
}

function topLevelDeprecation(
  exportName: string,
  sourcePath: string,
): DeprecationRecord {
  const deprecation = memberDeprecation(exportName, "unused", "method");
  return {
    ...deprecation,
    id: `deprecation.${exportName}.top-level`,
    subject: {
      ...deprecation.subject,
      symbol_space: "type_and_value",
      member_path: [],
    },
    component: exportName,
    kind: "other",
    name: exportName,
    source_paths: [sourcePath],
    source_occurrences: deprecation.source_occurrences.map((occurrence) => ({
      ...occurrence,
      source_path: sourcePath,
    })),
  };
}

describe("component deprecation linking", () => {
  it("never matches a member name or source path when its public owner is unrelated", () => {
    const button = component("Button");
    const collision = memberDeprecation("FixtureApi", "Button", "method");

    const linked = linkDeprecationsToComponents([button], [collision]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]).toMatchObject({
      component: null,
      inference: {
        matched_component_names: [],
        component_inferred: false,
        ambiguous_component_match: false,
      },
    });
  });

  it.each([
    ["ButtonProps", "legacy", "prop"],
    ["Button", "legacyStatic", "static_method"],
  ] as const)("links an immediate %s member only through its public owner", (owner, member, kind) => {
    const button = component("Button");
    const deprecation = memberDeprecation(owner, member, kind);

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([deprecation.id]);
    expect(linked.deprecations[0]?.component).toBe("Button");
  });

  it("preserves a source-backed component association when the public owner is aliased", () => {
    const button = component("Button");
    const deprecation = memberDeprecation(
      "PublicButtonProps",
      "legacy",
      "prop",
    );
    deprecation.component = "Button";

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([deprecation.id]);
    expect(linked.deprecations[0]?.component).toBe("Button");
  });

  it("rejects a prop association whose public owner is not proved by the component", () => {
    const button = component("Button");
    const deprecation = memberDeprecation("OtherProps", "legacy", "prop");
    deprecation.component = "Button";

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
  });

  it("does not treat a type-only class owner as a runtime component", () => {
    const button = component("Button");
    const deprecation = memberDeprecation("Button", "legacy", "method");
    deprecation.component = null;

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
  });

  it("does not link a same-named API export from an unrelated source subtree", () => {
    const button = component("Button");
    const deprecation = topLevelDeprecation(
      "Button",
      "packages/core/src/testing/Button.ts",
    );

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
  });

  it("does not link a same-named API export from another file in the component directory", () => {
    const button = component("Button");
    const deprecation = topLevelDeprecation(
      "Button",
      "packages/core/src/button/Other.ts",
    );

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
  });

  it("does not promote a top-level type-only export to a component", () => {
    const button = component("Button");
    const deprecation = topLevelDeprecation(
      "Button",
      "packages/core/src/button/Button.tsx",
    );
    deprecation.subject.symbol_space = "type";
    deprecation.component = null;

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
    expect(linked.deprecations[0]?.kind).toBe("other");
  });

  it("links a same-named top-level component only with source provenance", () => {
    const button = component("Button");
    const deprecation = topLevelDeprecation(
      "Button",
      "packages/core/src/button/Button.tsx",
    );

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([deprecation.id]);
    expect(linked.deprecations[0]?.component).toBe("Button");
    expect(linked.deprecations[0]?.kind).toBe("component");
  });

  it("does not widen provenance for a dotted component source directory", () => {
    const button = component("Button");
    button.source = {
      repo_path: "packages/core/src/button.ts",
      export_name: null,
    };
    const deprecation = memberDeprecation("ButtonProps", "legacy", "prop");
    deprecation.source_paths = ["packages/core/src/other/FixtureApi.ts"];
    deprecation.source_occurrences = deprecation.source_occurrences.map(
      (occurrence) => ({
        ...occurrence,
        source_path: "packages/core/src/other/FixtureApi.ts",
      }),
    );

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
  });

  it("fails closed for a directory-backed top-level component source", () => {
    const button = component("Button");
    button.source = {
      repo_path: "packages/core/src/button",
      export_name: null,
    };
    const deprecation = topLevelDeprecation(
      "Button",
      "packages/core/src/button/Button.tsx",
    );

    const linked = linkDeprecationsToComponents([button], [deprecation]);

    expect(linked.components[0]?.deprecations).toEqual([]);
    expect(linked.deprecations[0]?.component).toBeNull();
    expect(linked.deprecations[0]?.kind).toBe("other");
  });
});
