import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { McpServer } from "@modelcontextprotocol/server";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import * as z from "zod/v4";
import { compactStandardOutputSchema } from "../compactStandardSchema.js";
import { SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS } from "../serverMetadata.js";
import { TOOL_DEFINITIONS } from "../toolDefinitions.js";

type JsonSchema = Record<string, unknown>;

function isObjectSchema(schema: JsonSchema): boolean {
  return (
    schema.type === "object" ||
    (Array.isArray(schema.type) && schema.type.includes("object"))
  );
}

function collectObjectShapes(schema: JsonSchema): Map<string, JsonSchema> {
  const definitions = (schema.$defs ?? {}) as Record<string, JsonSchema>;
  const shapes = new Map<string, JsonSchema>();
  const visit = (value: unknown, schemaPath: string): void => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    const record = value as JsonSchema;
    if (typeof record.$ref === "string") {
      const definition = definitions[record.$ref.replace("#/$defs/", "")];
      if (definition) visit(definition, schemaPath);
      return;
    }
    if (isObjectSchema(record)) shapes.set(schemaPath, record);
    const properties = record.properties;
    if (
      properties &&
      typeof properties === "object" &&
      !Array.isArray(properties)
    ) {
      for (const [name, child] of Object.entries(properties)) {
        visit(child, `${schemaPath}.${name}`);
      }
    }
    visit(record.items, `${schemaPath}[]`);
    for (const keyword of ["anyOf", "oneOf", "allOf"] as const) {
      const branches = record[keyword];
      if (!Array.isArray(branches)) continue;
      branches.forEach((branch) => {
        visit(branch, schemaPath);
      });
    }
  };
  visit(schema, "$output");
  return shapes;
}

function assertExactObjectSchemas(value: unknown, schemaPath: string): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      assertExactObjectSchemas(child, `${schemaPath}[${index}]`);
    });
    return;
  }
  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  expect(Object.keys(record), schemaPath).not.toHaveLength(0);
  if (isObjectSchema(record)) {
    const propertyNames = Object.keys(
      (record.properties as Record<string, unknown> | undefined) ?? {},
    );
    expect(record.additionalProperties, schemaPath).toBe(false);
    expect(propertyNames, schemaPath).not.toHaveLength(0);
    const required = record.required;
    if (Array.isArray(required)) {
      expect([...required].sort(), schemaPath).toEqual(propertyNames.sort());
    } else {
      expect(record.minProperties, schemaPath).toBe(propertyNames.length);
    }
  }
  for (const [key, child] of Object.entries(record)) {
    assertExactObjectSchemas(child, `${schemaPath}.${key}`);
  }
}

describe("public tool output schemas", () => {
  it("keeps the exact SDK tools/list payload within the discovery budget", async () => {
    const server = new McpServer(
      { name: "schema-size-probe", version: "0" },
      {
        supportedProtocolVersions: [...SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS],
      },
    );
    for (const definition of TOOL_DEFINITIONS) {
      server.registerTool(
        definition.name,
        {
          description: definition.description,
          inputSchema: definition.inputSchema,
          outputSchema: definition.outputSchema,
          annotations: definition.annotations,
        },
        () => ({ content: [{ type: "text" as const, text: "unused" }] }),
      );
    }
    const client = new Client({ name: "schema-size-probe", version: "0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
    try {
      expect(client.getNegotiatedProtocolVersion()).toBe(
        SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS[0],
      );
      const listed = await client.listTools();
      expect(Buffer.byteLength(JSON.stringify(listed), "utf8")).toBeLessThanOrEqual(
        15_000,
      );
    } finally {
      await client.close();
      await server.close();
    }
  });

  it("preserves exhaustive requiredness for closed and nullable objects", () => {
    const source = z
      .object({
        label: z.string(),
        nested: z.object({ enabled: z.boolean() }).strict().nullable(),
      })
      .strict();
    const schema = compactStandardOutputSchema(source)[
      "~standard"
    ].jsonSchema.output({ target: "draft-2020-12" });
    const validate = new Ajv2020({ strict: true }).compile(schema);

    expect(validate({ label: "example", nested: { enabled: true } })).toBe(
      true,
    );
    expect(validate({ label: "example", nested: null })).toBe(true);
    expect(validate({ nested: { enabled: true } })).toBe(false);
    expect(validate({ label: "example" })).toBe(false);
    expect(validate({ label: "example", nested: {} })).toBe(false);
    expect(
      validate({ label: "example", nested: null, unexpected: true }),
    ).toBe(false);
  });

  it("advertises each strict per-tool structural result contract", () => {
    for (const definition of TOOL_DEFINITIONS) {
      const schema = definition.outputSchema["~standard"].jsonSchema.output({
        target: "draft-2020-12",
      }) as Record<string, unknown>;
      const properties = schema.properties as
        | Record<string, Record<string, unknown>>
        | undefined;

      expect(schema.type, definition.name).toBe("object");
      expect(schema.additionalProperties, definition.name).toBe(false);
      expect(properties?.data, definition.name).toMatchObject({
        type: "object",
      });
      expect(properties?.scope, definition.name).toMatchObject({
        type: "object",
      });
      expect(properties?.coverage, definition.name).toMatchObject({
        type: "object",
      });
      assertExactObjectSchemas(schema, definition.name);

      const rawShapes = collectObjectShapes(
        z.toJSONSchema(definition.outputValidationSchema, {
          target: "draft-2020-12",
          io: "output",
        }) as JsonSchema,
      );
      const compactShapes = collectObjectShapes(schema);
      expect([...compactShapes.keys()].sort(), definition.name).toEqual(
        [...rawShapes.keys()].sort(),
      );
      for (const [schemaPath, rawShape] of rawShapes) {
        const compactShape = compactShapes.get(schemaPath)!;
        expect(
          Object.keys(compactShape.properties as object).sort(),
          `${definition.name}:${schemaPath}`,
        ).toEqual(Object.keys(rawShape.properties as object).sort());
      }
    }
  });
});
