import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateReviewReport: ValidateFunction | null = null;

function readJsonSchema(name: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${name}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

function formatSchemaError(error: ErrorObject): string {
  const path = error.instancePath || "/";
  const extra =
    "additionalProperty" in error.params
      ? ` (${String(error.params.additionalProperty)})`
      : "";

  return `${path} ${error.message ?? "failed schema validation"}${extra}`;
}

function getReviewReportSchemaValidator(): ValidateFunction {
  if (validateReviewReport) {
    return validateReviewReport;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  ajv.addSchema(readJsonSchema("salt-generated-artifact.schema.json"));
  ajv.addSchema(
    readJsonSchema("salt-generated-artifact-release-gate.schema.json"),
  );
  validateReviewReport = ajv.compile(
    readJsonSchema("salt-review-report.schema.json"),
  );

  return validateReviewReport;
}

export function validateSaltReviewReportSchema(value: unknown): string[] {
  const validate = getReviewReportSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
