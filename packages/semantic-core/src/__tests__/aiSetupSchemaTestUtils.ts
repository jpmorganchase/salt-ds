import { readFileSync } from "node:fs";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";

let validateAiSetup: ValidateFunction | null = null;

function readJsonSchema(name: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${name}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

function formatSchemaError(error: {
  instancePath?: string;
  message?: string;
}): string {
  return `${error.instancePath || "/"} ${error.message ?? "failed"}`;
}

function getAiSetupSchemaValidator(): ValidateFunction {
  if (validateAiSetup) {
    return validateAiSetup;
  }

  validateAiSetup = new Ajv2020({
    allErrors: true,
    strict: false,
  }).compile(readJsonSchema("salt-ai-setup.schema.json"));

  return validateAiSetup;
}

export function validateSaltAiSetupSchema(value: unknown): string[] {
  const validate = getAiSetupSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
