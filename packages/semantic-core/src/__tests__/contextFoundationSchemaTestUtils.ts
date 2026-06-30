import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateContextFoundation: ValidateFunction | null = null;

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

function getContextFoundationSchemaValidator(): ValidateFunction {
  if (validateContextFoundation) {
    return validateContextFoundation;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  ajv.addSchema(readJsonSchema("salt-generated-artifact.schema.json"));
  validateContextFoundation = ajv.compile(
    readJsonSchema("salt-context-foundation.schema.json"),
  );

  return validateContextFoundation;
}

export function validateSaltContextFoundationSchema(value: unknown): string[] {
  const validate = getContextFoundationSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
