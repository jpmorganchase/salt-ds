import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
} from "../../../scripts/saltAiEvidenceUtils.mjs";
import { validateEvaluation } from "./validate.mjs";

const scriptPath = fileURLToPath(import.meta.url);

export async function runDeterministicValidation(options = {}) {
  const validation = await validateEvaluation(options);
  const fixtureSet = await readJson(
    path.resolve(repositoryRoot, validation.manifest.fixture_file),
  );
  const fixtureIds = fixtureSet.fixtures.map((fixture) => fixture.id).sort();
  const caseIds = [];
  let checkCount = 0;
  for (const relative of [
    ...validation.manifest.case_files,
    ...validation.manifest.activation_case_files,
  ]) {
    const value = await readJson(path.resolve(repositoryRoot, relative));
    caseIds.push(value.id);
    checkCount += value.checks.length;
  }
  const identity = sha256(
    Buffer.from(
      stableJson({
        case_ids: caseIds.sort(),
        fixture_ids: fixtureIds,
        fixture_sha256: validation.fixtureDigest,
        protocol_files: validation.manifest.protocol_files,
      }),
      "utf8",
    ),
  );
  return {
    schema_version: "1.0.0",
    status: "passed",
    identity,
    outcome_cases: validation.outcomeCases,
    activation_cases: validation.activationCases,
    retrieval_gold_queries: validation.goldQueries,
    deterministic_checks: checkCount,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(scriptPath)
) {
  process.stdout.write(stableJson(await runDeterministicValidation()));
}
