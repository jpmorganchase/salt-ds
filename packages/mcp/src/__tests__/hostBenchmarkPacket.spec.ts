import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

type HostBenchmarkScenario = {
  id: string;
  name: string;
  prompt: string;
  expected: string[];
  failure_classifications: string[];
};

type HostBenchmarkScenarioList = {
  schema: string;
  required_compact_fields: string[];
  failure_classifications: string[];
  scenarios: HostBenchmarkScenario[];
};

const testDir = path.dirname(fileURLToPath(import.meta.url));

function readText(relativePath: string) {
  return readFileSync(path.join(testDir, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

describe("AI tooling host benchmark packet", () => {
  it("keeps the packet aligned with the machine-readable scenario list", () => {
    const packet = readText("../../docs/ai-tooling-host-benchmark-packet.md");
    const benchmark = readJson<HostBenchmarkScenarioList>(
      "../../docs/ai-tooling-host-benchmark-scenarios.json",
    );

    expect(benchmark.schema).toBe(
      "salt_ai_tooling_host_benchmark_scenarios_v1",
    );
    expect(benchmark.scenarios.map((scenario) => scenario.id)).toEqual([
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
      "S7",
      "S8",
      "S9",
    ]);

    for (const scenario of benchmark.scenarios) {
      expect(scenario.name).toBeTruthy();
      expect(scenario.prompt).toBeTruthy();
      expect(scenario.expected.length).toBeGreaterThan(0);
      expect(scenario.failure_classifications.length).toBeGreaterThan(0);
      expect(packet).toContain(`### ${scenario.id}. ${scenario.name}`);
    }

    expect(benchmark.required_compact_fields).toEqual(
      expect.arrayContaining([
        "workflow",
        "status",
        "request.resolved_entity",
        "request.match_status",
        "action.kind",
        "evidence.status",
        "summary",
      ]),
    );
    expect(benchmark.failure_classifications).toEqual(
      expect.arrayContaining([
        "host_instruction",
        "mcp_transport",
        "workflow_contract",
        "evidence_gap",
        "agent_behavior",
        "repo_policy",
        "visual_evidence",
        "runtime_validation",
        "cli_fallback",
      ]),
    );
  });

  it("keeps the packet reusable rather than tied to checked-in local run output", () => {
    const packet = readText("../../docs/ai-tooling-host-benchmark-packet.md");
    const docsReadme = readText("../../docs/README.md");
    const checklist = readText("../../docs/host-validation-checklist.md");

    for (const text of [packet, docsReadme, checklist]) {
      expect(text).not.toContain("codex-local");
      expect(text).not.toContain("completed.json");
      expect(text).not.toContain("storybook-metric.browser");
      expect(text).not.toContain("run-alpha-matrix");
      expect(text).not.toContain("competitive");
    }
    expect(packet).toContain("## Generic Result Template");
  });

  it("keeps the host result schema aligned with scenarios and classifications", () => {
    const benchmark = readJson<HostBenchmarkScenarioList>(
      "../../docs/ai-tooling-host-benchmark-scenarios.json",
    );
    const schema = readJson<Record<string, any>>(
      "../../docs/host-results/salt-ai-tooling-host-result.schema.json",
    );

    expect(schema.properties?.schema?.const).toBe(
      "salt_ai_tooling_host_result_v1",
    );
    expect(schema.$defs?.scenarioResult?.properties?.scenario?.enum).toEqual(
      benchmark.scenarios.map((scenario) => scenario.id),
    );
    expect(
      schema.$defs?.failureClassification?.enum,
    ).toEqual(benchmark.failure_classifications);
    for (const scenario of benchmark.scenarios) {
      expect(schema.$defs).toHaveProperty(`contains${scenario.id}`);
    }
  });

  it("validates a minimal result artifact for future host handoff", () => {
    const benchmark = readJson<HostBenchmarkScenarioList>(
      "../../docs/ai-tooling-host-benchmark-scenarios.json",
    );
    const schema = readJson<Record<string, unknown>>(
      "../../docs/host-results/salt-ai-tooling-host-result.schema.json",
    );
    const ajv = new Ajv2020({ strict: false });
    const validate = ajv.compile(schema);
    const result = {
      schema: "salt_ai_tooling_host_result_v1",
      host: "primary-code-assistant",
      runner: "manual beta run",
      date: "2026-05-23",
      repo: "consumer-app",
      transport: "manual",
      salt_cli_version: "0.0.0-test",
      setup_smoke_check_result: "not_run",
      mcp_status: "not_run",
      cli_fallback_status: "not_run",
      setup: {
        notes: "placeholder result for schema validation",
      },
      results: benchmark.scenarios.map((scenario) => ({
        scenario: scenario.id,
        name: scenario.name,
        transport: "manual",
        outcome: "not_run",
        compact_fields_captured: ["status"],
        observed: {},
        failure_classification: [],
        notes: ["Result not recorded yet."],
      })),
      not_run: ["primary-code-assistant"],
      overall: {
        status: "partial",
        summary: "Placeholder artifact validates the schema shape only.",
      },
    };

    expect(validate(result)).toBe(true);
    expect(validate.errors).toBeNull();
  });
});
