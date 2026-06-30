import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";

function readJsonSchema(name: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${name}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

export function validateSaltWorkflowFollowupReportSchema(
  value: unknown,
): string[] {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  ajv.addSchema(readJsonSchema("salt-generated-artifact.schema.json"));
  ajv.addSchema(
    readJsonSchema("salt-generated-artifact-release-gate.schema.json"),
  );
  const validate = ajv.compile(
    readJsonSchema("salt-workflow-followup-report.schema.json"),
  );

  return validate(value)
    ? []
    : (validate.errors ?? []).map(
        (error) => `${error.instancePath || "/"} ${error.message ?? "failed"}`,
      );
}
