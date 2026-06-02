import { readFileSync } from "node:fs";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";

let validateReleaseGate: ValidateFunction | null = null;
let validateReleaseGateBatch: ValidateFunction | null = null;

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

function getReleaseGateSchemaValidator(): ValidateFunction {
  if (validateReleaseGate) {
    return validateReleaseGate;
  }

  validateReleaseGate = new Ajv2020({
    allErrors: true,
    strict: false,
  }).compile(
    readJsonSchema("salt-generated-artifact-release-gate.schema.json"),
  );

  return validateReleaseGate;
}

function getReleaseGateBatchSchemaValidator(): ValidateFunction {
  if (validateReleaseGateBatch) {
    return validateReleaseGateBatch;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  ajv.addSchema(
    readJsonSchema("salt-generated-artifact-release-gate.schema.json"),
  );
  validateReleaseGateBatch = ajv.compile(
    readJsonSchema("salt-generated-artifact-release-gate-batch.schema.json"),
  );

  return validateReleaseGateBatch;
}

export function validateSaltGeneratedArtifactReleaseGateSchema(
  value: unknown,
): string[] {
  const validate = getReleaseGateSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}

export function validateSaltGeneratedArtifactReleaseGateBatchSchema(
  value: unknown,
): string[] {
  const validate = getReleaseGateBatchSchemaValidator();
  const valid = validate(value);

  return valid ? [] : (validate.errors ?? []).map(formatSchemaError);
}
