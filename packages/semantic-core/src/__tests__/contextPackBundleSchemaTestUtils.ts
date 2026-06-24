import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateContextPackBundle: ValidateFunction | null = null;
let validateContextPackPersistenceCheck: ValidateFunction | null = null;

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

function getContextPackBundleSchemaValidator(): ValidateFunction {
  if (validateContextPackBundle) {
    return validateContextPackBundle;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  ajv.addSchema(readJsonSchema("salt-context-pack-manifest.schema.json"));
  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  ajv.addSchema(readJsonSchema("salt-generated-artifact.schema.json"));
  ajv.addSchema(readJsonSchema("salt-context-unsupported-surface.schema.json"));
  validateContextPackBundle = ajv.compile(
    readJsonSchema("salt-context-pack-bundle.schema.json"),
  );

  return validateContextPackBundle;
}

export function validateSaltContextPackBundleSchema(value: unknown): string[] {
  const validate = getContextPackBundleSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}

function getContextPackPersistenceCheckSchemaValidator(): ValidateFunction {
  if (validateContextPackPersistenceCheck) {
    return validateContextPackPersistenceCheck;
  }

  validateContextPackPersistenceCheck = new Ajv2020({
    allErrors: true,
    strict: false,
  }).compile(readJsonSchema("salt-context-pack-persistence-check.schema.json"));

  return validateContextPackPersistenceCheck;
}

export function validateSaltContextPackPersistenceCheckSchema(
  value: unknown,
): string[] {
  const validate = getContextPackPersistenceCheckSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
