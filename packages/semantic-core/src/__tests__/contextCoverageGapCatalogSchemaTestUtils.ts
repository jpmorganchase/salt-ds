import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateContextCoverageGapCatalog: ValidateFunction | null = null;

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

function getContextCoverageGapCatalogSchemaValidator(): ValidateFunction {
  if (validateContextCoverageGapCatalog) {
    return validateContextCoverageGapCatalog;
  }

  validateContextCoverageGapCatalog = new Ajv2020({
    allErrors: true,
    strict: false,
  }).compile(readJsonSchema("salt-context-coverage-gap-catalog.schema.json"));

  return validateContextCoverageGapCatalog;
}

export function validateSaltContextCoverageGapCatalogSchema(
  value: unknown,
): string[] {
  const validate = getContextCoverageGapCatalogSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
