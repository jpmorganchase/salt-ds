import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  parseArgs,
  readJson,
  repositoryRoot,
  stableJson,
} from "../../../scripts/saltAiEvidenceUtils.mjs";

const scriptPath = fileURLToPath(import.meta.url);

function markdown(report) {
  const modeRows = report.modes
    .map(
      (mode) =>
        `| ${mode.mode_id} | ${mode.status} | ${mode.scored ? "yes" : "no"} | ${mode.reason} |`,
    )
    .join("\n");
  return (
    `# Salt AI evaluation: ${report.cohort_id}\n\n` +
    `This is a sanitized deterministic baseline, not a model-quality claim.\n\n` +
    `| Mode | Status | Scored | Reason |\n| --- | --- | --- | --- |\n${modeRows}\n\n` +
    `Catalog-v2: ${report.catalog_baseline.record_count} records, ${report.catalog_baseline.artifact_bytes} artifact bytes, deterministic=${report.catalog_baseline.deterministic}.\n\n` +
    `Limitations:\n${report.limitations.map((item) => `- ${item}`).join("\n")}\n`
  );
}

export async function buildReport(
  cohortId,
  outputDirectory = path.join(repositoryRoot, "dist", "salt-ai-evals"),
) {
  assert(/^[a-z0-9][a-z0-9-]*$/u.test(cohortId), "Invalid cohort ID");
  const report = await readJson(
    path.join(
      repositoryRoot,
      "evals",
      "salt-ai",
      "baselines",
      `${cohortId}.json`,
    ),
  );
  const schema = await readJson(
    path.join(repositoryRoot, "evals", "salt-ai", "report.schema.json"),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  assert(
    validate(report),
    `Report schema failure: ${ajv.errorsText(validate.errors, { separator: "; " })}`,
  );
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outputDirectory, `${cohortId}.json`),
      stableJson(report),
      "utf8",
    ),
    writeFile(
      path.join(outputDirectory, `${cohortId}.md`),
      markdown(report),
      "utf8",
    ),
  ]);
  return report;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(scriptPath)
) {
  const args = parseArgs(process.argv.slice(2));
  const cohort = String(args.get("--cohort") ?? "");
  const report = await buildReport(cohort);
  console.log(`Built sanitized Salt AI report for ${report.cohort_id}.`);
}
