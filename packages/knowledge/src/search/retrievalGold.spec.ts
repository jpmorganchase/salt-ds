import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { KnowledgeStore } from "../manifest/knowledgeStore.js";
import { searchSaltRecords } from "./searchSalt.js";

interface GoldQuery {
  id: string;
  query: string;
  category: string;
  gold: string[];
}

interface GoldFixture {
  id: string;
  package_vector: Array<{ name: string; version: string }>;
  gold_queries: GoldQuery[];
}

function readFixture(name: string): GoldFixture {
  return JSON.parse(
    fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        "../../../../evals/salt-ai/retrieval",
        name,
      ),
      "utf8",
    ),
  );
}

function referenceKey(reference: { family: string; id: string }): string {
  return "record:" + reference.family + ":" + reference.id;
}

describe("ratified Knowledge-v1 retrieval gold", () => {
  it("meets recall@5 both micro and category-macro on all 40 queries", () => {
    const store = new KnowledgeStore({
      bundleDir: path.resolve(import.meta.dirname, "../../generated"),
    });
    const fixtures = [
      readFixture("api-migrations.json"),
      readFixture("navigation-overlay.json"),
    ];
    const outcomes: Array<{ query: GoldQuery; hit: boolean }> = [];
    for (const fixture of fixtures) {
      const installed_versions = Object.fromEntries(
        fixture.package_vector.map((entry) => [entry.name, entry.version]),
      );
      for (const query of fixture.gold_queries) {
        const matches = searchSaltRecords(store, {
          query: query.query,
          installed_versions,
          limit: 5,
        }).matches.map((match) => referenceKey(match.reference));
        outcomes.push({
          query,
          hit: query.gold.some((gold) => matches.includes(gold)),
        });
      }
    }
    expect(outcomes).toHaveLength(40);
    const micro =
      outcomes.filter((outcome) => outcome.hit).length / outcomes.length;
    const categories = [...new Set(outcomes.map(({ query }) => query.category))];
    const categoryMacro =
      categories
        .map((category) => {
          const members = outcomes.filter(
            ({ query }) => query.category === category,
          );
          return members.filter((member) => member.hit).length / members.length;
        })
        .reduce((sum, value) => sum + value, 0) / categories.length;
    expect(
      outcomes
        .filter((outcome) => !outcome.hit)
        .map(({ query }) => query.id),
    ).toEqual([]);
    expect(micro).toBeGreaterThanOrEqual(0.95);
    expect(categoryMacro).toBeGreaterThanOrEqual(0.95);
  }, 15_000);
});
