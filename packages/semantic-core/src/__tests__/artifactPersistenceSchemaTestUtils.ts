import { readFileSync } from "node:fs";
import Ajv2020, {
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020.js";

function readJsonSchema(name: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${name}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

let validateArtifactPersistence: ValidateFunction | null = null;

function formatErrors(errors: ErrorObject[] | null | undefined): string[] {
  return (errors ?? []).map(
    (error) => `${error.instancePath || "/"} ${error.message ?? ""}`.trim(),
  );
}

function getArtifactPersistenceSchemaValidator(): ValidateFunction {
  if (validateArtifactPersistence) {
    return validateArtifactPersistence;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  ajv.addSchema(readJsonSchema("salt-generated-artifact-release-gate.schema.json"));
  validateArtifactPersistence = ajv.compile(
    readJsonSchema("salt-generated-artifact-persistence.schema.json"),
  );
  return validateArtifactPersistence;
}

export function validateSaltGeneratedArtifactPersistenceSchema(
  value: unknown,
): string[] {
  const validate = getArtifactPersistenceSchemaValidator();
  return validate(value) ? [] : formatErrors(validate.errors);
}
