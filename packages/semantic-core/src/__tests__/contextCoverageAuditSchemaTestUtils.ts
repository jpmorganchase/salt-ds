import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateContextCoverageAudit: ValidateFunction | null = null;

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

function getContextCoverageAuditSchemaValidator(): ValidateFunction {
  if (validateContextCoverageAudit) {
    return validateContextCoverageAudit;
  }

  validateContextCoverageAudit = new Ajv2020({
    allErrors: true,
    strict: false,
  }).compile(readJsonSchema("salt-context-coverage-audit.schema.json"));

  return validateContextCoverageAudit;
}

export function validateSaltContextCoverageAuditSchema(
  value: unknown,
): string[] {
  const validate = getContextCoverageAuditSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
