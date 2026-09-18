import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  repositoryRoot,
  repositoryTextBytes,
  repositoryTextSha256,
  sha256,
} from "./saltAiEvidenceUtils.mjs";

const tracker = "plans/README.md";
const scratchParent = path.join(repositoryRoot, "dist");
await mkdir(scratchParent, { recursive: true });
const scratch = await mkdtemp(
  path.join(scratchParent, "salt-ai-evidence-acquisition-test-"),
);

function relative(file) {
  return path.relative(repositoryRoot, file).replaceAll("\\", "/");
}

function acquire({ kind, output, trackerPath = tracker, unit }) {
  const result = spawnSync(
    process.execPath,
    [
      path.join(repositoryRoot, "scripts", "acquireSaltAiEvidence.mjs"),
      "--plan",
      "001",
      "--unit",
      unit,
      "--kind",
      kind,
      "--tracker",
      trackerPath,
      "--output",
      output,
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      windowsHide: true,
    },
  );
  if (result.error) {
    throw new Error(
      `Acquisition could not start for 001/${unit}/${kind}: ${result.error.message}`,
      { cause: result.error },
    );
  }
  assert.equal(
    result.status,
    0,
    `Acquisition failed for 001/${unit}/${kind}:\n${result.stderr ?? ""}${result.stdout ?? ""}`,
  );
}

try {
  const indexDirectory = path.join(repositoryRoot, "plans", "evidence", "001");
  const indexNames = (await readdir(indexDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort();
  let acquiredCount = 0;

  for (const name of indexNames) {
    const index = JSON.parse(
      await readFile(path.join(indexDirectory, name), "utf8"),
    );
    const entries = index.entries
      .filter((entry) => entry.state === "active")
      .sort((left, right) => left.kind.localeCompare(right.kind));
    for (const entry of entries) {
      assert.match(entry.locator, /^repo:\/\//u, "Plan 001 evidence must stay local");
      const output = relative(
        path.join(scratch, `${index.unit_id}-${entry.kind}.json`),
      );
      acquire({ kind: entry.kind, output, unit: index.unit_id });
      assert.equal(
        sha256(await readFile(path.join(repositoryRoot, output))),
        entry.sha256,
        `Acquired bytes differ for 001/${index.unit_id}/${entry.kind}`,
      );
      acquiredCount += 1;
    }
  }

  const unit07 = JSON.parse(
    await readFile(path.join(indexDirectory, "07.json"), "utf8"),
  );
  const earlierCompletionEntry = unit07.entries.find(
    (entry) =>
      entry.kind === "mcp-candidate-disposition-receipt" &&
      entry.state === "active",
  );
  assert(earlierCompletionEntry, "Unit 07 MCP decision evidence is missing");
  assert.notEqual(
    earlierCompletionEntry.completion_sha,
    unit07.completion_sha,
    "Fixture must retain an earlier evidence completion",
  );

  const sourceArtifact = path.join(
    repositoryRoot,
    ...earlierCompletionEntry.locator.slice("repo://".length).split("/"),
  );
  const canonicalArtifact = repositoryTextBytes(await readFile(sourceArtifact));
  const crlfArtifact = Buffer.from(
    canonicalArtifact.toString("utf8").replaceAll("\n", "\r\n"),
  );
  assert.equal(
    repositoryTextSha256(crlfArtifact),
    earlierCompletionEntry.sha256,
    "CRLF evidence artifacts must retain their canonical repository digest",
  );

  const canonicalIndex = `${JSON.stringify(unit07, null, 2)}\n`;
  const crlfIndex = canonicalIndex.replaceAll("\n", "\r\n");
  assert.equal(
    repositoryTextSha256(crlfIndex),
    repositoryTextSha256(canonicalIndex),
    "CRLF evidence indexes must retain their canonical repository digest",
  );

  console.log(
    `Salt AI evidence acquisition validated (${acquiredCount} active entries plus CRLF parity and earlier-completion coverage).`,
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}