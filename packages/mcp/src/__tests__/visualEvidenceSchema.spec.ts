import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

function readJson(relativePath: string) {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

describe("migrate visual evidence schemas", () => {
  it("validates the example adapter request against the request schema", () => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    const schema = readJson(
      "../../../semantic-core/schemas/migrate-visual-evidence-request.schema.json",
    );
    const example = readJson(
      "../../../../workflow-examples/migration-visual-grounding/migrate-visual-evidence.request.example.json",
    );
    const validate = ajv.compile(schema);
    const valid = validate(example);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("validates the example adapter response against the response schema", () => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    const schema = readJson(
      "../../../semantic-core/schemas/migrate-visual-evidence-response.schema.json",
    );
    const example = readJson(
      "../../../../workflow-examples/migration-visual-grounding/migrate-visual-evidence.response.example.json",
    );
    const validate = ajv.compile(schema);
    const valid = validate(example);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("keeps the MCP source outline example small and structured", () => {
    const example = readJson(
      "../../../../workflow-examples/migration-visual-grounding/migrate-source-outline.example.json",
    );

    expect(Object.keys(example).sort()).toEqual([
      "actions",
      "notes",
      "regions",
      "states",
    ]);
    expect(
      [
        Array.isArray(example.regions) ? example.regions.length : 0,
        Array.isArray(example.actions) ? example.actions.length : 0,
        Array.isArray(example.states) ? example.states.length : 0,
        Array.isArray(example.notes) ? example.notes.length : 0,
      ].some((count) => count > 0),
    ).toBe(true);
  });
});
