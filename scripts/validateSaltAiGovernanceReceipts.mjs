import { readdir } from "node:fs/promises";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  readJson,
  repositoryRoot,
} from "./saltAiEvidenceUtils.mjs";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validators = new Map();

async function validator(schemaName) {
  if (validators.has(schemaName)) return validators.get(schemaName);
  const schema = await readJson(
    path.join(repositoryRoot, "scripts", "schemas", schemaName),
  );
  const validateSchema = ajv.compile(schema);
  validators.set(schemaName, validateSchema);
  return validateSchema;
}

function validate(validateSchema, value, label) {
  assert(
    validateSchema(value),
    `${label} failed schema validation: ${ajv.errorsText(validateSchema.errors, {
      separator: "; ",
    })}`,
  );
}

const baselineDirectory = path.join(
  repositoryRoot,
  "dist",
  "salt-ai-baseline",
);
const receiptChecks = [
  {
    label: "release embargo receipt",
    receipt: "release-embargo-receipt.json",
    schema: "saltAiReleaseEmbargoReceiptV1.schema.json",
  },
  {
    label: "workflow policy receipt",
    receipt: "workflow-policy-receipt.json",
    schema: "saltAiWorkflowPolicyReceiptV1.schema.json",
  },
  {
    label: "package namespace fixture receipt",
    receipt: "package-namespace-fixture-receipt.json",
    schema: "saltAiPackageNamespaceReceiptV1.schema.json",
  },
  {
    label: "hostile package namespace receipt",
    receipt: "package-namespace-hostile-receipt.json",
    schema: "saltAiPackageNamespaceReceiptV1.schema.json",
  },
  {
    label: "ordinary baseline fixture receipt",
    receipt: "ordinary-baseline-fixture-receipt.json",
    schema: "saltOrdinaryBaselineV1.schema.json",
  },
];

for (const check of receiptChecks) {
  const validateSchema = await validator(check.schema);
  validate(
    validateSchema,
    await readJson(path.join(baselineDirectory, check.receipt)),
    check.label,
  );
}

validate(
  await validator("saltSnapshotPackageCompatibilityV1.schema.json"),
  await readJson(
    path.join(
      repositoryRoot,
      "tooling",
      "ai",
      "snapshot-package-compatibility-v1.json",
    ),
  ),
  "snapshot package compatibility policy",
);

const validateIndex = await validator("saltPlanEvidenceIndexV1.schema.json");
const fixtureDirectory = path.join(
  repositoryRoot,
  "scripts",
  "fixtures",
  "salt-plan-evidence",
);
const fixtureNames = (await readdir(fixtureDirectory))
  .filter((name) => name.endsWith(".json"))
  .sort();
let validFixtureCount = 0;
for (const name of fixtureNames) {
  const fixture = await readJson(path.join(fixtureDirectory, name));
  if (!fixture.valid) continue;
  validate(validateIndex, fixture.index, `tracker fixture ${name}`);
  validFixtureCount += 1;
}

console.log(
  `Salt AI governance evidence schema-validated (${receiptChecks.length} receipts, 1 compatibility policy, ${validFixtureCount} valid tracker fixtures; ${fixtureNames.length - validFixtureCount} hostile tracker fixtures exercised separately).`,
);
