import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { runCli } from "../cli.js";

const tempRoots: string[] = [];
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
let registryDir = "";

async function createTempDir(prefix: string) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempRoots.push(root);
  return root;
}

async function createExistingSaltRepo(prefix: string) {
  const rootDir = await createTempDir(prefix);
  await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: "existing-salt-repo",
        private: true,
        dependencies: {
          "@salt-ds/core": "^2.0.0",
          react: "^18.3.1",
        },
      },
      null,
      2,
    ),
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, ".salt", "team.json"),
    `${JSON.stringify(
      {
        contract: "project_conventions_v1",
        approved_wrappers: [],
        preferred_components: [],
        banned_choices: [],
        pattern_preferences: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "src", "ExistingPage.tsx"),
    [
      'import { Button } from "@salt-ds/core";',
      "",
      "export function ExistingPage() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );

  return rootDir;
}

async function createNonSaltRepo(prefix: string) {
  const rootDir = await createTempDir(prefix);
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: "non-salt-repo",
        private: true,
        dependencies: {
          "@example/external-ui": "^1.0.0",
          react: "^18.3.1",
        },
      },
      null,
      2,
    ),
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "src", "LegacyPage.tsx"),
    [
      'import { Button } from "@example/external-ui";',
      "",
      "export function LegacyPage() {",
      '  return <Button variant="contained">Save</Button>;',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );

  return rootDir;
}

async function createNewProjectRepo(prefix: string) {
  const rootDir = await createTempDir(prefix);
  await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: "new-project-repo",
        private: true,
        packageManager: "pnpm@9.1.0",
        dependencies: {
          react: "^18.3.1",
          vite: "^7.1.0",
        },
      },
      null,
      2,
    ),
    "utf8",
  );
  await fs.writeFile(
    path.join(rootDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["src/*"],
          },
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  return rootDir;
}

function withRegistry(args: string[]): string[] {
  return registryDir ? [...args, "--registry-dir", registryDir] : args;
}

beforeAll(async () => {
  registryDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-cli-workflow-registry-"),
  );
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: "2026-03-27T00:00:00Z",
  });
}, 40000);

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("consumer workflow scenarios", () => {
  it("supports the new-project bootstrap and create flow through init, info, and create", async () => {
    const rootDir = await createNewProjectRepo("salt-cli-create-workflow-");

    let initStdout = "";
    const initExitCode = await runCli(withRegistry(["init", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        initStdout += message;
      },
      writeStderr: () => {},
    });

    expect(initExitCode).toBe(0);
    const initPayload = JSON.parse(initStdout);
    expect(initPayload.workflow).toBe("init");
    expect(initPayload.policy).toEqual(
      expect.objectContaining({
        action: "created",
        mode: "team",
      }),
    );
    expect(initPayload.repoInstructions).toEqual(
      expect.objectContaining({
        action: "created",
        filename: "AGENTS.md",
      }),
    );

    let infoStdout = "";
    const infoExitCode = await runCli(withRegistry(["info", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        infoStdout += message;
      },
      writeStderr: () => {},
    });

    expect(infoExitCode).toBe(0);
    const infoPayload = JSON.parse(infoStdout);
    expect(infoPayload.workspace.kind).toBe("single-package");
    expect(infoPayload.framework.name).toBe("vite-react");
    expect(infoPayload.policy.teamConfigPath).toContain("/.salt/team.json");
    expect(infoPayload.policy.mode).toBe("team");
    expect(infoPayload.repoInstructions.filename).toBe("AGENTS.md");
    expect(infoPayload.workflows.create).toBe(true);

    let createStdout = "";
    const createExitCode = await runCli(
      withRegistry([
        "create",
        "link to another page from a toolbar action",
        "--include-starter-code",
        "--json",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          createStdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(createExitCode).toBe(0);
    const payload = JSON.parse(createStdout);
    expect(payload.workflow.id).toBe("create");
    expect(payload.result.intent).toEqual(
      expect.objectContaining({
        userTask: "link to another page from a toolbar action",
        keyInteraction: expect.any(String),
        compositionDirection: expect.any(String),
        canonicalChoice: expect.any(String),
        ruleIds: expect.arrayContaining([
          "create-task-first",
          "create-choose-composition-direction",
        ]),
      }),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.workflow.implementationGate).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clear|follow_through_required)$/),
        required_follow_through: expect.any(Array),
      }),
    );
    expect(payload.result.summary.solutionType).toBeTruthy();
    expect(payload.result.summary.decisionName).toBeTruthy();
    expect(payload.result.summary.suggestedFollowUps.length).toBeGreaterThan(0);
    expect(
      (payload.artifacts.notes ?? []).some((entry: string) =>
        entry.includes("No .salt/team.json detected yet"),
      ),
    ).toBe(false);
  });

  it("surfaces project-convention provenance when create is refined by team policy", async () => {
    const rootDir = await createNewProjectRepo(
      "salt-cli-create-conventions-workflow-",
    );
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: [
            {
              name: "AppLink",
              wraps: "Link",
              reason:
                "The repo wraps route links for analytics and router helpers.",
              import: {
                from: "@/navigation/AppLink",
                name: "AppLink",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      withRegistry(["create", "navigate to another route", "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("create");
    expect(payload.artifacts.projectConventions).toEqual(
      expect.objectContaining({
        policyMode: "team",
        consulted: true,
        applied: true,
        canonicalChoice: expect.objectContaining({
          name: "Link",
          source: "canonical_salt",
        }),
        appliedRule: expect.objectContaining({
          type: "approved-wrapper",
          replacement: "AppLink",
        }),
        finalChoice: expect.objectContaining({
          name: "AppLink",
          source: "project_conventions",
          changed: true,
          basedOn: "Link",
        }),
        finalRecommendation: "AppLink",
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        decisionName: "Link",
        finalDecisionName: "AppLink",
        finalDecisionSource: "project_policy",
      }),
    );
    expect(payload.workflow.confidence.reasons).toEqual(
      expect.arrayContaining([
        "Repo policy refined the canonical Salt answer for this project.",
      ]),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        "Project conventions changed the final project answer from Link to AppLink.",
      ]),
    );
  });

  it("surfaces layered stack provenance for package-backed and repo-local create policy", async () => {
    const rootDir = await createNewProjectRepo(
      "salt-cli-create-stack-workflow-",
    );
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@example/lob-salt-conventions",
          version: "1.2.3",
          main: "index.cjs",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "index.cjs",
      ),
      [
        "module.exports = {",
        "  markets: {",
        '    contract: "project_conventions_v1",',
        '    id: "lob-markets",',
        '    version: "1.0.0",',
        '    supported_salt_range: "^2.0.0",',
        "    approved_wrappers: [",
        "      {",
        '        name: "MarketsLink",',
        '        wraps: "Link",',
        '        reason: "The line of business wraps navigation links with default analytics.",',
        '        import: { from: "@/navigation/MarketsLink", name: "MarketsLink" },',
        "      },",
        "    ],",
        "  },",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_stack_v1",
          layers: [
            {
              id: "lob-defaults",
              scope: "line_of_business",
              source: {
                type: "package",
                specifier: "@example/lob-salt-conventions",
                export: "markets",
              },
            },
            {
              id: "team-checkout",
              scope: "team",
              source: {
                type: "file",
                path: "./team.json",
              },
              optional: true,
            },
            {
              id: "repo-overrides",
              scope: "repo",
              source: {
                type: "file",
                path: "./repo.json",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "repo.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: [
            {
              name: "DeskLink",
              wraps: "Link",
              reason: "The repo standardizes route links through one wrapper.",
              import: {
                from: "@/navigation/DeskLink",
                name: "DeskLink",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      withRegistry(["create", "navigate to another route", "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("create");
    expect(payload.artifacts.projectConventions).toEqual(
      expect.objectContaining({
        policyMode: "stack",
        consulted: true,
        applied: true,
        layersConsulted: expect.arrayContaining([
          expect.objectContaining({
            id: "lob-defaults",
            scope: "line_of_business",
          }),
          expect.objectContaining({
            id: "team-checkout",
            scope: "team",
          }),
          expect.objectContaining({
            id: "repo-overrides",
            scope: "repo",
          }),
        ]),
        canonicalChoice: expect.objectContaining({
          name: "Link",
          source: "canonical_salt",
        }),
        appliedRule: expect.objectContaining({
          type: "approved-wrapper",
          replacement: "DeskLink",
          layer: expect.objectContaining({
            id: "repo-overrides",
            scope: "repo",
          }),
        }),
        finalChoice: expect.objectContaining({
          name: "DeskLink",
          source: "project_conventions",
          changed: true,
          basedOn: "Link",
        }),
        finalRecommendation: "DeskLink",
        warnings: [],
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        decisionName: "Link",
        finalDecisionName: "DeskLink",
        finalDecisionSource: "project_policy",
      }),
    );
    expect(payload.workflow.confidence.reasons).toEqual(
      expect.arrayContaining([
        "Repo policy refined the canonical Salt answer for this project.",
      ]),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        "Project conventions changed the final project answer from Link to DeskLink.",
        "Project policy layer applied: repo-overrides (repo).",
        "Project policy layers consulted: lob-defaults (line_of_business), team-checkout (team), repo-overrides (repo).",
      ]),
    );
    expect(payload.artifacts.projectConventions.warnings).toHaveLength(0);
  });

  it("skips an incompatible shared conventions pack and keeps the canonical create answer visible", async () => {
    const rootDir = await createNewProjectRepo(
      "salt-cli-create-incompatible-pack-",
    );
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "new-project-repo",
          private: true,
          packageManager: "pnpm@9.1.0",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            react: "^18.3.1",
            vite: "^7.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@example/lob-salt-conventions",
          version: "1.2.3",
          main: "index.cjs",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "index.cjs",
      ),
      [
        "module.exports = {",
        "  markets: {",
        '    contract: "project_conventions_v1",',
        '    id: "lob-markets",',
        '    version: "1.0.0",',
        '    supported_salt_range: "^1.0.0",',
        "    approved_wrappers: [",
        "      {",
        '        name: "MarketsLink",',
        '        wraps: "Link",',
        '        reason: "The line of business wraps navigation links with default analytics.",',
        '        import: { from: "@/navigation/MarketsLink", name: "MarketsLink" },',
        "      },",
        "    ],",
        "  },",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_stack_v1",
          layers: [
            {
              id: "lob-defaults",
              scope: "line_of_business",
              source: {
                type: "package",
                specifier: "@example/lob-salt-conventions",
                export: "markets",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      withRegistry(["create", "navigate to another route", "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.artifacts.projectConventions).toEqual(
      expect.objectContaining({
        policyMode: "stack",
        consulted: true,
        applied: false,
        mergeReason: "canonical-only",
        finalChoice: expect.objectContaining({
          name: "Link",
          source: "canonical_salt",
          changed: false,
        }),
        warnings: expect.arrayContaining([
          expect.stringContaining("supports ^1.0.0"),
        ]),
      }),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Project conventions were checked and kept the canonical Salt answer",
        ),
      ]),
    );
  });

  it("supports the review workflow for an existing Salt repo", async () => {
    const rootDir = await createExistingSaltRepo("salt-cli-review-workflow-");

    let stdout = "";
    const exitCode = await runCli(withRegistry(["review", "src", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: () => {},
    });

    expect(exitCode).toBe(2);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("review");
    expect(payload.artifacts.issueClasses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "review-canonical-mismatch",
          count: expect.any(Number),
        }),
      ]),
    );
    expect(payload.artifacts.ruleIds).toEqual(
      expect.arrayContaining(["review-canonical-mismatch"]),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
      }),
    );
    expect(payload.result.summary.filesNeedingAttention).toBe(1);
    expect(payload.result.sourceValidation.files[0]?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "component-choice.navigation",
        }),
      ]),
    );
  });

  it("returns review fix candidates for deterministic Salt source migrations", async () => {
    const rootDir = await createTempDir("salt-cli-review-fix-workflow-");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "existing-salt-fix-repo",
          private: true,
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            react: "^18.3.1",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "Deprecated.tsx"),
      [
        'import { Button } from "@salt-ds/core";',
        "",
        "export function Deprecated() {",
        '  return <Button variant="cta">Go</Button>;',
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(withRegistry(["review", "src", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: () => {},
    });

    expect(exitCode).toBe(2);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("review");
    expect(payload.artifacts.fixCandidates).toEqual(
      expect.objectContaining({
        deterministicCount: 1,
      }),
    );
    expect(payload.artifacts.fixCandidates.files[0]?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "review-migration-upgrade-risk",
        }),
      ]),
    );
    expect(payload.result.summary.status).toBe("needs_attention");
    const originalSource = await fs.readFile(
      path.join(rootDir, "src", "Deprecated.tsx"),
      "utf8",
    );
    expect(originalSource).toContain('variant="cta"');
  });

  it("surfaces extension-aware review checks when repo policy and wrapper conflicts are both present", async () => {
    const rootDir = await createTempDir(
      "salt-cli-review-conventions-workflow-",
    );
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "existing-salt-review-conventions-repo",
          private: true,
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            react: "^18.3.1",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: ["TrackedButton"],
          preferred_components: [],
          banned_choices: [],
          pattern_preferences: [],
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "TrackedButton.tsx"),
      [
        'import { Button } from "@salt-ds/core";',
        'import type { ComponentProps } from "react";',
        "",
        "export function TrackedButton(props: ComponentProps<typeof Button>) {",
        "  return <Button {...props} />;",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(withRegistry(["review", "src", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: () => {},
    });

    expect(exitCode).toBe(2);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("review");
    expect(payload.artifacts.ruleIds).toEqual(
      expect.arrayContaining(["review-composition-misuse"]),
    );
    expect(payload.workflow.projectConventionsCheck).toEqual(
      expect.objectContaining({
        policyMode: "team",
        declared: true,
        checkRecommended: true,
        topics: expect.arrayContaining(["wrappers", "page-patterns"]),
        teamConfigPath: expect.stringContaining("/.salt/team.json"),
        warnings: [],
      }),
    );
    expect(payload.workflow.confidence.reasons).toEqual(
      expect.arrayContaining([
        "Repo policy is declared and may still refine the final remediation choice.",
      ]),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        "Project conventions are declared through .salt/team.json.",
        expect.stringContaining("Project conventions topics to confirm"),
      ]),
    );
  });

  it("supports the migration workflow for an existing non-Salt repo", async () => {
    const rootDir = await createNonSaltRepo("salt-cli-migrate-workflow-");

    let stdout = "";
    const exitCode = await runCli(
      withRegistry([
        "migrate",
        "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
        "--json",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(2);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.artifacts.ruleIds).toEqual(
      expect.arrayContaining([
        "migrate-preserve-task-flow",
        "migrate-move-toward-canonical-salt",
      ]),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
      }),
    );
    expect(payload.result.migrationScope).toEqual(
      expect.objectContaining({
        questions: expect.arrayContaining([expect.any(String)]),
        preserveFocus: expect.arrayContaining([
          expect.stringContaining("task flow"),
        ]),
      }),
    );
    expect(payload.artifacts.postMigrationVerification).toEqual(
      expect.objectContaining({
        sourceChecks: expect.arrayContaining([expect.any(String)]),
        suggestedWorkflow: "review",
      }),
    );
    expect(payload.result.translation.familiarity_contract).toEqual(
      expect.objectContaining({
        preserve: expect.arrayContaining([
          expect.stringContaining("task flow"),
        ]),
        allow_salt_changes: expect.arrayContaining([
          expect.stringContaining("Salt-native"),
        ]),
      }),
    );
    expect(payload.result.translation.migration_checkpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "before",
        }),
        expect.objectContaining({
          phase: "after",
        }),
      ]),
    );
    expect(payload.result.translation.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          delta_category: expect.any(String),
          salt_target: expect.objectContaining({
            name: "Vertical navigation",
          }),
        }),
      ]),
    );
  });

  it("surfaces shared conventions-pack checks in the migration workflow", async () => {
    const rootDir = await createNonSaltRepo(
      "salt-cli-migrate-conventions-workflow-",
    );
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@example/lob-salt-conventions",
          version: "1.2.3",
          main: "index.cjs",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "index.cjs",
      ),
      [
        "module.exports = {",
        "  markets: {",
        '    contract: "project_conventions_v1",',
        '    id: "lob-markets",',
        '    version: "1.0.0",',
        '    supported_salt_range: "^2.0.0",',
        "    approved_wrappers: [",
        '      "MarketsAppShell",',
        "    ],",
        "    pattern_preferences: [",
        "      {",
        '        intent: "workspace shell navigation",',
        '        prefer: "MarketsAppShell",',
        '        canonical_salt_start: "Vertical navigation",',
        '        reason: "The line of business standardizes one app shell wrapper around Salt navigation regions.",',
        "      },",
        "    ],",
        "  },",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_stack_v1",
          layers: [
            {
              id: "lob-defaults",
              scope: "line_of_business",
              source: {
                type: "package",
                specifier: "@example/lob-salt-conventions",
                export: "markets",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      withRegistry([
        "migrate",
        "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
        "--json",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(2);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.workflow.projectConventionsCheck).toEqual(
      expect.objectContaining({
        policyMode: "stack",
        declared: true,
        checkRecommended: true,
        sharedPacks: ["@example/lob-salt-conventions#markets"],
        stackConfigPath: expect.stringContaining("/.salt/stack.json"),
        topics: expect.arrayContaining(["wrappers"]),
      }),
    );
    expect(payload.workflow.confidence.reasons).toEqual(
      expect.arrayContaining([
        "Repo policy is declared and should still be checked before finalizing wrapper, shell, or migration-shim choices.",
      ]),
    );
    expect(payload.artifacts.postMigrationVerification.sourceChecks).toEqual(
      expect.arrayContaining([
        "Confirm repo-local wrappers, shells, or migration shims from the declared project conventions before finalizing the migrated code.",
      ]),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        "Project conventions are declared through .salt/stack.json.",
        "Shared project conventions pack(s) available: @example/lob-salt-conventions#markets.",
      ]),
    );
  });

  it("supports the upgrade workflow for an existing Salt repo", async () => {
    const rootDir = await createExistingSaltRepo("salt-cli-upgrade-workflow-");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^1.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      withRegistry(["upgrade", "--include-deprecations", "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("upgrade");
    expect(payload.artifacts.ruleIds).toEqual(["upgrade-review-version-risks"]);
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([
          "Repo policy is declared and may still refine migration shims, wrappers, or compatibility decisions during the upgrade.",
        ]),
      }),
    );
    expect(payload.workflow.projectConventionsCheck).toEqual(
      expect.objectContaining({
        policyMode: "team",
        declared: true,
        checkRecommended: true,
        topics: expect.arrayContaining(["migration-shims"]),
        teamConfigPath: expect.stringContaining("/.salt/team.json"),
      }),
    );
    expect(payload.result.summary.target).toBe("@salt-ds/core");
    expect(payload.result.summary.fromVersion).toBe("1.1.0");
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Inferred from-version 1.1.0"),
        "Project conventions are declared through .salt/team.json.",
      ]),
    );
  });
});
