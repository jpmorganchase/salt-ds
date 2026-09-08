import { createHash } from "node:crypto";
import fs from "node:fs/promises";

import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

import {
  assertPackedWorkflowManifestMatchesSource,
  readPackedWorkflowRecipe,
  selectSampleAppNames,
  unavailableAnalysis,
  verifyCurrentCliCommands,
} from "./checkSaltSampleAppsHelpers.mjs";

const digest = `sha256:${"a".repeat(64)}`;
const otherDigest = `sha256:${"b".repeat(64)}`;
const integrity = `sha512-${"A".repeat(86)}==`;
const appNames = ["vite-starter", "next-app-router", "operations-dashboard"];

function result(value) {
  return {
    exitCode: 0,
    stderr: "",
    stdout: `${JSON.stringify(value)}\n`,
  };
}

function commandResults() {
  return {
    info: result({
      contract: "salt-cli-info/1",
      project: {
        root: ".",
        package_manifest: { path: "package.json" },
        workspace: { packageRoot: ".", workspaceRoot: null },
        packages: [
          {
            name: "@salt-ds/core",
            observed_manifest_path: "node_modules/@salt-ds/core/package.json",
          },
        ],
      },
      selection: { status: "selected", reason_code: "SALT_PROJECT_SELECTED" },
      coverage: { status: "complete", exact_project_package_vector: true },
      compatibility: { compatible: true },
      knowledge: { bundle_digest: digest, semantic_digest: digest },
    }),
    docs: result({
      contract: "salt-knowledge-document/1",
      status: "resolved",
      bundle: { digest },
      document: {
        reference: { id: "component.button" },
        citation: { record_key: "record:component:component.button" },
      },
    }),
    context: result({
      contract: "salt-knowledge-context/1",
      bundle_digest: digest,
      context_digest: digest,
      matches: [
        {
          reference: { id: "component.button" },
          citation: { record_key: "record:component:component.button" },
        },
      ],
    }),
  };
}

function workflowProof() {
  return {
    contract: "salt-sample-app-record-form-workflow/1",
    status: "pass",
    validation: "pass",
    cancellation_retains_draft: true,
    pending_duplicate_rejected: true,
    failure_preserves_draft: true,
    retry_succeeds: true,
    focus: "pass",
    labels_and_errors: "associated",
    viewport_css_px: 320,
    zoom_claim: "not_tested",
    screenshots: [
      "invalid.png",
      "pending.png",
      "failure.png",
      "narrow-320-css-px.png",
    ],
    validation_removed_variant: "rejected",
  };
}

function appCheck(app, commands) {
  return {
    app,
    build: "pass",
    typecheck: "pass",
    interaction: "pass",
    a11y: "pass",
    keyboard: "pass",
    runtime_errors: 0,
    external_requests: 0,
    commands,
    analysis: unavailableAnalysis(),
    ...(app === "next-app-router"
      ? { server_render: "pass", hydration: "pass" }
      : {}),
    ...(app === "operations-dashboard" ? { workflow: workflowProof() } : {}),
  };
}

function receipt(commands, selectedApps = ["operations-dashboard"]) {
  const artifactKey = selectedApps.length === 1 ? selectedApps[0] : "all";
  return {
    $schema:
      "https://www.saltdesignsystem.com/ai/schemas/salt-sample-app-cohort-receipt-2.json",
    schema_version: "2.0.0",
    contract: "salt-sample-app-cohort-receipt/2",
    source_commit: "b".repeat(40),
    apps: selectedApps.map((app) => ({
      name: app,
      path: `examples/apps/${app}`,
      manifest_sha256: digest,
      isolated_manifest_sha256: digest,
    })),
    knowledge_bundle: {
      version: "0.0.0",
      bundle_digest: digest,
      semantic_digest: digest,
      semantic_source_digest: digest,
      compiler_digest: digest,
    },
    packages: ["cli", "knowledge"].map((name) => ({
      name: `@salt-ds/${name}`,
      version: "0.0.0",
      roles: ["tooling"],
      used_by: selectedApps,
      source_manifest_sha256: digest,
      packed_manifest_sha256: digest,
      tarball: {
        path: `dist/salt-sample-apps/${artifactKey}.artifacts/salt-ds-${name}-0.0.0.tgz`,
        sha256: digest,
        integrity,
        bytes: 1,
        files: 1,
      },
    })),
    install: {
      package_manager: "npm",
      lockfiles: selectedApps.map((app) => ({
        app,
        sha256: digest,
        replay: "unchanged",
      })),
      source_manifests_unchanged: true,
      source_lockfiles_unchanged: true,
      workspace_links: 0,
      first_party_registry_fallbacks: 0,
      physical_first_party_packages: 2,
    },
    offline_guard: {
      status: "pass",
      phase: "post-install",
      allowed_hosts: ["127.0.0.1", "::1", "localhost"],
      negative_fixture: {
        target: "https://example.invalid/salt-sample-app-offline-guard",
        result: "blocked",
      },
    },
    checks: selectedApps.map((app) => appCheck(app, commands)),
  };
}

async function receiptValidator() {
  const schema = JSON.parse(
    await fs.readFile(
      new URL(
        "./schemas/saltSampleAppCohortReceiptV2.schema.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  return new Ajv2020({ allErrors: true, strict: true }).compile(schema);
}

describe("current sample-app selection", () => {
  it("selects the existing operations dashboard without adding an app", () => {
    expect(selectSampleAppNames("operations-dashboard")).toEqual([
      "operations-dashboard",
    ]);
    expect(() => selectSampleAppNames("new-dashboard")).toThrow(
      /Unknown sample app/u,
    );
  });
});

describe("packed workflow reconstruction input", () => {
  const workflowId = "operations-dashboard.record-form";
  const recipePath = `examples/workflows/${workflowId}/recipe.json`;
  const filePaths = [
    "index.html",
    "package.json",
    "src/OperationsDashboard.tsx",
    "src/dashboard.css",
    "src/main.tsx",
    "src/vite-env.d.ts",
    "src/workflows/record-form/RecordForm.css",
    "src/workflows/record-form/RecordForm.tsx",
    "src/workflows/record-form/localDemoAdapter.ts",
    "src/workflows/record-form/types.ts",
    "tsconfig.json",
    "vite.config.ts",
  ];

  it("accepts canonical packed manifest bytes from a CRLF repository source", () => {
    const packed = Buffer.from(
      '{\n  "name": "salt-operations-dashboard",\n  "private": true\n}\n',
    );
    const source = Buffer.from(
      packed.toString("utf8").replaceAll("\n", "\r\n"),
    );

    expect(() =>
      assertPackedWorkflowManifestMatchesSource(packed, source),
    ).not.toThrow();
  });

  it("rejects a packed manifest whose content differs from the source", () => {
    const source = Buffer.from(
      '{\r\n  "name": "salt-operations-dashboard",\r\n  "private": true\r\n}\r\n',
    );
    const packed = Buffer.from(
      '{\n  "name": "salt-operations-dashboard",\n  "private": false\n}\n',
    );

    expect(() =>
      assertPackedWorkflowManifestMatchesSource(packed, source),
    ).toThrow(/differs from the declared operations dashboard manifest/u);
  });

  function sha256(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
  }

  function canonical(value) {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
        .join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function fixture() {
    const packageBytes = Buffer.from(
      `${JSON.stringify(
        {
          name: "salt-operations-dashboard",
          private: true,
          type: "module",
          scripts: { typecheck: "tsc --noEmit", build: "vite build" },
          dependencies: {
            "@salt-ds/core": "1.0.0",
            "@salt-ds/theme": "1.0.0",
            react: "18.3.1",
          },
          devDependencies: { vite: "7.1.0" },
        },
        null,
        2,
      )}\n`,
    );
    const files = filePaths.map((filePath) => {
      const bytes =
        filePath === "package.json"
          ? packageBytes
          : Buffer.from(`packed ${filePath}\n`);
      const role = filePath.startsWith("src/workflows/record-form/")
        ? filePath.endsWith("localDemoAdapter.ts")
          ? "demo-only"
          : "reusable"
        : filePath === "package.json"
          ? "setup"
          : "demo-only";
      return {
        id: `workflow-file:${workflowId}:${filePath}`,
        path: filePath,
        artifact_path: `examples/workflows/${workflowId}/files/${filePath}`,
        role,
        sha256: sha256(bytes),
        bytes: bytes.byteLength,
        value: bytes,
      };
    });
    const recipe = {
      contract: "salt-workflow-recipe/1",
      schema_version: "1.0.0",
      id: workflowId,
      source: {
        application: "examples/apps/operations-dashboard",
        recipe:
          "examples/apps/operations-dashboard/src/workflows/record-form/recipe.json",
      },
      files: files.map(({ value, ...file }) => file),
      source_identity: {
        content_identity: sha256(
          Buffer.from(
            canonical(
              files.map(({ path, sha256: digest, bytes }) => ({
                path,
                sha256: digest,
                bytes,
              })),
            ),
          ),
        ),
      },
      support: {
        reusable_packages: [
          { name: "@salt-ds/core", version: "1.0.0", role: "reusable" },
          { name: "@salt-ds/theme", version: "1.0.0", role: "reusable" },
        ],
        demo_packages: [],
        external_dependencies: [
          { name: "react", version: "18.3.1", role: "reusable" },
        ],
        theme_css: ["@salt-ds/theme/css/global.css"],
      },
    };
    const artifacts = new Map([
      [recipePath, Buffer.from(JSON.stringify(recipe))],
      ...files.map((file) => [file.artifact_path, file.value]),
    ]);
    const calls = [];
    return {
      artifacts,
      calls,
      store: {
        manifest: {
          compatibility: {
            packages: [
              { name: "@salt-ds/core", tested_version: "1.0.0" },
              { name: "@salt-ds/theme", tested_version: "1.0.0" },
            ],
          },
        },
        getRecord: (family, id) =>
          family === "guide" && id === workflowId
            ? { id, detail_content_ref: { id: "content.forms.detail" } }
            : null,
        getContentValue: () => ({ recipe_manifest: recipePath }),
        readArtifact: (artifactPath) => {
          calls.push(artifactPath);
          const value = artifacts.get(artifactPath);
          if (!value)
            throw new Error(`Knowledge artifact is absent: ${artifactPath}`);
          return value;
        },
      },
    };
  }

  it("uses only installed Knowledge artifacts and never reads a repository app", () => {
    const { store, calls } = fixture();
    const workflow = readPackedWorkflowRecipe(store);
    expect(workflow.id).toBe(workflowId);
    expect(workflow.files.map((file) => file.path)).toEqual(
      expect.arrayContaining(filePaths),
    );
    expect(calls).toContain(recipePath);
    expect(calls).not.toContain(
      "examples/apps/operations-dashboard/package.json",
    );
    expect(calls.every((path) => path.startsWith("examples/workflows/"))).toBe(
      true,
    );
  });

  it("rejects a missing, tampered, redirected, or extra recipe artifact", () => {
    const missing = fixture();
    missing.artifacts.delete(
      `examples/workflows/${workflowId}/files/src/main.tsx`,
    );
    expect(() => readPackedWorkflowRecipe(missing.store)).toThrow(
      /artifact is absent/u,
    );

    const tampered = fixture();
    tampered.artifacts.set(
      `examples/workflows/${workflowId}/files/src/main.tsx`,
      Buffer.from("x".repeat("packed src/main.tsx\n".length)),
    );
    expect(() => readPackedWorkflowRecipe(tampered.store)).toThrow(/digest/u);

    const redirected = fixture();
    const recipe = JSON.parse(
      redirected.artifacts.get(recipePath).toString("utf8"),
    );
    recipe.files[0].artifact_path =
      "examples/workflows/elsewhere/files/index.html";
    redirected.artifacts.set(recipePath, Buffer.from(JSON.stringify(recipe)));
    expect(() => readPackedWorkflowRecipe(redirected.store)).toThrow(
      /artifact path is inconsistent/u,
    );

    const extra = fixture();
    const extraRecipe = JSON.parse(
      extra.artifacts.get(recipePath).toString("utf8"),
    );
    extraRecipe.files.push({
      ...extraRecipe.files[0],
      id: `workflow-file:${workflowId}:README.md`,
      path: "README.md",
      artifact_path: `examples/workflows/${workflowId}/files/README.md`,
    });
    extra.artifacts.set(recipePath, Buffer.from(JSON.stringify(extraRecipe)));
    expect(() => readPackedWorkflowRecipe(extra.store)).toThrow(
      /extra public files/u,
    );
  });
});

describe("current sample-app CLI checks", () => {
  it("propagates a supported command failure", async () => {
    const outputs = commandResults();
    await expect(
      verifyCurrentCliCommands({
        appRoot: "C:\\private\\app",
        knowledgeManifest: { bundle_digest: digest, semantic_digest: digest },
        invoke: async ([command]) => {
          if (command === "docs") throw new Error("docs failed");
          return outputs[command];
        },
      }),
    ).rejects.toThrow(/docs failed/u);
  });
});

describe("current sample-app receipt", () => {
  async function currentCommands() {
    const outputs = commandResults();
    return verifyCurrentCliCommands({
      appRoot: "C:\\private\\app",
      knowledgeManifest: { bundle_digest: digest, semantic_digest: digest },
      invoke: async ([command]) => outputs[command],
    });
  }

  it("accepts one correlated app check with explicitly unavailable analysis", async () => {
    const commands = await currentCommands();
    const validate = await receiptValidator();
    expect(validate(receipt(commands)), JSON.stringify(validate.errors)).toBe(
      true,
    );
  });

  it("accepts one check for every member of the full app cohort", async () => {
    const commands = await currentCommands();
    const validate = await receiptValidator();
    expect(
      validate(receipt(commands, appNames)),
      JSON.stringify(validate.errors),
    ).toBe(true);
  });

  it("rejects analysis that is missing or presented as clean", async () => {
    const commands = await currentCommands();
    const validate = await receiptValidator();
    const missing = receipt(commands);
    delete missing.checks[0].analysis;
    expect(validate(missing)).toBe(false);
    const clean = receipt(commands);
    clean.checks[0].analysis.clean_result = true;
    expect(validate(clean)).toBe(false);
  });

  it("rejects omitted, unrelated, and duplicate app checks", async () => {
    const commands = await currentCommands();
    const validate = await receiptValidator();

    const omitted = receipt(commands, appNames);
    omitted.checks = omitted.checks.filter(({ app }) => app !== "vite-starter");
    expect(validate(omitted)).toBe(false);

    const unrelated = receipt(commands);
    unrelated.checks.push(appCheck("vite-starter", commands));
    expect(validate(unrelated)).toBe(false);

    const duplicate = receipt(commands, appNames);
    duplicate.checks.push(structuredClone(duplicate.checks[0]));
    expect(validate(duplicate)).toBe(false);
  });

  it("rejects duplicate app names even when their metadata differs", async () => {
    const commands = await currentCommands();
    const validate = await receiptValidator();
    const duplicate = receipt(commands);
    duplicate.apps.push({
      ...duplicate.apps[0],
      manifest_sha256: otherDigest,
    });
    expect(validate(duplicate)).toBe(false);
  });

  it.each(["runtime_errors", "external_requests"])(
    "rejects a check missing common browser evidence %s",
    async (field) => {
      const commands = await currentCommands();
      const validate = await receiptValidator();
      const missing = receipt(commands);
      delete missing.checks[0][field];
      expect(validate(missing)).toBe(false);
    },
  );

  it.each(["server_render", "hydration"])(
    "rejects a Next check missing %s proof",
    async (field) => {
      const commands = await currentCommands();
      const validate = await receiptValidator();
      const missing = receipt(commands, ["next-app-router"]);
      delete missing.checks[0][field];
      expect(validate(missing)).toBe(false);
    },
  );

  it("rejects Next-only rendering proof on another app", async () => {
    const commands = await currentCommands();
    const validate = await receiptValidator();
    const unrelated = receipt(commands);
    unrelated.checks[0].server_render = "pass";
    unrelated.checks[0].hydration = "pass";
    expect(validate(unrelated)).toBe(false);
  });
});
