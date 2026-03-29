import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  type CanonicalSaltResult,
  composeProjectConventionLayers,
  materializeProjectConventionStackLayers,
  mergeCanonicalAndProjectConventionLayers,
  mergeCanonicalAndProjectConventionStack,
  type ProjectConventions,
  type ProjectConventionsStack,
  resolveProjectConventionStackLayers,
} from "../../../project-conventions-runtime/src/index.js";

function readJson(relativePath: string) {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

function mergeWithSingleRepoLayer(
  canonical: CanonicalSaltResult,
  conventions: ProjectConventions | null | undefined,
) {
  return mergeCanonicalAndProjectConventionLayers(
    canonical,
    conventions
      ? [
          {
            id: "team-checkout",
            scope: "team",
            source: "./team.json",
            conventions,
          },
        ]
      : [],
  );
}

describe("project conventions example contract", () => {
  it.each([
    "../../../../workflow-examples/project-conventions/project-conventions.example.json",
    "../../../../workflow-examples/project-conventions/project-conventions.wrapper-heavy.example.json",
    "../../../../workflow-examples/project-conventions/project-conventions.pattern-heavy.example.json",
    "../../../../workflow-examples/consumer-repo/.salt/team.json",
  ])("validates %s against the schema", (examplePath) => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    const schema = readJson("../../schemas/project-conventions.schema.json");
    const example = readJson(examplePath);
    const validate = ajv.compile(schema);
    const valid = validate(example);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("validates the consumer stack manifest against the stack schema", () => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    const schema = readJson(
      "../../../project-conventions-runtime/schemas/project-conventions-stack.schema.json",
    );
    const example = readJson(
      "../../../../workflow-examples/project-conventions/project-conventions.stack.example.json",
    );
    const validate = ajv.compile(schema);
    const valid = validate(example);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("can doctor a default consumer repo setup", () => {
    const cliPath = fileURLToPath(
      new URL(
        "../../../project-conventions-runtime/bin/salt-project-conventions.js",
        import.meta.url,
      ),
    );
    const repoPath = fileURLToPath(
      new URL("../../../../workflow-examples/consumer-repo", import.meta.url),
    );
    const output = execFileSync("node", [cliPath, "doctor", repoPath], {
      encoding: "utf8",
    });

    expect(output).toContain("Team file: valid (.salt/team.json)");
    expect(output).toContain("Stack file: not found");
    expect(output).toContain("Status: valid");
  });

  it("can validate the stack example explicitly", () => {
    const cliPath = fileURLToPath(
      new URL(
        "../../../project-conventions-runtime/bin/salt-project-conventions.js",
        import.meta.url,
      ),
    );
    const stackPath = fileURLToPath(
      new URL(
        "../../../../workflow-examples/project-conventions/project-conventions.stack.example.json",
        import.meta.url,
      ),
    );
    const output = execFileSync(
      "node",
      [cliPath, "validate", stackPath, "--kind", "stack"],
      {
        encoding: "utf8",
      },
    );

    expect(output).toContain("Valid stack file");
  });
});

describe("mergeCanonicalAndProjectConventionLayers with one repo layer", () => {
  it("applies repo conventions without rewriting the canonical source", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason:
              "Confirm whether the repo uses an approved wrapper before landing the final component choice.",
          },
        },
      },
      {
        preferred_components: [
          {
            salt_name: "Button",
            prefer: "AppButton",
            reason:
              "Product actions use AppButton for shared analytics defaults.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      canonical: {
        source: "canonical_salt",
        recommendation: "Button",
      },
      canonical_choice: {
        source: "canonical_salt",
        name: "Button",
      },
      project_conventions: {
        consulted: true,
        check_recommended: true,
        applied: true,
        topics: ["wrappers"],
        applied_rule: {
          type: "preferred-component",
        },
      },
      project_convention_applied: {
        type: "preferred-component",
        precedence: 2,
      },
      merge_reason: "preferred-component",
      why_changed:
        "Product actions use AppButton for shared analytics defaults.",
      final_choice: {
        name: "AppButton",
        source: "project_conventions",
        changed: true,
        based_on: "Button",
      },
      final_recommendation: "AppButton",
    });
  });

  it("can replace a canonical pattern with a repo pattern preference", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "VerticalNavigation",
          why: "Nearest canonical Salt navigation structure for the app shell.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["page-patterns", "navigation-shell"],
            reason:
              "Confirm whether the repo has an approved app-shell navigation pattern.",
          },
        },
      },
      {
        pattern_preferences: [
          {
            intent: "workspace shell navigation",
            canonical_salt_start: "VerticalNavigation",
            prefer: "WorkspaceShell",
            reason:
              "The repo uses one approved shell wrapper around canonical Salt navigation primitives.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_conventions: {
        consulted: true,
        applied: true,
        applied_rule: {
          type: "pattern-preference",
          replacement: "WorkspaceShell",
        },
      },
      merge_reason: "pattern-preference",
      final_recommendation: "WorkspaceShell",
    });
  });

  it("can replace a banned canonical choice with the configured replacement", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "UNSTABLE_SaltProviderNext",
          why: "Nearest canonical match from the imported code.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["migration-shims"],
            reason:
              "Confirm whether the repo bans this legacy provider before migration work starts.",
          },
        },
      },
      {
        banned_choices: [
          {
            name: "UNSTABLE_SaltProviderNext",
            replacement: "SaltProvider",
            reason: "The repo has standardized on SaltProvider only.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_conventions: {
        consulted: true,
        applied: true,
        applied_rule: {
          type: "banned-choice",
          replacement: "SaltProvider",
        },
      },
      merge_reason: "banned-choice",
      final_recommendation: "SaltProvider",
    });
  });

  it("keeps the canonical result when no project convention matches", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason: "Confirm whether the repo uses an approved wrapper.",
          },
        },
      },
      {
        preferred_components: [
          {
            salt_name: "Link",
            prefer: "AppLink",
            reason: "Only links are wrapped in this repo.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_conventions: {
        consulted: true,
        applied: false,
        applied_rule: null,
      },
      merge_reason: "canonical-only",
      why_changed: null,
      final_choice: {
        name: "Button",
        source: "canonical_salt",
        changed: false,
      },
      final_recommendation: "Button",
    });
  });

  it("applies banned choices ahead of preferred components", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason: "Check repo wrappers.",
          },
        },
      },
      {
        banned_choices: [
          {
            name: "Button",
            replacement: "SafeActionButton",
            reason: "Raw Button is banned on regulated action surfaces.",
          },
        ],
        preferred_components: [
          {
            salt_name: "Button",
            prefer: "AppButton",
            reason: "Most repo actions use AppButton.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_convention_applied: {
        type: "banned-choice",
        precedence: 1,
        replacement: "SafeActionButton",
      },
      final_recommendation: "SafeActionButton",
    });
  });

  it("applies preferred components ahead of approved wrappers", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason: "Check repo wrappers.",
          },
        },
      },
      {
        preferred_components: [
          {
            salt_name: "Button",
            prefer: "AppButton",
            reason: "Use the repo action wrapper by default.",
          },
        ],
        approved_wrappers: [
          {
            name: "ButtonWithTelemetry",
            wraps: "Button",
            reason: "Fallback analytics wrapper for some old screens.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_convention_applied: {
        type: "preferred-component",
        precedence: 2,
        replacement: "AppButton",
      },
      final_recommendation: "AppButton",
    });
  });

  it("applies approved wrappers ahead of pattern preferences when both match", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers", "page-patterns"],
            reason: "Check repo wrappers and patterns.",
          },
        },
      },
      {
        approved_wrappers: [
          {
            name: "ToolbarActionButton",
            wraps: "Button",
            reason: "Toolbar actions use one shared wrapper.",
            import: {
              from: "@/components/ToolbarActionButton",
              name: "ToolbarActionButton",
            },
            use_when: ["toolbar actions"],
            avoid_when: ["pure documentation stories"],
            migration_shim: false,
          },
        ],
        pattern_preferences: [
          {
            intent: "toolbar actions",
            canonical_salt_start: "Button",
            prefer: "ToolbarActionGroup",
            reason: "Toolbars are often grouped as one pattern.",
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_convention_applied: {
        type: "approved-wrapper",
        precedence: 3,
        replacement: "ToolbarActionButton",
        wraps: "Button",
        import: {
          from: "@/components/ToolbarActionButton",
          name: "ToolbarActionButton",
        },
        use_when: ["toolbar actions"],
        avoid_when: ["pure documentation stories"],
        migration_shim: false,
      },
      final_choice: {
        import: {
          from: "@/components/ToolbarActionButton",
          name: "ToolbarActionButton",
        },
      },
      final_recommendation: "ToolbarActionButton",
    });
  });

  it("carries richer wrapper provenance into the merged result", () => {
    const merged = mergeWithSingleRepoLayer(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason: "Check repo wrappers.",
          },
        },
      },
      {
        approved_wrappers: [
          {
            name: "AppButton",
            wraps: "Button",
            reason:
              "Product actions use the repo wrapper for analytics and defaults.",
            import: {
              from: "@/components/AppButton",
              name: "AppButton",
            },
            use_when: ["primary product actions"],
            avoid_when: ["sandbox examples"],
            migration_shim: true,
            docs: ["./docs/app-button.md"],
          },
        ],
      },
    );

    expect(merged).toMatchObject({
      project_convention_applied: {
        type: "approved-wrapper",
        replacement: "AppButton",
        wraps: "Button",
        import: {
          from: "@/components/AppButton",
          name: "AppButton",
        },
        use_when: ["primary product actions"],
        avoid_when: ["sandbox examples"],
        migration_shim: true,
        docs: ["./docs/app-button.md"],
      },
      final_choice: {
        name: "AppButton",
        source: "project_conventions",
        changed: true,
        based_on: "Button",
        import: {
          from: "@/components/AppButton",
          name: "AppButton",
        },
      },
    });
  });

  it("composes layered conventions with later layers overriding earlier layers in the same rule type", () => {
    const composed = composeProjectConventionLayers([
      {
        id: "lob-defaults",
        scope: "line_of_business",
        source: "@example/lob-conventions",
        conventions: {
          contract: "project_conventions_v1",
          version: "1.0.0",
          project: "lob-shared",
          preferred_components: [
            {
              salt_name: "Button",
              prefer: "LobButton",
              reason: "LoB actions use LobButton by default.",
            },
          ],
          banned_choices: [
            {
              name: "UNSTABLE_SaltProviderNext",
              replacement: "SaltProvider",
              reason: "LoB forbids the unstable provider.",
            },
          ],
          notes: ["LoB base conventions."],
        },
      },
      {
        id: "team-checkout",
        scope: "team",
        source: "./team.json",
        conventions: {
          contract: "project_conventions_v1",
          version: "2.0.0",
          project: "team-alpha",
          preferred_components: [
            {
              salt_name: "Button",
              prefer: "TeamButton",
              reason: "Team alpha uses TeamButton on product surfaces.",
            },
          ],
          approved_wrappers: [
            {
              name: "TeamLink",
              wraps: "Link",
              reason: "Team alpha wraps links for analytics.",
              import: {
                from: "@/components/TeamLink",
                name: "TeamLink",
              },
            },
          ],
          notes: ["Team conventions."],
        },
      },
    ]);

    expect(composed).toMatchObject({
      layers_consulted: [
        {
          id: "lob-defaults",
          scope: "line_of_business",
          source: "@example/lob-conventions",
        },
        {
          id: "team-checkout",
          scope: "team",
          source: "./team.json",
        },
      ],
      conventions: {
        contract: "project_conventions_v1",
        version: "2.0.0",
        project: "team-alpha",
        preferred_components: [
          {
            salt_name: "Button",
            prefer: "TeamButton",
          },
        ],
        approved_wrappers: [
          {
            wraps: "Link",
            name: "TeamLink",
            import: {
              from: "@/components/TeamLink",
              name: "TeamLink",
            },
          },
        ],
        banned_choices: [
          {
            name: "UNSTABLE_SaltProviderNext",
            replacement: "SaltProvider",
          },
        ],
        notes: expect.arrayContaining([
          "LoB base conventions.",
          "Team conventions.",
        ]),
      },
    });
    expect(composed.rule_sources).toEqual(
      expect.arrayContaining([
        {
          rule_type: "preferred-component",
          key: "Button",
          layer: {
            id: "team-checkout",
            scope: "team",
            source: "./team.json",
          },
        },
        {
          rule_type: "banned-choice",
          key: "UNSTABLE_SaltProviderNext",
          layer: {
            id: "lob-defaults",
            scope: "line_of_business",
            source: "@example/lob-conventions",
          },
        },
      ]),
    );
  });

  it("can merge canonical Salt guidance with layered LoB and team conventions", () => {
    const merged = mergeCanonicalAndProjectConventionLayers(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason:
              "Confirm whether the repo uses an approved wrapper before landing the final component choice.",
          },
        },
      },
      [
        {
          id: "lob-defaults",
          scope: "line_of_business",
          source: "@example/lob-conventions",
          conventions: {
            preferred_components: [
              {
                salt_name: "Button",
                prefer: "LobButton",
                reason: "LoB actions use LobButton by default.",
              },
            ],
          },
        },
        {
          id: "team-checkout",
          scope: "team",
          source: "./team.json",
          conventions: {
            preferred_components: [
              {
                salt_name: "Button",
                prefer: "TeamButton",
                reason: "Team alpha uses TeamButton on product surfaces.",
              },
            ],
          },
        },
      ],
    );

    expect(merged).toMatchObject({
      project_conventions: {
        consulted: true,
        check_recommended: true,
        layers_consulted: [
          {
            id: "lob-defaults",
            scope: "line_of_business",
          },
          {
            id: "team-checkout",
            scope: "team",
          },
        ],
        applied: true,
        applied_rule: {
          type: "preferred-component",
          replacement: "TeamButton",
          layer: {
            id: "team-checkout",
            scope: "team",
            source: "./team.json",
          },
        },
      },
      project_convention_layer_applied: {
        id: "team-checkout",
        scope: "team",
        source: "./team.json",
      },
      final_choice: {
        name: "TeamButton",
        source: "project_conventions",
        changed: true,
        based_on: "Button",
      },
      final_recommendation: "TeamButton",
    });
  });

  it("materializes stack layers in manifest order", () => {
    const stack = readJson(
      "../../../../workflow-examples/project-conventions/project-conventions.stack.example.json",
    ) as ProjectConventionsStack;

    const layers = materializeProjectConventionStackLayers(stack, {
      "lob-defaults": readJson(
        "../../../../workflow-examples/project-conventions/project-conventions.example.json",
      ) as ProjectConventions,
      "team-checkout": readJson(
        "../../../../workflow-examples/consumer-repo/.salt/team.json",
      ) as ProjectConventions,
    });

    expect(layers).toMatchObject([
      {
        id: "lob-defaults",
        scope: "line_of_business",
        source: "@example/lob-salt-conventions#markets",
      },
      {
        id: "team-checkout",
        scope: "team",
        source: "./team.json",
      },
    ]);
  });

  it("can resolve and merge a stack manifest with local layer sources", async () => {
    const stack = readJson(
      "../../../../workflow-examples/project-conventions/project-conventions.stack.example.json",
    ) as ProjectConventionsStack;

    const resolvedLayers = await resolveProjectConventionStackLayers(
      stack,
      async (layer) => {
        if (layer.id === "lob-defaults") {
          return readJson(
            "../../../../workflow-examples/project-conventions/project-conventions.example.json",
          ) as ProjectConventions;
        }

        return readJson(
          "../../../../workflow-examples/consumer-repo/.salt/team.json",
        ) as ProjectConventions;
      },
    );

    expect(resolvedLayers).toMatchObject([
      {
        id: "lob-defaults",
        scope: "line_of_business",
        source: "@example/lob-salt-conventions#markets",
      },
      {
        id: "team-checkout",
        scope: "team",
        source: "./team.json",
      },
    ]);

    const merged = await mergeCanonicalAndProjectConventionStack(
      {
        decision: {
          name: "Button",
          why: "Nearest canonical Salt primitive for an in-place action.",
        },
        guidance_boundary: {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended: true,
            topics: ["wrappers"],
            reason:
              "Confirm whether the repo uses an approved wrapper before landing the final component choice.",
          },
        },
      },
      stack,
      async (layer) => {
        if (layer.id === "lob-defaults") {
          return readJson(
            "../../../../workflow-examples/project-conventions/project-conventions.example.json",
          ) as ProjectConventions;
        }

        return readJson(
          "../../../../workflow-examples/consumer-repo/.salt/team.json",
        ) as ProjectConventions;
      },
    );

    expect(merged).toMatchObject({
      project_convention_layer_applied: {
        id: "team-checkout",
        scope: "team",
        source: "./team.json",
      },
      final_choice: {
        name: "AppButton",
        source: "project_conventions",
        changed: true,
        based_on: "Button",
      },
      final_recommendation: "AppButton",
    });
  });
});
