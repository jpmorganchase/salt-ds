import { readFileSync } from "node:fs";
import type { ErrorObject, ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";

let validateContextComponent: ValidateFunction | null = null;

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

function getContextComponentSchemaValidator(): ValidateFunction {
  if (validateContextComponent) {
    return validateContextComponent;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  ajv.addSchema(readJsonSchema("salt-generated-artifact.schema.json"));
  validateContextComponent = ajv.compile(
    readJsonSchema("salt-context-component.schema.json"),
  );

  return validateContextComponent;
}

export function validateSaltContextComponentSchema(value: unknown): string[] {
  const validate = getContextComponentSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
