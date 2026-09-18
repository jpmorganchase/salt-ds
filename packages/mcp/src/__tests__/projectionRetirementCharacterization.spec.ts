import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canonicalJson } from "../core/runtime.js";
import { createSaltMcpServer } from "../server/createServer.js";
import {
  copyCatalogV2Artifacts,
  createBuiltCatalogV2Fixture,
  REPO_ROOT,
  rebindCatalogArtifactForTests,
  SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS,
} from "./registryTestUtils.js";

let registryDirectory = "";

beforeAll(async () => {
  registryDirectory = await createBuiltCatalogV2Fixture(
    "salt-projection-retirement-",
  );
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterAll(async () => {
  if (registryDirectory) {
    await fs.rm(registryDirectory, { recursive: true, force: true });
  }
});

function toolPayload(result: unknown): Record<string, unknown> {
  if (!result || typeof result !== "object") {
    throw new Error("Expected MCP tool result.");
  }
  const value = result as {
    structuredContent?: unknown;
    content?: Array<{ type: string; text?: string }>;
  };
  if (value.structuredContent && typeof value.structuredContent === "object") {
    return value.structuredContent as Record<string, unknown>;
  }
  const text = value.content?.find((entry) => entry.type === "text")?.text;
  if (!text) throw new Error("Tool result omitted public content.");
  return JSON.parse(text) as Record<string, unknown>;
}

async function withClient(
  run: (client: Client) => Promise<void>,
): Promise<void> {
  const server = await createSaltMcpServer({
    registryDir: registryDirectory,
    projectAccess: {
      mode: "restricted",
      allowedRoots: [REPO_ROOT],
      defaultRoot: REPO_ROOT,
    },
  });
  const client = new Client({
    name: "projection-retirement",
    version: "1.0.0",
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    await run(client);
  } finally {
    await client.close();
    await server.close();
  }
}

describe("legacy projection retirement characterization", () => {
  it("rejects late-family corruption before server creation", async () => {
    const corrupted = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-projection-corrupt-"),
    );
    try {
      await copyCatalogV2Artifacts(registryDirectory, corrupted);
      await rebindCatalogArtifactForTests(
        corrupted,
        "token_declaration",
        (envelope) => {
          const declaration = envelope.records.find(
            (record): record is unknown[] =>
              Array.isArray(record) && typeof record[0] === "string",
          );
          if (!declaration)
            throw new Error("Fixture has no token declaration.");
          declaration[8] = "token.missing-projection-retirement-target";
        },
        { canonicalizeRecords: true },
      );
      await expect(
        createSaltMcpServer({
          registryDir: corrupted,
          projectAccess: {
            mode: "restricted",
            allowedRoots: [REPO_ROOT],
            defaultRoot: REPO_ROOT,
          },
        }),
      ).rejects.toThrow(
        /unresolved token:token\.missing-projection-retirement-target/iu,
      );
    } finally {
      await fs.rm(corrupted, { recursive: true, force: true });
    }
  }, 30_000);

  it("preserves review provenance bytes", async () => {
    const runs: string[] = [];
    for (let index = 0; index < 2; index += 1) {
      await withClient(async (client) => {
        const [tools, resources, templates, result] = await Promise.all([
          client.listTools(),
          client.listResources(),
          client.listResourceTemplates(),
          client.callTool({
            name: "review_salt_code",
            arguments: {
              artifacts: [
                {
                  id: "navigation.tsx",
                  language: "tsx",
                  text: [
                    'import { Button } from "@salt-ds/core";',
                    'export const Demo = () => <Button href="/next">Next</Button>;',
                  ].join("\n"),
                },
              ],
            },
          }),
        ]);
        expect(tools.tools.map((tool) => tool.name)).toEqual([
          "search_salt",
          "inspect_salt_project",
          "review_salt_code",
        ]);
        expect(resources.resources).toHaveLength(1);
        expect(templates.resourceTemplates).toHaveLength(2);
        const payload = toolPayload(result);
        expect(payload.provenance).toMatchObject({
          catalog_version: expect.any(String),
          semantic_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
        });
        runs.push(canonicalJson(payload));
      });
    }
    expect(runs[1]).toBe(runs[0]);
  }, 30_000);

  it("preserves deprecated import and prop finding bytes", async () => {
    const outputs: string[] = [];
    for (let index = 0; index < 2; index += 1) {
      await withClient(async (client) => {
        const result = await client.callTool({
          name: "review_salt_code",
          arguments: {
            artifacts: [
              {
                id: "deprecated.tsx",
                language: "tsx",
                text: [
                  'import { Button } from "@salt-ds/core";',
                  'import { LineChartIcon } from "@salt-ds/icons";',
                  "export const Demo = () => (",
                  '  <Button variant="primary"><LineChartIcon /></Button>',
                  ");",
                ].join("\n"),
              },
            ],
            package_versions: {
              "@salt-ds/core": "1.36.0",
              "@salt-ds/icons": "1.36.0",
            },
          },
        });
        const payload = toolPayload(result) as {
          data: { results: Array<{ findings: Array<{ rule_id: string }> }> };
        };
        expect(
          payload.data.results.flatMap((entry) =>
            entry.findings.map((finding) => finding.rule_id),
          ),
        ).toEqual(
          expect.arrayContaining([
            "salt.deprecation.used_import",
            "salt.deprecation.static_prop",
          ]),
        );
        outputs.push(canonicalJson(payload));
      });
    }
    expect(outputs[1]).toBe(outputs[0]);
  }, 30_000);
});
