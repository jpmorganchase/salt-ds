import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { beforeAll, describe, expect, it } from "vitest";
import { loadRegistry } from "../registry/loadRegistry.js";

/**
 * Registry coverage audit (gold-standard roadmap task 0.6).
 *
 * Walks the loaded registry and asserts that every public Salt entity
 * (component, pattern, foundation, and the required SaltProviderNext
 * provider) has the canonical evidence the MCP/CLI workflows expect.
 *
 * This spec is intentionally allowed to fail today: its failure output
 * IS the gap list that the follow-up PR (task 0.7) is expected to
 * close. Do not "fix" the gaps here — that's a registry/build change,
 * not a test change.
 */

interface CoverageGap {
  kind: "component" | "pattern" | "foundation" | "provider";
  entity: string;
  reason: string;
}

let registry: SaltRegistry;

beforeAll(async () => {
  registry = await loadRegistry();
}, 60_000);

function collectExampleIndex(): {
  byComponent: Map<string, number>;
  byPattern: Map<string, number>;
  byTargetName: Map<string, number>;
} {
  const byComponent = new Map<string, number>();
  const byPattern = new Map<string, number>();
  const byTargetName = new Map<string, number>();
  for (const example of registry.examples) {
    const key = example.target_name?.trim();
    if (!key) {
      continue;
    }
    const lowered = key.toLowerCase();
    byTargetName.set(lowered, (byTargetName.get(lowered) ?? 0) + 1);
    if (example.target_type === "component") {
      byComponent.set(key, (byComponent.get(key) ?? 0) + 1);
    } else if (example.target_type === "pattern") {
      byPattern.set(key, (byPattern.get(key) ?? 0) + 1);
    }
  }
  return { byComponent, byPattern, byTargetName };
}

function formatGapList(gaps: CoverageGap[]): string {
  if (gaps.length === 0) {
    return "(no gaps)";
  }
  const grouped = new Map<string, CoverageGap[]>();
  for (const gap of gaps) {
    const bucket = grouped.get(gap.kind) ?? [];
    bucket.push(gap);
    grouped.set(gap.kind, bucket);
  }
  const sections: string[] = [];
  for (const [kind, items] of [...grouped.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    sections.push(
      `${kind} (${items.length}):\n${items
        .sort((a, b) => a.entity.localeCompare(b.entity))
        .map((gap) => `  - ${gap.entity} — ${gap.reason}`)
        .join("\n")}`,
    );
  }
  return sections.join("\n");
}

describe("registry coverage audit (roadmap task 0.6)", () => {
  it("loads the generated registry", () => {
    expect(registry).toBeDefined();
    expect(registry.components.length).toBeGreaterThan(0);
    expect(registry.patterns.length).toBeGreaterThan(0);
    expect(registry.examples.length).toBeGreaterThan(0);
    expect(registry.pages.length).toBeGreaterThan(0);
  });

  it("every component in components.json has at least one canonical example", () => {
    const { byComponent } = collectExampleIndex();
    const gaps: CoverageGap[] = [];
    for (const component of registry.components) {
      const embedded = component.examples?.length ?? 0;
      const crossReferenced = byComponent.get(component.name) ?? 0;
      if (embedded === 0 && crossReferenced === 0) {
        gaps.push({
          kind: "component",
          entity: component.name,
          reason:
            "no example found in examples.json with target_type=component matching this name, and no embedded examples on the component record",
        });
      }
    }
    expect(
      gaps,
      `Components missing a canonical example (gap count: ${gaps.length}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
  });

  it("every pattern in patterns.json has at least one canonical example and a populated composition_contract", () => {
    const { byPattern } = collectExampleIndex();
    const gaps: CoverageGap[] = [];
    for (const pattern of registry.patterns) {
      const embedded = pattern.examples?.length ?? 0;
      const crossReferenced = byPattern.get(pattern.name) ?? 0;
      if (embedded === 0 && crossReferenced === 0) {
        gaps.push({
          kind: "pattern",
          entity: pattern.name,
          reason:
            "no example found in examples.json with target_type=pattern matching this name, and no embedded examples on the pattern record",
        });
      }
      // Composition contract: the pattern record should expose a
      // populated composition_contract describing how the pattern is
      // assembled from its constituent components. This is part of the
      // F1/F2 gap surfaced by the consumer trace.
      const compositionContract = (
        pattern as unknown as {
          composition_contract?: unknown;
        }
      ).composition_contract;
      const populated =
        compositionContract !== null &&
        compositionContract !== undefined &&
        ((Array.isArray(compositionContract) &&
          compositionContract.length > 0) ||
          (typeof compositionContract === "object" &&
            Object.keys(compositionContract as Record<string, unknown>).length >
              0));
      if (!populated) {
        gaps.push({
          kind: "pattern",
          entity: pattern.name,
          reason:
            "pattern record has no populated composition_contract (field missing or empty)",
        });
      }
    }
    expect(
      gaps,
      `Patterns missing canonical example and/or composition_contract (gap count: ${gaps.length}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
  });

  it("every foundation entity has at least one canonical example", () => {
    const foundationPages = registry.pages.filter(
      (page) => page.page_kind === "foundation",
    );
    expect(
      foundationPages.length,
      "expected the registry to contain at least one foundation page",
    ).toBeGreaterThan(0);

    const { byTargetName } = collectExampleIndex();
    const gaps: CoverageGap[] = [];
    for (const page of foundationPages) {
      // Derive a few candidate names from the page id/title that an
      // example's target_name might reference. Foundation entities do
      // not yet have a first-class registry record; the slug or title
      // is the best identifier available today.
      const candidates = new Set<string>();
      if (page.title) {
        candidates.add(page.title.toLowerCase());
      }
      const slug = page.id.replace(/^page\.salt-foundations-/u, "");
      if (slug) {
        candidates.add(slug.toLowerCase());
        candidates.add(slug.replace(/-/gu, " ").toLowerCase());
      }
      const matched = [...candidates].some((candidate) =>
        byTargetName.has(candidate),
      );
      if (!matched) {
        gaps.push({
          kind: "foundation",
          entity: page.title || page.id,
          reason: `no example in examples.json references this foundation (tried target_name candidates: ${[
            ...candidates,
          ]
            .map((value) => JSON.stringify(value))
            .join(", ")})`,
        });
      }
    }
    expect(
      gaps,
      `Foundations missing a canonical example (gap count: ${gaps.length}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
  });

  it("SaltProviderNext is present as a first-class registry entity (roadmap F1)", () => {
    const matches = [
      ...registry.components.filter(
        (component) =>
          component.name === "SaltProviderNext" ||
          component.aliases?.includes("SaltProviderNext") ||
          component.source?.export_name === "SaltProviderNext",
      ),
      ...registry.patterns.filter(
        (pattern) =>
          pattern.name === "SaltProviderNext" ||
          pattern.aliases?.includes("SaltProviderNext"),
      ),
    ];
    const { byTargetName } = collectExampleIndex();
    const hasExample = byTargetName.has("saltprovidernext");
    const gaps: CoverageGap[] = [];
    if (matches.length === 0) {
      gaps.push({
        kind: "provider",
        entity: "SaltProviderNext",
        reason:
          "no component or pattern record exists for SaltProviderNext — get_salt_entity cannot resolve it, forcing the model to inspect node_modules (roadmap F1 / M9)",
      });
    }
    if (!hasExample) {
      gaps.push({
        kind: "provider",
        entity: "SaltProviderNext",
        reason:
          "no canonical example in examples.json references SaltProviderNext (no JPM Brand recipe, no brand-prop defaults)",
      });
    }
    expect(
      gaps,
      `SaltProviderNext first-class entity coverage (gap count: ${gaps.length}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
  });
});

