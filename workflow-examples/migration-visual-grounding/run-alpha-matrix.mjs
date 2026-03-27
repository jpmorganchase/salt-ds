import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  assert,
  closeServer,
  distCliBin,
  pathExists,
  runCommand,
  startServer,
} from "../../scripts/consumer-smoke/shared.mjs";

const fixtureDir = path.dirname(fileURLToPath(import.meta.url));

function toPlatformPath(value) {
  if (process.platform === "win32" && value.startsWith("/")) {
    return value.slice(1);
  }

  return value;
}

function parseArgs(argv) {
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  return {
    output: flags.output
      ? path.resolve(flags.output)
      : path.join(fixtureDir, "legacy-orders.scorecard.generated.json"),
  };
}

async function readFixture(name) {
  return fs.readFile(path.join(fixtureDir, name), "utf8");
}

async function runSaltJson(args) {
  const result = await runCommand(process.execPath, [distCliBin, ...args], {
    acceptableExitCodes: [0],
    label: `node ${path.basename(distCliBin)} ${args.join(" ")}`,
  });

  return {
    ...result,
    payload: JSON.parse(result.stdout),
  };
}

function summarizeVariant(payload) {
  return {
    confidence_level: payload.confidence?.level ?? null,
    visual_evidence_level:
      payload.visualEvidence?.confidenceImpact?.level ?? null,
    translation_count: payload.summary?.translationCount ?? null,
    manual_reviews: payload.summary?.manualReviews ?? null,
    confirmation_required: payload.summary?.confirmationRequired ?? null,
    question_count: payload.migrationScope?.questions?.length ?? 0,
    question_samples: (payload.migrationScope?.questions ?? []).slice(0, 3),
    preserve_check_count:
      payload.postMigrationVerification?.preserveChecks?.length ?? 0,
    confirmation_check_count:
      payload.postMigrationVerification?.confirmationChecks?.length ?? 0,
    observed_signals: [
      ...(payload.visualEvidence?.inputs?.structuredOutline?.provided
        ? ["structured outline used"]
        : []),
      ...(payload.visualEvidence?.inputs?.currentUiCapture?.requested
        ? ["runtime capture used"]
        : []),
      ...(payload.visualEvidence?.confidenceImpact?.level
        ? [
            `visual evidence impact: ${payload.visualEvidence.confidenceImpact.level}`,
          ]
        : []),
    ],
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputPath = toPlatformPath(options.output);
  const outputDir = path.dirname(outputPath);
  const artifactsDir = path.join(
    outputDir,
    `${path.basename(outputPath, ".json")}.artifacts`,
  );
  const query = (await readFixture("legacy-orders.query.txt")).trim();
  const runtimeHtml = await readFixture("legacy-orders.runtime.html");
  const template = JSON.parse(
    await readFixture("legacy-orders.scorecard.template.json"),
  );
  const outlinePath = path.join(
    fixtureDir,
    "legacy-orders.source-outline.json",
  );

  assert(
    await pathExists(distCliBin),
    "Expected built Salt CLI bin. Run `yarn workspace @salt-ds/cli build` first.",
  );

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(artifactsDir, { recursive: true });

  const runtimeServer = await startServer(runtimeHtml);

  try {
    const variants = [
      {
        id: "source_only",
        args: ["migrate", query, "--json"],
      },
      {
        id: "outline_only",
        args: ["migrate", "--source-outline", outlinePath, "--json"],
      },
      {
        id: "runtime_only",
        args: [
          "migrate",
          query,
          "--url",
          runtimeServer.url,
          "--mode",
          "fetched-html",
          "--json",
        ],
      },
      {
        id: "combined",
        args: [
          "migrate",
          query,
          "--source-outline",
          outlinePath,
          "--url",
          runtimeServer.url,
          "--mode",
          "fetched-html",
          "--json",
        ],
      },
    ];

    const scorecard = {
      ...template,
      generated_at: new Date().toISOString(),
      fixture_dir: fixtureDir,
      runner: "run-alpha-matrix.mjs",
      artifacts_dir: artifactsDir,
      variants: { ...template.variants },
    };

    for (const variant of variants) {
      const result = await runSaltJson(variant.args);
      const payloadPath = path.join(artifactsDir, `${variant.id}.payload.json`);
      await fs.writeFile(
        payloadPath,
        `${JSON.stringify(result.payload, null, 2)}\n`,
        "utf8",
      );

      scorecard.variants[variant.id] = {
        ...scorecard.variants[variant.id],
        command: `node ${distCliBin} ${variant.args.join(" ")}`,
        payload_path: payloadPath,
        result_summary: summarizeVariant(result.payload),
      };
    }

    await fs.writeFile(
      outputPath,
      `${JSON.stringify(scorecard, null, 2)}\n`,
      "utf8",
    );

    console.log(`Wrote scorecard to ${outputPath}`);
    console.log(`Wrote payload artifacts to ${artifactsDir}`);
  } finally {
    await closeServer(runtimeServer.server);
  }
}

await main();
