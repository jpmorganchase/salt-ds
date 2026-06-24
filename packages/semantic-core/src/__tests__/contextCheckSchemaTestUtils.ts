import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateContextComponentCheck: ValidateFunction | null = null;
let validateGeneratedContextHealth: ValidateFunction | null = null;

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

function createAjv(): Ajv2020 {
  return new Ajv2020({
    allErrors: true,
    strict: false,
  });
}

function getContextComponentCheckSchemaValidator(): ValidateFunction {
  if (validateContextComponentCheck) {
    return validateContextComponentCheck;
  }

  validateContextComponentCheck = createAjv().compile(
    readJsonSchema("salt-context-component-check.schema.json"),
  );

  return validateContextComponentCheck;
}

function getGeneratedContextHealthSchemaValidator(): ValidateFunction {
  if (validateGeneratedContextHealth) {
    return validateGeneratedContextHealth;
  }

  validateGeneratedContextHealth = createAjv().compile(
    readJsonSchema("salt-generated-context-health.schema.json"),
  );

  return validateGeneratedContextHealth;
}

export function validateSaltContextComponentCheckSchema(
  value: unknown,
): string[] {
  const validate = getContextComponentCheckSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}

export function validateSaltGeneratedContextHealthSchema(
  value: unknown,
): string[] {
  const validate = getGeneratedContextHealthSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
