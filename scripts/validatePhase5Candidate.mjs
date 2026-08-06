import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadPhase5Preregistration,
  validatePhase5CandidateBindings,
} from "./phase5EvaluationContract.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

if (process.argv.length !== 2) {
  throw new Error("Phase 5 candidate validation does not accept arguments.");
}

const preregistration = loadPhase5Preregistration(repoRoot);
const validation = await validatePhase5CandidateBindings(preregistration, {
  repoRoot,
});

process.stdout.write(
  `${JSON.stringify(
    {
      contract: "salt_phase5_candidate_validation_v1",
      status: "candidate_bindings_valid",
      ...validation,
    },
    null,
    2,
  )}\n`,
);
