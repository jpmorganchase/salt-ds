import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  MAX_PROJECT_POLICY_STRING_LENGTH,
  parseProjectConventionsPayload,
  parseProjectConventionsStackPayload,
} from "../core/policy/layerDiagnostics.js";

function readJson(relativePath: string) {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

describe("project conventions example contract", () => {
  it.each([
    "../../../../workflow-examples/project-conventions/project-conventions.example.json",
    "../../../../workflow-examples/project-conventions/project-conventions.wrapper-heavy.example.json",
    "../../../../workflow-examples/project-conventions/project-conventions.pattern-heavy.example.json",
    "../../../../workflow-examples/consumer-repo/.salt/team.json",
  ])("validates %s against the schema", (examplePath) => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const schema = readJson("../../schemas/project-conventions.schema.json");
    const validate = ajv.compile(schema);

    expect(
      validate(readJson(examplePath)),
      JSON.stringify(validate.errors, null, 2),
    ).toBe(true);
  });

  it("rejects a custom theme provider without provider_import metadata", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const schema = readJson("../../schemas/project-conventions.schema.json");
    const validate = ajv.compile(schema);

    expect(
      validate({
        contract: "project_conventions_v1",
        theme_defaults: {
          provider: "BrandShellProvider",
          reason: "Repo bootstrap.",
        },
      }),
    ).toBe(false);
    expect(JSON.stringify(validate.errors, null, 2)).toContain(
      "provider_import",
    );
  });

  it("keeps convention string and collection bounds aligned with runtime parsing", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(
      readJson("../../schemas/project-conventions.schema.json"),
    );
    const accepts = (value: unknown) => ({
      schema: validate(value),
      runtime: parseProjectConventionsPayload(value).conventions !== null,
    });
    const payload = (overrides: Record<string, unknown> = {}) => ({
      contract: "project_conventions_v1",
      version: "1.0.0",
      ...overrides,
    });

    expect(
      accepts(
        payload({
          notes: Array.from({ length: 100 }, (_, index) => `note-${index}`),
          project: "😀".repeat(MAX_PROJECT_POLICY_STRING_LENGTH),
        }),
      ),
    ).toEqual({ schema: true, runtime: true });
    expect(
      accepts(
        payload({
          notes: Array.from({ length: 101 }, (_, index) => `note-${index}`),
        }),
      ),
    ).toEqual({ schema: false, runtime: false });
    expect(
      accepts(
        payload({
          project: "😀".repeat(MAX_PROJECT_POLICY_STRING_LENGTH + 1),
        }),
      ),
    ).toEqual({ schema: false, runtime: false });
    expect(
      accepts(
        payload({
          preferred_components: [
            { salt_name: "Button", prefer: "Link", reason: "   " },
          ],
        }),
      ),
    ).toEqual({ schema: false, runtime: false });
  });

  it("validates the consumer stack manifest against the stack schema", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const schema = readJson(
      "../../schemas/project-conventions-stack.schema.json",
    );
    const validate = ajv.compile(schema);
    const example = readJson(
      "../../../../workflow-examples/project-conventions/project-conventions.stack.example.json",
    );

    expect(validate(example), JSON.stringify(validate.errors, null, 2)).toBe(
      true,
    );
  });

  it("keeps the published stack layer limit aligned with runtime parsing", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(
      readJson("../../schemas/project-conventions-stack.schema.json"),
    );
    const payload = (count: number) => ({
      contract: "project_conventions_stack_v1",
      layers: Array.from({ length: count }, (_, index) => ({
        id: `layer-${index}`,
        scope: "team",
        source: { type: "file", path: `.salt/layer-${index}.json` },
      })),
    });

    const maximum = payload(8);
    expect(validate(maximum), JSON.stringify(validate.errors, null, 2)).toBe(
      true,
    );
    expect(parseProjectConventionsStackPayload(maximum).stack).not.toBeNull();

    const oversized = payload(9);
    expect(validate(oversized)).toBe(false);
    expect(parseProjectConventionsStackPayload(oversized)).toMatchObject({
      stack: null,
      reason: expect.stringContaining("between 1 and 8 layers"),
    });
  });

  it("keeps stack source and string validation aligned with runtime parsing", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(
      readJson("../../schemas/project-conventions-stack.schema.json"),
    );
    const accepts = (value: unknown) => ({
      schema: validate(value),
      runtime: parseProjectConventionsStackPayload(value).stack !== null,
    });
    const payload = (layer: Record<string, unknown>) => ({
      contract: "project_conventions_stack_v1",
      layers: [layer],
    });

    expect(
      accepts(
        payload({
          id: "😀".repeat(MAX_PROJECT_POLICY_STRING_LENGTH),
          scope: "team",
          source: { type: "file", path: ".salt/team.json" },
        }),
      ),
    ).toEqual({ schema: true, runtime: true });
    expect(
      accepts(
        payload({
          id: "😀".repeat(MAX_PROJECT_POLICY_STRING_LENGTH + 1),
          scope: "team",
          source: { type: "file", path: ".salt/team.json" },
        }),
      ),
    ).toEqual({ schema: false, runtime: false });
    expect(
      accepts(
        payload({
          id: "team",
          scope: "team",
          description: "   ",
          source: { type: "file", path: ".salt/team.json" },
        }),
      ),
    ).toEqual({ schema: false, runtime: false });
    expect(
      accepts(
        payload({
          id: "package",
          scope: "team",
          source: { type: "package", specifier: "example-policy" },
        }),
      ),
    ).toEqual({ schema: false, runtime: false });
  });
});
