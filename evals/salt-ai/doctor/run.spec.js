import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import {
  ACCESS_AUTHORITY_KEYS,
  ACCESS_CONSENT_KEYS,
  ACCESS_COUNT_KEYS,
  ACCESS_EXPIRY_KEYS,
  ACCESS_GRADER_SET_SHA256,
  ACCESS_PROTOCOL_SHA256,
  deriveAccessDecision,
  EMPTY_ASSIGNMENT_SHA256,
  EMPTY_COMPARATOR_MAP_SHA256,
  PRE_CONTACT_AUTHORITY_KEYS,
  validateAccessSummary,
} from "./pilot.mjs";
import {
  collectDoctorObservation,
  deriveDoctorDecision,
  derivePackedDecision,
  deriveRulesDecision,
  PackedHarnessError,
  PackedIntegrityError,
  RulesHarnessError,
  RulesIntegrityError,
  runDoctorObservation,
  runPackedObservation,
} from "./run.mjs";

const RUNNER = fileURLToPath(new URL("./run.mjs", import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [RUNNER, ...args], {
    cwd: path.resolve(import.meta.dirname, "../../.."),
    encoding: "utf8",
  });
}

function passingObservation(overrides = {}) {
  return {
    renderer_safe: true,
    rule_ids_equal: true,
    enabled_rule_count: 5,
    trustworthy_product_miss_count: 0,
    actionable_repair_families: [
      "interaction_semantics",
      "symbol_migration",
      "prop_migration",
    ],
    harness_failures: [],
    ...overrides,
  };
}

describe("Salt AI doctor rule decision runner", () => {
  it("emits the exact PASS_RULES decision for current built Knowledge", () => {
    const result = run("--mode", "decide-rules");
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/00","result":"PASS_RULES"}\n',
    );
  });

  it("rejects every invocation outside the one closed mode", () => {
    const result = run("--mode", "other");
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe(
      "Usage: node ./evals/salt-ai/doctor/run.mjs --mode decide-rules|decide-source OR --mode decide-packed --pack-report <path> --access-summary <path>\n",
    );
  });

  it("derives PASS_RULES only with two distinct clean repair families", () => {
    expect(deriveRulesDecision(passingObservation())).toBe("PASS_RULES");
    expect(
      deriveRulesDecision(
        passingObservation({
          actionable_repair_families: ["symbol_migration"],
        }),
      ),
    ).toBe("CUT_DOCTOR");
  });

  it("cuts a trustworthy product miss", () => {
    expect(
      deriveRulesDecision(
        passingObservation({ trustworthy_product_miss_count: 1 }),
      ),
    ).toBe("CUT_DOCTOR");
  });

  it.each([
    { renderer_safe: false },
    { harness_failures: ["corrupt coverage"] },
  ])("fails closed on harness failure %#", (override) => {
    expect(() => deriveRulesDecision(passingObservation(override))).toThrow(
      RulesHarnessError,
    );
  });

  it("classifies registry identity mismatch as evidence-integrity failure", () => {
    expect(() =>
      deriveRulesDecision(passingObservation({ rule_ids_equal: false })),
    ).toThrow(RulesIntegrityError);
  });
});

const CANDIDATE_SHA256 = `sha256:${"a".repeat(64)}`;
const SEMANTIC_SHA256 = `sha256:${"b".repeat(64)}`;

function passingAccessSummary() {
  return {
    contract: "salt-ai-doctor-consumer-access/1",
    schema_version: "1.0.0",
    candidate_sha256: CANDIDATE_SHA256,
    knowledge_semantic_digest: SEMANTIC_SHA256,
    protocol_sha256: ACCESS_PROTOCOL_SHA256,
    grader_set_sha256: ACCESS_GRADER_SET_SHA256,
    assignment_sha256: `sha256:${"c".repeat(64)}`,
    comparator_map_sha256: `sha256:${"d".repeat(64)}`,
    authority: Object.fromEntries(
      ACCESS_AUTHORITY_KEYS.map((key) => [key, true]),
    ),
    consent: Object.fromEntries(ACCESS_CONSENT_KEYS.map((key) => [key, true])),
    expiry: Object.fromEntries(ACCESS_EXPIRY_KEYS.map((key) => [key, true])),
    counts: {
      outreach_attempts: 5,
      consent_eligible_consumers: 5,
      expected_valid_completions: 4,
      independent_groups: 2,
      repositories: 2,
      matched_pairs: 4,
      repair_family_a_pairs: 1,
      repair_family_b_pairs: 1,
      expected_noop_pairs: 2,
      executable_acceptance_checks: 8,
      candidate_first_pairs: 2,
      comparator_first_pairs: 2,
      frozen_comparator_alternatives: 1,
      frozen_workflow_pairs: 4,
      usable_configuration_pairs: 4,
      fresh_snapshot_tasks: 8,
      approved_install_cleanup_consumers: 5,
    },
  };
}

function zeroContactAccessSummary() {
  const summary = passingAccessSummary();
  summary.assignment_sha256 = EMPTY_ASSIGNMENT_SHA256;
  summary.comparator_map_sha256 = EMPTY_COMPARATOR_MAP_SHA256;
  summary.authority = Object.fromEntries(
    ACCESS_AUTHORITY_KEYS.map((key) => [key, false]),
  );
  summary.consent = Object.fromEntries(
    ACCESS_CONSENT_KEYS.map((key) => [key, false]),
  );
  summary.expiry = Object.fromEntries(
    ACCESS_EXPIRY_KEYS.map((key) => [key, false]),
  );
  summary.counts = Object.fromEntries(ACCESS_COUNT_KEYS.map((key) => [key, 0]));
  return summary;
}

function passingPackedObservation() {
  const wallTimes = Array(12).fill(100);
  const peakRss = Array(12).fill(64 * 1024 * 1024);
  return {
    contract: "salt-ai-doctor-packed-observation/1",
    candidate_sha256: CANDIDATE_SHA256,
    knowledge_semantic_digest: SEMANTIC_SHA256,
    pack_report_sha256: `sha256:${"e".repeat(64)}`,
    integrity: Object.fromEntries(
      [
        "pack_report_valid",
        "tarballs_exact",
        "worker_inventory",
        "worker_execution",
        "source_parity",
        "offline",
        "read_only",
        "exact_versions",
        "semantic_digest_match",
        "tracked_files_unchanged",
        "candidate_bytes_unchanged",
        "cjs_missing_worker_rejected",
        "esm_missing_worker_rejected",
      ].map((key) => [key, true]),
    ),
    package_metrics: [
      {
        name: "@salt-ds/cli",
        inventory: ["dist-cjs/scannerWorker.js", "dist-es/scannerWorker.js"],
        compressed_bytes: 100,
        unpacked_bytes: 200,
        generated_bytes: 0,
        entry_count: 2,
        limits: {
          compressed_bytes: 200,
          unpacked_bytes: 300,
          generated_bytes: 0,
          entry_count: 3,
        },
      },
      {
        name: "@salt-ds/knowledge",
        inventory: [],
        compressed_bytes: 100,
        unpacked_bytes: 200,
        generated_bytes: 0,
        entry_count: 2,
        limits: {
          compressed_bytes: 200,
          unpacked_bytes: 300,
          generated_bytes: 0,
          entry_count: 3,
        },
      },
    ],
    package_threshold_misses: [],
    performance: {
      observation_class: "single_host_operational",
      node: process.versions.node,
      platform: process.platform,
      warmups: 3,
      measured_runs: 12,
      wall_times_ms: wallTimes,
      peak_rss_bytes: peakRss,
      max_wall_ms: 100,
      p90_wall_ms: 100,
      p90_peak_rss_bytes: 64 * 1024 * 1024,
      limits: {
        max_run_ms: 5_000,
        p90_wall_ms: 3_000,
        p90_peak_rss_bytes: 256 * 1024 * 1024,
      },
      threshold_passed: true,
    },
    access_summary_read: true,
    access_summary: passingAccessSummary(),
  };
}

function captureIo() {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      stdout: { write: (value) => (stdout += value) },
      stderr: { write: (value) => (stderr += value) },
    },
    stdout: () => stdout,
    stderr: () => stderr,
  };
}

describe("Salt AI Doctor source decision runner", () => {
  let passing;

  beforeAll(async () => {
    passing = await collectDoctorObservation();
  }, 30_000);

  it("derives PASS_DOCTOR from exactly six trustworthy physical fixtures", () => {
    expect(deriveDoctorDecision(passing)).toBe("PASS_DOCTOR");
    expect(passing).toMatchObject({
      contract: "salt-ai-doctor-source-observation/1",
      physical_fixture_count: 6,
      worker_artifact_present: true,
    });
    expect(passing.fixtures.map((fixture) => fixture.id)).toEqual([
      "repair-family-a-workspace",
      "repair-family-b",
      "clean-exact-current-hostile-text",
      "non-salt-control",
      "exact-version-mismatch",
      "incomplete-analysis",
    ]);
    expect(
      passing.fixtures.find(
        (fixture) => fixture.id === "repair-family-a-workspace",
      ),
    ).toMatchObject({
      invocation_root: ".",
      exit_code: 1,
      read_only: true,
      worker_backed: true,
      result: {
        status: "complete",
        reason_code: "SALT_PROJECT_SELECTED",
        findings: [
          {
            workspace_unit_id: "packages/app",
            rule_id: "salt.component.action_navigation_target",
            location: { path: "packages/app/src/App.tsx" },
          },
        ],
      },
      repair: {
        changed: true,
        source_matches_manifest: true,
        read_only: true,
        after_exit_code: 0,
        after_result: { status: "complete", findings: [] },
      },
    });
  });

  it("emits the exact PASS_DOCTOR decision line", () => {
    const capture = captureIo();
    expect(runDoctorObservation(passing, capture.io)).toBe(0);
    expect(capture.stderr()).toBe("");
    expect(capture.stdout()).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/01","result":"PASS_DOCTOR"}\n',
    );
  });

  const mutations = [
    [
      "command evaluation skipped",
      (value) => {
        value.fixtures[0].command_executed = false;
      },
    ],
    [
      "worker evaluation skipped",
      (value) => {
        value.fixtures[0].worker_backed = false;
      },
    ],
    [
      "zero coverage",
      (value) => {
        value.fixtures[0].result.coverage.evaluated_files = 0;
        value.fixtures[0].result.coverage.evaluated_rule_ids = [];
      },
    ],
    [
      "missing finding",
      (value) => {
        value.fixtures[0].result.findings = [];
      },
    ],
    [
      "extra finding",
      (value) => {
        value.fixtures[0].result.findings.push(
          structuredClone(value.fixtures[0].result.findings[0]),
        );
      },
    ],
    [
      "wrong status",
      (value) => {
        value.fixtures[0].result.status = "not_salt";
      },
    ],
    [
      "wrong reason",
      (value) => {
        value.fixtures[0].result.reason_code = "EXACT_VERSION_REQUIRED";
      },
    ],
    [
      "wrong finding ID",
      (value) => {
        value.fixtures[0].result.findings[0].id = "sha256:" + "0".repeat(64);
      },
    ],
    [
      "wrong finding path",
      (value) => {
        value.fixtures[0].result.findings[0].location.path = "src/wrong.tsx";
      },
    ],
    [
      "wrong exit",
      (value) => {
        value.fixtures[0].exit_code = 0;
      },
    ],
    [
      "workspace child invoked directly",
      (value) => {
        value.fixtures[0].invocation_root = "packages/app";
      },
    ],
    [
      "non-Salt root overrides selected child",
      (value) => {
        value.fixtures[0].result.status = "not_salt";
        value.fixtures[0].result.reason_code = "SALT_PROJECT_NO_SALT_PACKAGES";
      },
    ],
    [
      "inverted repair",
      (value) => {
        value.fixtures[0].repair.after_result.findings = structuredClone(
          value.fixtures[0].result.findings,
        );
      },
    ],
    [
      "repair mutation did not apply",
      (value) => {
        value.fixtures[0].repair.source_matches_manifest = false;
      },
    ],
    [
      "repository was modified by Doctor",
      (value) => {
        value.fixtures[2].read_only = false;
      },
    ],
    [
      "worker artifact missing",
      (value) => {
        value.worker_artifact_present = false;
      },
    ],
    [
      "malformed child output",
      (value) => {
        value.fixtures[0].json_valid = false;
      },
    ],
    [
      "public contract mutated",
      (value) => {
        value.fixtures[0].result.contract = "salt-scan-result/1";
      },
    ],
  ];

  it.each(mutations)("returns nonzero when %s", (_name, mutate) => {
    const observation = structuredClone(passing);
    mutate(observation);
    const capture = captureIo();
    expect(runDoctorObservation(observation, capture.io)).not.toBe(0);
    expect(capture.stdout()).toBe("");
    expect(capture.stderr()).toMatch(
      /^salt-ai doctor source harness failure:/u,
    );
  });

  it.each([
    [
      "applicable finding is inaccurate",
      (value) => {
        value.fixtures[0].result.findings = [];
        value.fixtures[0].product_assessment = "finding_inaccurate";
      },
    ],
    [
      "golden repair does not pass",
      (value) => {
        value.fixtures[0].repair.after_result.findings = structuredClone(
          value.fixtures[0].result.findings,
        );
        value.fixtures[0].product_assessment = "repair_failed";
      },
    ],
  ])("returns registered CUT_DOCTOR with exit zero when %s", (_name, cut) => {
    const observation = structuredClone(passing);
    cut(observation);
    const capture = captureIo();
    expect(runDoctorObservation(observation, capture.io)).toBe(0);
    expect(capture.stderr()).toBe("");
    expect(capture.stdout()).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/01","result":"CUT_DOCTOR"}\n',
    );
  });
});

describe("Salt AI Doctor consumer-access decision", () => {
  it("accepts only the closed aggregate and derives the ready threshold", () => {
    const summary = passingAccessSummary();
    expect(Object.keys(summary.counts).sort()).toEqual(
      [...ACCESS_COUNT_KEYS].sort(),
    );
    expect(
      validateAccessSummary(summary, {
        candidate_sha256: CANDIDATE_SHA256,
        knowledge_semantic_digest: SEMANTIC_SHA256,
      }),
    ).toBe(summary);
    expect(deriveAccessDecision(summary)).toBe("READY_CONSUMER_PILOT");
  });

  it("derives the closed zero-contact deferral", () => {
    expect(deriveAccessDecision(zeroContactAccessSummary())).toBe(
      "DEFER_CONSUMER_ACCESS",
    );
  });

  it.each(PRE_CONTACT_AUTHORITY_KEYS)(
    "rejects recorded activity without %s authority",
    (key) => {
      const summary = passingAccessSummary();
      summary.authority[key] = false;
      expect(() => validateAccessSummary(summary)).toThrow(
        /without every pre-contact authority/u,
      );
    },
  );

  it.each([
    ...ACCESS_AUTHORITY_KEYS.filter(
      (key) => !PRE_CONTACT_AUTHORITY_KEYS.includes(key),
    ).map((key) => ["authority", key]),
    ...ACCESS_CONSENT_KEYS.map((key) => ["consent", key]),
    ...ACCESS_EXPIRY_KEYS.map((key) => ["expiry", key]),
  ])("defers when %s.%s is absent", (group, key) => {
    const summary = passingAccessSummary();
    summary[group][key] = false;
    expect(deriveAccessDecision(summary)).toBe("DEFER_CONSUMER_ACCESS");
  });

  it.each([
    ["consent_eligible_consumers", 4],
    ["expected_valid_completions", 3],
    ["matched_pairs", 3],
    ["repair_family_a_pairs", 0],
    ["repair_family_b_pairs", 0],
    ["expected_noop_pairs", 0],
    ["executable_acceptance_checks", 7],
    ["candidate_first_pairs", 1],
    ["comparator_first_pairs", 1],
    ["frozen_comparator_alternatives", 0],
    ["frozen_workflow_pairs", 3],
    ["usable_configuration_pairs", 3],
    ["fresh_snapshot_tasks", 7],
    ["approved_install_cleanup_consumers", 4],
  ])("defers the valid count miss %s=%i", (key, value) => {
    const summary = passingAccessSummary();
    summary.counts[key] = value;
    expect(deriveAccessDecision(summary)).toBe("DEFER_CONSUMER_ACCESS");
  });

  it("requires two independent groups or repositories", () => {
    const summary = passingAccessSummary();
    summary.counts.independent_groups = 1;
    summary.counts.repositories = 1;
    expect(deriveAccessDecision(summary)).toBe("DEFER_CONSUMER_ACCESS");
  });

  it.each([
    ["assignment_sha256", EMPTY_ASSIGNMENT_SHA256],
    ["comparator_map_sha256", EMPTY_COMPARATOR_MAP_SHA256],
  ])("does not treat the empty %s as pilot-ready", (key, value) => {
    const summary = passingAccessSummary();
    summary[key] = value;
    expect(deriveAccessDecision(summary)).toBe("DEFER_CONSUMER_ACCESS");
  });

  it.each([
    ["additional data", (value) => (value.repository_name = "private")],
    ["wrong protocol", (value) => (value.protocol_sha256 = CANDIDATE_SHA256)],
    ["wrong candidate", (value) => (value.candidate_sha256 = SEMANTIC_SHA256)],
    ["invalid count", (value) => (value.counts.matched_pairs = -1)],
    ["too much outreach", (value) => (value.counts.outreach_attempts = 21)],
  ])("rejects %s", (_label, mutate) => {
    const summary = passingAccessSummary();
    mutate(summary);
    expect(() =>
      validateAccessSummary(summary, {
        candidate_sha256: CANDIDATE_SHA256,
        knowledge_semantic_digest: SEMANTIC_SHA256,
      }),
    ).toThrow();
  });
});

describe("Salt AI Doctor packed decision", () => {
  it("derives and emits the exact ready decision", () => {
    const observation = passingPackedObservation();
    expect(derivePackedDecision(observation)).toBe("READY_CONSUMER_PILOT");
    const capture = captureIo();
    expect(runPackedObservation(observation, capture.io)).toBe(0);
    expect(capture.stderr()).toBe("");
    expect(capture.stdout()).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/02","result":"READY_CONSUMER_PILOT"}\n',
    );
  });

  it("derives a valid defer decision", () => {
    const observation = passingPackedObservation();
    observation.access_summary = zeroContactAccessSummary();
    expect(derivePackedDecision(observation)).toBe("DEFER_CONSUMER_ACCESS");
  });

  it("cuts a trustworthy size miss without reading an absent access file", () => {
    const observation = passingPackedObservation();
    observation.package_metrics[0].compressed_bytes = 201;
    observation.package_threshold_misses = [
      {
        package: "@salt-ds/cli",
        metric: "compressed_bytes",
        observed: 201,
        limit: 200,
      },
    ];
    observation.access_summary_read = false;
    observation.access_summary = null;
    expect(derivePackedDecision(observation)).toBe("CUT_DOCTOR");
  });

  it("cuts a trustworthy performance miss without reading access", () => {
    const observation = passingPackedObservation();
    observation.performance.wall_times_ms[11] = 5_001;
    observation.performance.max_wall_ms = 5_001;
    observation.performance.threshold_passed = false;
    observation.access_summary_read = false;
    observation.access_summary = null;
    expect(derivePackedDecision(observation)).toBe("CUT_DOCTOR");
  });

  it("stops when passing technical evidence has no access summary", () => {
    const observation = passingPackedObservation();
    observation.access_summary_read = false;
    observation.access_summary = null;
    expect(() => derivePackedDecision(observation)).toThrow(PackedHarnessError);
    const capture = captureIo();
    expect(runPackedObservation(observation, capture.io)).toBe(4);
  });

  it.each(Object.keys(passingPackedObservation().integrity))(
    "stops when %s integrity fails",
    (key) => {
      const observation = passingPackedObservation();
      observation.integrity[key] = false;
      expect(() => derivePackedDecision(observation)).toThrow(
        PackedIntegrityError,
      );
      const capture = captureIo();
      expect(runPackedObservation(observation, capture.io)).toBe(3);
      expect(capture.stdout()).toBe("");
    },
  );

  it.each([
    ["malformed candidate digest", (value) => (value.candidate_sha256 = "bad")],
    [
      "unexpected integrity field",
      (value) => (value.integrity.untrusted = true),
    ],
    [
      "missing CJS worker inventory",
      (value) => value.package_metrics[0].inventory.shift(),
    ],
    [
      "unrecomputed size evidence",
      (value) => (value.package_metrics[0].compressed_bytes = 201),
    ],
    ["missing size evidence", (value) => delete value.package_threshold_misses],
    [
      "unrecomputed performance p90",
      (value) => (value.performance.p90_wall_ms = 101),
    ],
    [
      "malformed performance sample count",
      (value) => value.performance.wall_times_ms.pop(),
    ],
    ["wrong performance Node", (value) => (value.performance.node = "22.0.0")],
    [
      "wrong performance platform",
      (value) => (value.performance.platform = "other"),
    ],
  ])("stops on %s", (_label, mutate) => {
    const observation = passingPackedObservation();
    mutate(observation);
    expect(() => derivePackedDecision(observation)).toThrow(
      PackedIntegrityError,
    );
  });

  it("rejects access evidence read before a technical cut", () => {
    const observation = passingPackedObservation();
    observation.package_metrics[0].entry_count = 4;
    observation.package_threshold_misses = [
      {
        package: "@salt-ds/cli",
        metric: "entry_count",
        observed: 4,
        limit: 3,
      },
    ];
    expect(() => derivePackedDecision(observation)).toThrow(
      PackedIntegrityError,
    );
  });
});
