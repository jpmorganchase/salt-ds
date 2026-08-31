import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  readJson,
  sha256,
  stableJson,
} from "../../../scripts/saltAiEvidenceUtils.mjs";
import {
  buildAlternativesDecision,
  buildDevelopmentBaseline,
  buildNeedDecision,
  deriveDecisionResult,
} from "./aggregate.mjs";
import {
  opportunityFiles,
  prepare,
  record,
  validate,
  validateDecision,
  validateSchema,
} from "./workflow.mjs";

async function createRoot() {
  const parent = await mkdtemp(path.join(tmpdir(), "salt-opportunity-"));
  const root = path.join(parent, "evidence");
  await prepare({ phase: "offline", evidenceRoot: root });
  return { parent, root };
}

async function alternativesLedger(root) {
  const domains = ["adjacent.example", "design.example", "salt.example"];
  const definitions = [
    {
      alternative_id: "alt-adjacent",
      alternative_type: "adjacent_ai_tool",
      primary_source_domain: domains[0],
      capture: "adjacent primary source\n",
      capabilities: [
        "answer_design_system_questions",
        "generate_or_modify_ui_code",
      ],
      known_limitations: ["adjacent_not_salt_specific"],
    },
    {
      alternative_id: "alt-design-system",
      alternative_type: "design_system_ai_tool",
      primary_source_domain: domains[1],
      capture: "design-system AI primary source\n",
      capabilities: ["answer_design_system_questions", "inspect_design_assets"],
      known_limitations: ["model_locked"],
    },
    {
      alternative_id: "alt-salt-docs",
      alternative_type: "salt_docs_search",
      primary_source_domain: domains[2],
      capture: "Salt docs and search primary source\n",
      capabilities: ["browse_current_docs", "search_current_docs"],
      known_limitations: ["docs_only"],
    },
  ];
  const captures = path.join(root, "captures");
  await mkdir(captures);
  const sources = [];
  for (const definition of definitions) {
    const captureSha256 = sha256(definition.capture);
    await writeFile(
      path.join(captures, `${captureSha256.slice("sha256:".length)}.capture`),
      definition.capture,
      "utf8",
    );
    sources.push({
      alternative_id: definition.alternative_id,
      alternative_type: definition.alternative_type,
      primary_source_domain: definition.primary_source_domain,
      source_date: "2026-09-01",
      capture_sha256: captureSha256,
      capabilities: definition.capabilities,
      accessible: true,
      current: true,
      relevant: true,
      known_limitations: definition.known_limitations,
    });
  }
  const locator = stableJson({
    contract: "salt-ai-opportunity-external-locator/1",
    schema_version: "1.0.0",
    assets: sources.map((source) => ({
      asset_id: `source-${source.alternative_id}`,
      sha256: source.capture_sha256,
      relative_locator: `captures/${source.capture_sha256.slice(
        "sha256:".length,
      )}.capture`,
    })),
  });
  await writeFile(
    path.join(root, opportunityFiles.externalLocatorFile),
    locator,
    "utf8",
  );
  const authorization = "reviewed alternatives authorization\n";
  await writeFile(
    path.join(root, opportunityFiles.alternativesAuthorizationFile),
    authorization,
    "utf8",
  );
  const ledger = {
    contract: "salt-ai-opportunity-alternatives-input/1",
    schema_version: "1.0.0",
    phase: "alternatives",
    authority: {
      authorization_sha256: sha256(authorization),
      owner_role: "research_owner",
      reviewer_role: "independent_reviewer",
      approved_on: "2026-09-01",
      expires_on: "2026-09-02",
      retention_until: "2026-12-31",
      working_day_limit: 1,
      paid_access_ceiling_minor: 0,
      primary_source_domains: domains,
    },
    external_locator_sha256: sha256(locator),
    research_completed_on: "2026-09-01",
    paid_access_spent_minor: 0,
    sources,
  };
  await writeFile(
    path.join(root, opportunityFiles.alternativesLedgerFile),
    stableJson(ledger),
    "utf8",
  );
  return ledger;
}

function readyAlternatives(ledger) {
  return buildAlternativesDecision(ledger);
}

function needInput(alternatives, participants, overrides = {}) {
  const authorization = "reviewed need authorization\n";
  const protocol = "reviewed interview protocol\n";
  const consent = "reviewed consent language\n";
  return {
    contract: "salt-ai-opportunity-need-input/1",
    schema_version: "1.0.0",
    phase: "need",
    authority: {
      authorization_sha256: sha256(authorization),
      approved_on: "2026-09-03",
      expires_on: "2026-09-17",
      retention_until: "2026-12-31",
      recruitment_channel: "approved_internal",
      protocol_sha256: sha256(protocol),
      consent_sha256: sha256(consent),
      compensation_minor: 0,
      max_outreach_attempts: 20,
      max_business_days: 10,
      minimum_consumers: 5,
      minimum_teams: 2,
    },
    alternatives_receipt_sha256: sha256(stableJson(alternatives)),
    interviews_completed_on: "2026-09-10",
    outreach_attempt_count: participants.length,
    business_day_count: 5,
    boundary_exhausted: false,
    participants,
    ...overrides,
  };
}

function participant(
  number,
  team,
  {
    valid = true,
    recurring = true,
    categories = ["retrieval"],
    workflow = "alt-salt-docs",
  } = {},
) {
  return {
    participant_id: `participant-${String(number).padStart(2, "0")}`,
    team_id: `team-${String(team).padStart(2, "0")}`,
    valid,
    recurring_problem: recurring,
    problem_categories: recurring ? categories : [],
    current_workflow_alternative_id: workflow,
    evidence_sha256: sha256(`interview-${number}\n`),
  };
}

async function writeNeedEvidence(root, alternatives, participants) {
  await writeFile(
    path.join(root, opportunityFiles.alternativesDecisionFile),
    stableJson(alternatives),
    "utf8",
  );
  const fixedEvidence = [
    [opportunityFiles.needAuthorizationFile, "reviewed need authorization\n"],
    [opportunityFiles.needProtocolFile, "reviewed interview protocol\n"],
    [opportunityFiles.needConsentFile, "reviewed consent language\n"],
  ];
  for (const [name, bytes] of fixedEvidence)
    await writeFile(path.join(root, name), bytes, "utf8");
  const interviews = path.join(root, "interviews");
  await mkdir(interviews);
  for (const entry of participants) {
    const number = Number(entry.participant_id.split("-").at(-1));
    const bytes = `interview-${number}\n`;
    expect(sha256(bytes)).toBe(entry.evidence_sha256);
    await writeFile(
      path.join(
        interviews,
        `${entry.evidence_sha256.slice("sha256:".length)}.capture`,
      ),
      bytes,
      "utf8",
    );
  }
  const ledger = needInput(alternatives, participants);
  await writeFile(
    path.join(root, opportunityFiles.needLedgerFile),
    stableJson(ledger),
    "utf8",
  );
  return ledger;
}

describe("Salt AI opportunity workflow", () => {
  it("prepares a fresh guarded offline root with no external authority", async () => {
    const parent = await mkdtemp(path.join(tmpdir(), "salt-opportunity-"));
    const root = path.join(parent, "evidence");
    try {
      await prepare({ phase: "offline", evidenceRoot: root });
      await validate({ phase: "offline", evidenceRoot: root });
      const offline = JSON.parse(
        await readFile(path.join(root, opportunityFiles.offlineFile), "utf8"),
      );
      expect(offline).toMatchObject({
        participant_contact_authorized: false,
        network_authorized: false,
        model_calls_authorized: false,
        tracked_data: "sanitized_receipts_only",
      });
      await expect(
        prepare({ phase: "offline", evidenceRoot: root }),
      ).rejects.toThrow(/fresh evidence root/u);
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("rejects evidence roots inside the repository", async () => {
    await expect(
      prepare({
        phase: "offline",
        evidenceRoot: path.resolve(
          "evals/salt-ai/opportunity/in-repository-evidence",
        ),
      }),
    ).rejects.toThrow(/outside the repository/u);
  });

  it("validates content-addressed current alternatives and derives a baseline", async () => {
    const { parent, root } = await createRoot();
    try {
      const ledger = await alternativesLedger(root);
      await prepare({ phase: "alternatives", evidenceRoot: root });
      await validate({ phase: "alternatives", evidenceRoot: root });
      const decision = readyAlternatives(ledger);
      expect(decision.result).toBe("READY_FOR_NEED_RESEARCH");
      expect(decision.shortlist).toHaveLength(3);
      expect(JSON.stringify(decision)).not.toMatch(
        /organization|repository|interview|https?:\/\//u,
      );
      await validateSchema(
        decision,
        "opportunity-decision.schema.json",
        "Alternatives decision",
      );
      const baseline = buildDevelopmentBaseline(
        ledger,
        sha256(stableJson(decision)),
      );
      expect(baseline.assets.map((asset) => asset.order)).toEqual([1, 2, 3]);
      await validateSchema(
        baseline,
        "development-baseline.schema.json",
        "Development baseline",
      );
      await expect(
        record({
          phase: "alternatives",
          evidenceRoot: root,
          output: "arbitrary.json",
          baselineOutput: "arbitrary-baseline.json",
        }),
      ).rejects.toThrow(/registered Plan 004 receipt/u);
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("fails closed on a missing or corrupt primary-source capture", async () => {
    const { parent, root } = await createRoot();
    try {
      const ledger = await alternativesLedger(root);
      const capture = ledger.sources[0].capture_sha256.slice("sha256:".length);
      await writeFile(
        path.join(root, "captures", `${capture}.capture`),
        "tampered",
        "utf8",
      );
      await expect(
        validate({ phase: "alternatives", evidenceRoot: root }),
      ).rejects.toThrow(/capture digest mismatch/u);
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("derives PASS_NEED and current-workflow counts without identities", async () => {
    const { parent, root } = await createRoot();
    try {
      const alternatives = readyAlternatives(await alternativesLedger(root));
      const participants = [
        participant(1, 1),
        participant(2, 2),
        participant(3, 1, { workflow: "alt-design-system" }),
        participant(4, 2, { workflow: "other" }),
        participant(5, 2, { recurring: false }),
      ];
      const decision = buildNeedDecision(
        needInput(alternatives, participants),
        alternatives,
      );
      expect(decision.result).toBe("PASS_NEED");
      expect(decision.valid_cohort_count).toBe(5);
      expect(decision.recurring_problem_count).toBe(4);
      expect(
        decision.shortlist.find(
          (entry) => entry.alternative_id === "alt-salt-docs",
        ).current_workflow_use_count,
      ).toBe(3);
      expect(decision.other_current_workflow_use_count).toBe(1);
      expect(JSON.stringify(decision)).not.toMatch(/participant-\d|team-\d/u);
      await validateSchema(
        decision,
        "opportunity-decision.schema.json",
        "Need decision",
      );
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("validates need authority, protocol, consent, and interview readback", async () => {
    const { parent, root } = await createRoot();
    try {
      const alternatives = readyAlternatives(await alternativesLedger(root));
      const participants = [
        participant(1, 1),
        participant(2, 2),
        participant(3, 1),
        participant(4, 2),
        participant(5, 2, { recurring: false }),
      ];
      await writeNeedEvidence(root, alternatives, participants);
      await validate({ phase: "need", evidenceRoot: root });
      const first = participants[0].evidence_sha256.slice("sha256:".length);
      await writeFile(
        path.join(root, "interviews", `${first}.capture`),
        "tampered",
        "utf8",
      );
      await expect(
        validate({ phase: "need", evidenceRoot: root }),
      ).rejects.toThrow(/Participant evidence digest mismatch/u);
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("applies need decision precedence at exact boundaries", async () => {
    const { parent, root } = await createRoot();
    try {
      const alternatives = readyAlternatives(await alternativesLedger(root));
      const four = [
        participant(1, 1),
        participant(2, 2),
        participant(3, 1),
        participant(4, 2),
      ];
      expect(
        buildNeedDecision(needInput(alternatives, four), alternatives).result,
      ).toBe("PASS_NEED");

      const belowEighty = [
        ...four.slice(0, 3),
        participant(4, 2, { recurring: false }),
      ];
      expect(
        buildNeedDecision(needInput(alternatives, belowEighty), alternatives)
          .result,
      ).toBe("CUT_NEED");

      expect(
        buildNeedDecision(
          needInput(alternatives, four.slice(0, 3), {
            boundary_exhausted: true,
          }),
          alternatives,
        ).result,
      ).toBe("DEFER_INSUFFICIENT_COHORT");

      const blocked = {
        ...alternatives,
        gates: {
          ...alternatives.gates,
          includes_ai_or_design_system_tool: false,
        },
        result: "DEFER_ALTERNATIVE_SELECTION_BLOCKED",
      };
      expect(buildNeedDecision(needInput(blocked, four), blocked).result).toBe(
        "DEFER_ALTERNATIVE_SELECTION_BLOCKED",
      );
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("rejects caller-supplied decisions, totals, and private fields", async () => {
    const { parent, root } = await createRoot();
    try {
      const ledger = await alternativesLedger(root);
      expect(() =>
        buildAlternativesDecision({
          ...ledger,
          result: "READY_FOR_NEED_RESEARCH",
        }),
      ).toThrow(/Caller-supplied result/u);
      expect(() =>
        buildAlternativesDecision({ ...ledger, totals: { sources: 3 } }),
      ).toThrow(/Caller-supplied totals/u);
      expect(() =>
        buildAlternativesDecision({
          ...ledger,
          sources: [
            { ...ledger.sources[0], summary: "caller narrative" },
            ...ledger.sources.slice(1),
          ],
        }),
      ).toThrow(/Caller-supplied summary/u);

      const hostile = await readJson(
        fileURLToPath(
          new URL("./fixtures/hostile-ledgers.json", import.meta.url),
        ),
      );
      for (const value of Object.values(hostile))
        await expect(
          validateSchema(
            value,
            "opportunity-ledger.schema.json",
            "Hostile ledger",
          ),
        ).rejects.toThrow(/schema failure/u);
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });

  it("rejects a caller-tampered decision result", async () => {
    const { parent, root } = await createRoot();
    try {
      const alternatives = readyAlternatives(await alternativesLedger(root));
      const receipt = path.join(parent, "tampered-decision.json");
      await writeFile(
        receipt,
        stableJson({
          ...alternatives,
          result: "DEFER_ALTERNATIVE_SELECTION_BLOCKED",
        }),
        "utf8",
      );
      await expect(
        validateDecision({ receipt, expectDerived: true }),
      ).rejects.toThrow(/not derived/u);
      await writeFile(
        receipt,
        stableJson({
          ...alternatives,
          gates: Object.fromEntries(
            Object.keys(alternatives.gates).map((key) => [key, false]),
          ),
          result: "DEFER_ALTERNATIVE_SELECTION_BLOCKED",
        }),
        "utf8",
      );
      await expect(
        validateDecision({ receipt, expectDerived: true }),
      ).rejects.toThrow(/gates do not match/u);
      expect(deriveDecisionResult(alternatives)).toBe(
        "READY_FOR_NEED_RESEARCH",
      );
    } finally {
      await rm(parent, { force: true, recursive: true });
    }
  });
});
