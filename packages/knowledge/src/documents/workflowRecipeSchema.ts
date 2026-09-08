import * as z from "zod/v4";

import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { parseKnowledgeArtifactPath } from "../manifest/pathCodec.js";

const repositoryPathCodec = z
  .string()
  .min(1)
  .refine(
    (value) => isPortableRepositoryPath(value) && !value.includes("%"),
    "Expected a portable repository-relative path.",
  );

const applicationPathCodec = repositoryPathCodec.refine(
  (value) => value !== ".",
  "Expected a contained application-relative path.",
);

const artifactPathCodec = z
  .string()
  .min(1)
  .refine((value) => {
    try {
      parseKnowledgeArtifactPath(value);
      return true;
    } catch {
      return false;
    }
  }, "Expected a canonical Salt artifact path.");

const canonicalGuidanceCodec = z
  .string()
  .min(1)
  .refine((value) => {
    const [sourcePath, ...fragments] = value.split("#");
    return (
      fragments.length <= 1 &&
      repositoryPathCodec.safeParse(sourcePath).success &&
      (fragments.length === 0 || fragments[0]?.length !== 0)
    );
  }, "Expected a contained repository path with at most one non-empty fragment.");

const nonEmptyUniqueStringsCodec = z
  .array(z.string().min(1))
  .min(1)
  .refine(
    (values) => new Set(values).size === values.length,
    "Expected unique values.",
  );

const uniqueStringsCodec = z
  .array(z.string().min(1))
  .refine(
    (values) => new Set(values).size === values.length,
    "Expected unique values.",
  );

export const authoredWorkflowRecipeCodec = z
  .object({
    id: z.literal("operations-dashboard.record-form"),
    title: z.string().min(1),
    intent: z
      .object({
        summary: z.string().min(1),
        aliases: nonEmptyUniqueStringsCodec,
      })
      .strict(),
    owner: z.string().min(1),
    readiness: z.enum(["contextual", "runnable", "workflow-verified"]),
    source: z
      .object({
        application: z.literal("examples/apps/operations-dashboard"),
        reusable_form_files: z
          .array(applicationPathCodec)
          .min(1)
          .refine(
            (values) => new Set(values).size === values.length,
            "Reusable files must be unique.",
          ),
        demo_application_files: z
          .array(applicationPathCodec)
          .min(1)
          .refine(
            (values) => new Set(values).size === values.length,
            "Demo files must be unique.",
          ),
        canonical_guidance: z
          .array(canonicalGuidanceCodec)
          .min(1)
          .refine(
            (values) => new Set(values).size === values.length,
            "Canonical guidance references must be unique.",
          ),
      })
      .strict(),
    setup: z
      .object({
        provider: z.string().min(1),
        theme_css: nonEmptyUniqueStringsCodec,
        dependency_manifest: applicationPathCodec,
        dialog_wrapper: z
          .object({
            owner: z.string().min(1),
            required_components: nonEmptyUniqueStringsCodec,
            form_components: nonEmptyUniqueStringsCodec,
          })
          .strict(),
      })
      .strict(),
    adaptation: z
      .object({
        draft_owner: z.string().min(1),
        inputs: nonEmptyUniqueStringsCodec,
        callbacks: nonEmptyUniqueStringsCodec,
        submission_state: nonEmptyUniqueStringsCodec,
        cancellation: z.string().min(1),
        simulation: z.string().min(1),
      })
      .strict(),
    acceptance: z
      .object({
        automated: nonEmptyUniqueStringsCodec,
        manual_review_pending: uniqueStringsCodec,
      })
      .strict(),
    limitations: nonEmptyUniqueStringsCodec,
  })
  .strict()
  .superRefine((recipe, context) => {
    const reusable = new Set(recipe.source.reusable_form_files);
    for (const file of recipe.source.demo_application_files) {
      if (reusable.has(file)) {
        context.addIssue({
          code: "custom",
          path: ["source", "demo_application_files"],
          message: `File is declared as both reusable and demo-only: ${file}.`,
        });
      }
    }
    if (
      recipe.source.reusable_form_files.length !== 3 ||
      recipe.source.demo_application_files.length !== 9
    ) {
      context.addIssue({
        code: "custom",
        path: ["source"],
        message:
          "The selected source inventory must contain 3 reusable files and 9 demo/setup files.",
      });
    }
    if (
      !reusable.has(recipe.setup.dependency_manifest) &&
      !recipe.source.demo_application_files.includes(
        recipe.setup.dependency_manifest,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["setup", "dependency_manifest"],
        message:
          "The dependency manifest must be included in the public-file inventory.",
      });
    }
    if (
      recipe.readiness === "workflow-verified" &&
      recipe.acceptance.manual_review_pending.length > 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["readiness"],
        message:
          "A workflow with pending manual review cannot be workflow-verified.",
      });
    }
  });

export type AuthoredWorkflowRecipe = z.infer<
  typeof authoredWorkflowRecipeCodec
>;

const workflowFileRoleCodec = z.enum(["reusable", "setup", "demo-only"]);

const workflowFileCodec = z
  .object({
    id: z.string().min(1),
    source_path: repositoryPathCodec,
    path: applicationPathCodec,
    artifact_path: artifactPathCodec,
    role: workflowFileRoleCodec,
    media_type: z.string().min(1),
    sha256: z.string().regex(/^sha256:[0-9a-f]{64}$/u),
    bytes: z.number().int().nonnegative(),
  })
  .strict();

const supportVectorCodec = z
  .object({
    name: z.string().min(1),
    version: z.string().min(1),
    role: z.enum(["reusable", "demo-only"]),
  })
  .strict();

export const emittedWorkflowRecipeCodec = z
  .object({
    contract: z.literal("salt-workflow-recipe/1"),
    schema_version: z.literal("1.0.0"),
    id: z.string().min(1),
    title: z.string().min(1),
    intent: authoredWorkflowRecipeCodec.shape.intent,
    owner: z.string().min(1),
    source_identity: z
      .object({
        recipe_sha256: z.string().regex(/^sha256:[0-9a-f]{64}$/u),
        semantic_source_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/u),
        content_identity: z.string().regex(/^sha256:[0-9a-f]{64}$/u),
      })
      .strict(),
    source: z
      .object({
        application: repositoryPathCodec,
        recipe: repositoryPathCodec,
        canonical_guidance: z.array(canonicalGuidanceCodec).min(1),
      })
      .strict(),
    files: z.array(workflowFileCodec).min(1),
    setup: authoredWorkflowRecipeCodec.shape.setup,
    adaptation: authoredWorkflowRecipeCodec.shape.adaptation,
    acceptance: authoredWorkflowRecipeCodec.shape.acceptance,
    limitations: authoredWorkflowRecipeCodec.shape.limitations,
    support: z
      .object({
        reusable_packages: z.array(supportVectorCodec).min(1),
        demo_packages: z.array(supportVectorCodec),
        external_dependencies: z.array(supportVectorCodec).min(1),
        provider: z.string().min(1),
        theme_css: nonEmptyUniqueStringsCodec,
      })
      .strict(),
    readiness: z
      .object({
        authored: z.enum(["contextual", "runnable", "workflow-verified"]),
        delivered: z.enum(["contextual", "runnable", "workflow-verified"]),
        static_validation: z.literal("passed"),
        packed_application_acceptance: z.enum(["required", "passed"]),
        manual_review: z.enum(["pending", "passed"]),
        pending_reviews: z.array(z.string().min(1)),
      })
      .strict(),
  })
  .strict()
  .superRefine((recipe, context) => {
    if (recipe.id !== "operations-dashboard.record-form") {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message:
          "The initial workflow contract only registers operations-dashboard.record-form.",
      });
    }
    if (recipe.source.application !== "examples/apps/operations-dashboard") {
      context.addIssue({
        code: "custom",
        path: ["source", "application"],
        message:
          "The initial workflow contract only exports the named operations dashboard application.",
      });
    }
    const reusableFiles = recipe.files.filter(
      (file) => file.role === "reusable",
    );
    const setupFiles = recipe.files.filter((file) => file.role === "setup");
    const demoFiles = recipe.files.filter((file) => file.role === "demo-only");
    if (
      reusableFiles.length !== 3 ||
      setupFiles.length !== 1 ||
      demoFiles.length !== 8
    ) {
      context.addIssue({
        code: "custom",
        path: ["files"],
        message:
          "The selected workflow must contain 3 reusable, 1 setup, and 8 demo-only public files.",
      });
    }
    for (const key of ["id", "path", "artifact_path"] as const) {
      const values = recipe.files.map((file) => file[key]);
      if (new Set(values).size !== values.length) {
        context.addIssue({
          code: "custom",
          path: ["files"],
          message: `Workflow file ${key} values must be unique.`,
        });
      }
    }
    for (const file of recipe.files) {
      const expectedSourcePath = `${recipe.source.application}/${file.path}`;
      const expectedArtifactPath = `examples/workflows/${recipe.id}/files/${file.path}`;
      if (file.source_path !== expectedSourcePath) {
        context.addIssue({
          code: "custom",
          path: ["files"],
          message: `Workflow file source path is inconsistent: ${file.source_path}.`,
        });
      }
      if (file.artifact_path !== expectedArtifactPath) {
        context.addIssue({
          code: "custom",
          path: ["files"],
          message: `Workflow artifact path is inconsistent: ${file.artifact_path}.`,
        });
      }
    }
    const dependencyManifest = recipe.files.find(
      (file) => file.path === recipe.setup.dependency_manifest,
    );
    if (dependencyManifest?.role !== "setup") {
      context.addIssue({
        code: "custom",
        path: ["setup", "dependency_manifest"],
        message:
          "The dependency manifest must be the one setup-role public file.",
      });
    }
    if (
      recipe.readiness.delivered === "workflow-verified" &&
      (recipe.readiness.packed_application_acceptance !== "passed" ||
        recipe.readiness.manual_review !== "passed")
    ) {
      context.addIssue({
        code: "custom",
        path: ["readiness", "delivered"],
        message:
          "workflow-verified delivery requires packed acceptance and completed manual review.",
      });
    }
  });

export type EmittedWorkflowRecipe = z.infer<typeof emittedWorkflowRecipeCodec>;

export function parseAuthoredWorkflowRecipe(
  value: unknown,
): AuthoredWorkflowRecipe {
  return authoredWorkflowRecipeCodec.parse(value);
}

export function parseEmittedWorkflowRecipe(
  value: unknown,
): EmittedWorkflowRecipe {
  return emittedWorkflowRecipeCodec.parse(value);
}
