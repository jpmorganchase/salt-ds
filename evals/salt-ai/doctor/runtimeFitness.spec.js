import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createIsolatedPackageManagerEnvironment } from "../../../scripts/consumer-smoke/fixture.mjs";

import {
  decideFromReceipts,
  EvidenceError,
  needsBoundaryRerun,
  percentile90,
  productionGraphFromLock,
  runCli,
} from "./runtimeFitness.mjs";

const sourceSha = execFileSync(
  "git",
  ["rev-parse", "--verify", "HEAD^{commit}"],
  { encoding: "utf8" },
).trim();
const workflowDigest = createHash("sha256")
  .update(
    execFileSync("git", ["show", `${sourceSha}:.github/workflows/test.yml`]),
  )
  .digest("hex");
const runnerDigest = createHash("sha256")
  .update(readFileSync("evals/salt-ai/doctor/runtimeFitness.mjs"))
  .digest("hex");
const fixtureDigest = createHash("sha256")
  .update(
    execFileSync("git", [
      "show",
      `${sourceSha}:evals/salt-ai/doctor/fixtures.json`,
    ]),
  )
  .digest("hex");
function readCommittedBlob(_commit, locator) {
  if (locator === "evals/salt-ai/doctor/runtimeFitness.mjs")
    return readFileSync(locator);
  return execFileSync("git", ["show", `${sourceSha}:${locator}`]);
}

function decide(pack, observations) {
  return decideFromReceipts(pack, observations, { readCommittedBlob });
}
const sourceFileBytes = Buffer.byteLength(
  JSON.parse(
    readFileSync("evals/salt-ai/doctor/fixtures.json", "utf8"),
  ).fixtures.find(({ id }) => id === "repair-family-a-workspace").source,
  "utf8",
);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonical(value) {
  return Buffer.from(`${JSON.stringify(value)}\n`, "utf8");
}

function graph() {
  return [
    {
      locator: "node_modules/@babel/parser",
      name: "@babel/parser",
      version: "7.28.4",
      integrity: `sha512-${"A".repeat(86)}==`,
    },
    {
      locator: "node_modules/@salt-ds/cli",
      name: "@salt-ds/cli",
      version: "0.0.0",
      integrity: `sha512-${"B".repeat(86)}==`,
    },
    {
      locator: "node_modules/@salt-ds/knowledge",
      name: "@salt-ds/knowledge",
      version: "0.0.0",
      integrity: `sha512-${"C".repeat(86)}==`,
    },
  ];
}

function packReceipt(unit = "006/00") {
  const productionGraph = graph();
  const external = productionGraph.filter(
    ({ name }) => !["@salt-ds/knowledge", "@salt-ds/cli"].includes(name),
  );
  return {
    contract: "salt-ai-plan-006-pack-validation/1",
    unit,
    source_sha: sourceSha,
    pack_report_sha256: "a".repeat(64),
    knowledge: {
      bundle_version: "0.0.0",
      bundle_digest: `sha256:${"b".repeat(64)}`,
      semantic_digest: `sha256:${"c".repeat(64)}`,
    },
    decision_runner_sha256: runnerDigest,
    fixture_definition_sha256: fixtureDigest,
    consumer: {
      package_json_sha256: "f".repeat(64),
      package_lock_sha256: "1".repeat(64),
      lockfile_version: 3,
      preparation_node_version: "24.10.0",
      preparation_npm_version: "11.6.0",
      production_graph_sha256: sha256(canonical(productionGraph)),
      external_production_graph_sha256: sha256(canonical(external)),
      production_graph: productionGraph,
    },
    packages: [
      {
        name: "@salt-ds/knowledge",
        version: "0.0.0",
        tarball_sha256: "2".repeat(64),
        packed_bytes: 100,
        packed_bytes_limit: 200,
        unpacked_bytes: 300,
        unpacked_bytes_limit: 400,
        entry_count: 10,
        entry_count_limit: 20,
      },
      {
        name: "@salt-ds/cli",
        version: "0.0.0",
        tarball_sha256: "3".repeat(64),
        packed_bytes: 100,
        packed_bytes_limit: 200,
        unpacked_bytes: 300,
        unpacked_bytes_limit: 400,
        entry_count: 10,
        entry_count_limit: 20,
      },
    ],
    threshold_misses: [],
  };
}

function batch({ wall = 1_000, rss = 128 * 1024 * 1024 } = {}) {
  const wallTimes = Array(12).fill(wall);
  const peakRss = Array(12).fill(rss);
  return {
    warmups: 3,
    measured_runs: 12,
    wall_times_ms: wallTimes,
    peak_rss_bytes: peakRss,
    max_wall_ms: wall,
    p90_wall_ms: wall,
    p90_peak_rss_bytes: rss,
  };
}

function workload(id, batches = [batch()]) {
  const counts = {
    zero_worker: [0, 0, 0],
    one_worker: [1, sourceFileBytes, 1],
    default_workers: [25, sourceFileBytes * 25, 2],
    forced_one_worker: [25, sourceFileBytes * 25, 1],
  }[id];
  return {
    id,
    selected_files: counts[0],
    selected_bytes: counts[1],
    expected_worker_count: counts[2],
    functional: {
      schema_valid: true,
      semantic_parity: true,
      offline: true,
      read_only: true,
      worker_execution: true,
      exit_code_exact: true,
      coverage_complete: true,
    },
    batches,
  };
}

function observation(pack, host) {
  const hostRuntime = {
    "linux-node-22": ["22.22.0", "linux"],
    "linux-node-24": ["24.10.0", "linux"],
    "windows-node-24": ["24.10.0", "win32"],
  }[host];
  const workloadIds =
    pack.unit === "006/00"
      ? ["zero_worker", "one_worker", "default_workers", "forced_one_worker"]
      : ["zero_worker", "one_worker", "default_workers"];
  return {
    contract: "salt-ai-plan-006-runtime-observation/1",
    unit: pack.unit,
    host,
    source_sha: pack.source_sha,
    pack_report_sha256: pack.pack_report_sha256,
    packages: structuredClone(pack.packages),
    pack_validation_sha256: sha256(canonical(pack)),
    consumer: {
      package_json_sha256: pack.consumer.package_json_sha256,
      package_lock_sha256: pack.consumer.package_lock_sha256,
      production_graph_sha256: pack.consumer.production_graph_sha256,
    },
    knowledge: structuredClone(pack.knowledge),
    fixture_definition_sha256: pack.fixture_definition_sha256,
    runtime: {
      node_version: hostRuntime[0],
      install_npm_version: "11.6.0",
      platform: hostRuntime[1],
      architecture: "x64",
      module_surface: "installed_binary",
    },
    authority: {
      provider: "github_actions",
      workflow_path: ".github/workflows/test.yml",
      workflow_sha256: workflowDigest,
      run_id: 123,
      run_attempt: 1,
      job_key: `plan-006-${host}`,
      runner_image: hostRuntime[1] === "win32" ? "win22" : "ubuntu24",
      runner_version: "20260901.1",
    },
    workloads: workloadIds.map((id) => workload(id)),
  };
}

function receipts(unit = "006/00") {
  const pack = packReceipt(unit);
  return {
    pack,
    observations: [
      observation(pack, "linux-node-22"),
      observation(pack, "linux-node-24"),
      observation(pack, "windows-node-24"),
    ],
  };
}

function selectWorkload(observationValue, id) {
  return observationValue.workloads.find((entry) => entry.id === id);
}

describe("Plan 006 runtime decision", () => {
  it("uses the exact eleventh sorted sample for p90", () => {
    expect(percentile90([12, 1, 11, 2, 10, 3, 9, 4, 8, 5, 7, 6])).toBe(11);
    expect(() => percentile90([1, 2])).toThrow(EvidenceError);
  });

  it("detects only the frozen five-percent boundary", () => {
    expect(needsBoundaryRerun(batch({ wall: 2_990 }))).toBe(true);
    expect(needsBoundaryRerun(batch({ wall: 2_000 }))).toBe(false);
  });

  it("passes the unchanged baseline without authorizing a worker change", () => {
    const { pack, observations } = receipts();
    expect(decide(pack, observations)).toEqual({
      contract: "salt-ai-plan-006-decision/1",
      unit: "006/00",
      result: "PASS_RUNTIME_BASELINE",
      worker_concurrency_one_eligible: false,
    });
  });

  it("derives one fix and worker eligibility only from an RSS-only default miss", () => {
    const { pack, observations } = receipts();
    for (const value of observations)
      selectWorkload(value, "default_workers").batches = [
        batch({ rss: 300 * 1024 * 1024 }),
      ];
    expect(decide(pack, observations)).toMatchObject({
      result: "FIX_DUPLICATE_RUNTIME_ONCE",
      worker_concurrency_one_eligible: true,
    });

    selectWorkload(observations[0], "default_workers").batches = [
      batch({ wall: 5_500, rss: 300 * 1024 * 1024 }),
    ];
    expect(decide(pack, observations)).toMatchObject({
      result: "FIX_DUPLICATE_RUNTIME_ONCE",
      worker_concurrency_one_eligible: false,
    });
  });

  it("derives inconclusive from one contradictory allowed rerun", () => {
    const { pack, observations } = receipts();
    selectWorkload(observations[0], "one_worker").batches = [
      batch({ wall: 2_990 }),
      batch({ wall: 3_010 }),
    ];
    expect(decide(pack, observations).result).toBe("INCONCLUSIVE_RUNTIME");
  });

  it("gives a stable miss precedence over a separate contradiction", () => {
    const { pack, observations } = receipts();
    selectWorkload(observations[0], "one_worker").batches = [
      batch({ wall: 2_990 }),
      batch({ wall: 3_010 }),
    ];
    selectWorkload(observations[1], "default_workers").batches = [
      batch({ wall: 5_500 }),
    ];
    expect(decide(pack, observations).result).toBe(
      "FIX_DUPLICATE_RUNTIME_ONCE",
    );
  });

  it("uses the same gate to pass or retire Unit 006/02", () => {
    const passing = receipts("006/02");
    expect(decide(passing.pack, passing.observations).result).toBe(
      "PASS_TECHNICAL_FIT",
    );
    selectWorkload(passing.observations[2], "default_workers").batches = [
      batch({ rss: 300 * 1024 * 1024 }),
    ];
    expect(decide(passing.pack, passing.observations).result).toBe(
      "RETIRE_INTERACTIVE_DOCTOR",
    );
  });

  it.each([
    [
      "missing sample",
      (value) => value.workloads[0].batches[0].wall_times_ms.pop(),
    ],
    ["forged p90", (value) => (value.workloads[0].batches[0].p90_wall_ms = 1)],
    ["platform mismatch", (value) => (value.runtime.platform = "win32")],
    ["absolute path", (value) => (value.authority.runner_image = "C:\\runner")],
    [
      "stale tarball",
      (value) => (value.packages[0].tarball_sha256 = "9".repeat(64)),
    ],
    [
      "semantic mismatch",
      (value) => (value.knowledge.semantic_digest = `sha256:${"9".repeat(64)}`),
    ],
    [
      "missing worker count",
      (value) => delete value.workloads[0].expected_worker_count,
    ],
    ["extra key", (value) => (value.unreviewed = true)],
  ])("rejects %s evidence", (_label, mutate) => {
    const { pack, observations } = receipts();
    mutate(observations[0]);
    expect(() => decide(pack, observations)).toThrow(EvidenceError);
  });

  it("rejects missing and unsolicited near-boundary reruns", () => {
    const first = receipts();
    selectWorkload(first.observations[0], "one_worker").batches = [
      batch({ wall: 2_990 }),
    ];
    expect(() => decide(first.pack, first.observations)).toThrow(/rerun rule/u);

    const second = receipts();
    selectWorkload(second.observations[0], "one_worker").batches.push(batch());
    expect(() => decide(second.pack, second.observations)).toThrow(
      /rerun rule/u,
    );
  });

  it("rejects duplicate, missing, or reordered hosts", () => {
    const { pack, observations } = receipts();
    expect(() => decide(pack, observations.slice(0, 2))).toThrow();
    expect(() =>
      decide(pack, [observations[0], observations[0], observations[2]]),
    ).toThrow(/hosts/u);
    expect(() => decide(pack, observations.toReversed())).toThrow(/hosts/u);
  });

  it("derives a canonical production graph and rejects missing integrity", () => {
    const lock = {
      lockfileVersion: 3,
      packages: {
        "": { dependencies: { example: "1.0.0" } },
        "node_modules/example": {
          version: "1.0.0",
          integrity: `sha512-${"D".repeat(86)}==`,
        },
      },
    };
    expect(productionGraphFromLock(lock)).toEqual([
      {
        locator: "node_modules/example",
        name: "example",
        version: "1.0.0",
        integrity: `sha512-${"D".repeat(86)}==`,
      },
    ]);
    delete lock.packages["node_modules/example"].integrity;
    expect(() => productionGraphFromLock(lock)).toThrow(EvidenceError);
  });

  it("returns invocation exit 2 with no decision stdout for invalid modes", async () => {
    let stdout = "";
    let stderr = "";
    const code = await runCli(["--mode", "decide", "--unit", "006/00"], {
      stdout: { write: (value) => (stdout += value) },
      stderr: { write: (value) => (stderr += value) },
    });
    expect(code).toBe(2);
    expect(stdout).toBe("");
    expect(stderr).toMatch(/exactly three/u);
  });

  it("classifies missing decision inputs as invocation errors and malformed JSON as evidence errors", async () => {
    const parent = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-plan-006-spec-"),
    );
    try {
      const malformed = path.join(parent, "malformed.json");
      await fs.writeFile(malformed, "{\n", "utf8");
      const missingCode = await runCli(
        [
          "--mode",
          "decide",
          "--unit",
          "006/00",
          "--pack-validation",
          path.join(parent, "missing.json"),
          "--observation",
          malformed,
          "--observation",
          malformed,
          "--observation",
          malformed,
        ],
        {
          stdout: { write() {} },
          stderr: { write() {} },
        },
      );
      expect(missingCode).toBe(2);
      const malformedCode = await runCli(
        [
          "--mode",
          "decide",
          "--unit",
          "006/00",
          "--pack-validation",
          malformed,
          "--observation",
          malformed,
          "--observation",
          malformed,
          "--observation",
          malformed,
        ],
        {
          stdout: { write() {} },
          stderr: { write() {} },
        },
      );
      expect(malformedCode).toBe(3);
    } finally {
      await fs.rm(parent, { recursive: true, force: true });
    }
  });

  it("keeps npm-only Plan 006 state outside the fixed transport", async () => {
    const parent = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-plan-006-spec-"),
    );
    const consumer = path.join(parent, "transport", "consumer");
    const state = path.join(parent, "npm-state");
    try {
      await fs.mkdir(consumer, { recursive: true });
      const environment = await createIsolatedPackageManagerEnvironment(
        consumer,
        { cacheRoot: state, writeYarnConfig: false },
      );
      expect(environment.NPM_CONFIG_CACHE.startsWith(state)).toBe(true);
      expect(
        await fs
          .access(path.join(consumer, ".salt-consumer-smoke.yarnrc.yml"))
          .then(() => true)
          .catch(() => false),
      ).toBe(false);
      expect(await fs.readdir(consumer)).toEqual([]);
    } finally {
      await fs.rm(parent, { recursive: true, force: true });
    }
  });

  it("keeps every Plan 006 evidence job opt-in and closed to two units", () => {
    const workflow = readFileSync(".github/workflows/test.yml", "utf8");
    expect(workflow).toContain("plan_006_unit:");
    expect(
      workflow.match(/github\.event_name == 'workflow_dispatch'/gu),
    ).toHaveLength(3);
    expect(workflow.match(/inputs\.plan_006_unit == '006\/00'/gu)).toHaveLength(
      3,
    );
    expect(workflow.match(/inputs\.plan_006_unit == '006\/02'/gu)).toHaveLength(
      3,
    );
    expect(workflow).toContain("plan-006-build:");
    expect(workflow).toContain("plan-006-observe:");
    expect(workflow).toContain("plan-006-decide:");
  });
});
