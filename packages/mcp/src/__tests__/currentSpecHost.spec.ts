import { loadKnowledgeRuntimeContext, searchSaltRecords } from "@salt-ds/knowledge";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { connectCurrentSpecClient } from "./mcpTestClient.js";

const closeCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.allSettled(closeCallbacks.splice(0).map((close) => close()));
});

describe("current-spec SDK host integration", () => {
  it("negotiates 2026-07-28 and exposes exactly three closed-world tools", async () => {
    const connected = await connectCurrentSpecClient();
    closeCallbacks.push(connected.close);

    expect(connected.client.getDiscoverResult()?.supportedVersions).toContain(
      "2026-07-28",
    );
    const { tools } = await connected.client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual([
      "search_salt",
      "inspect_salt_project",
      "review_salt_code",
    ]);
    for (const tool of tools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
      expect(tool.inputSchema).toMatchObject({
        type: "object",
        additionalProperties: false,
      });
      expect(tool.outputSchema).toMatchObject({
        type: "object",
        additionalProperties: false,
      });
    }
  });

  it("calls search and review with schema-valid structured plus text results", async () => {
    const connected = await connectCurrentSpecClient();
    closeCallbacks.push(connected.close);
    await connected.client.listTools();

    const search = await connected.client.callTool({
      name: "search_salt",
      arguments: { query: "button navigation", limit: 3 },
    });
    expect(search.isError).not.toBe(true);
    expect(search.structuredContent).toMatchObject({
      contract: "salt-mcp-search-result/1",
    });
    expect(search.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "text" })]),
    );

    const knowledge = await loadKnowledgeRuntimeContext({
      bundleDir: path.resolve("packages/knowledge/generated"),
    });
    const neutral = searchSaltRecords(knowledge.store, {
      query: "button navigation",
      limit: 3,
    });
    expect(
      (search.structuredContent as any).matches.map((match: any) => match.id),
    ).toEqual(neutral.matches.map((match) => match.reference.id));

    const review = await connected.client.callTool({
      name: "review_salt_code",
      arguments: {
        artifacts: [
          {
            id: "Button.tsx",
            language: "tsx",
            text: 'import { Button } from "@salt-ds/core"; export const X = () => <Button href="/next">Next</Button>;',
          },
        ],
        package_versions: [{ name: "@salt-ds/core", version: "1.70.0" }],
      },
    });
    expect(review.isError).not.toBe(true);
    expect(review.structuredContent).toMatchObject({
      contract: "salt-mcp-code-review/1",
      coverage: { submitted_artifacts: 1 },
    });
    expect(Buffer.byteLength(JSON.stringify(review), "utf8")).toBeLessThanOrEqual(
      64 * 1024,
    );
  });

  it("eagerly lists bounded bootstrap resources and exact-read templates", async () => {
    const connected = await connectCurrentSpecClient();
    closeCallbacks.push(connected.close);

    const { resources } = await connected.client.listResources();
    expect(resources).toHaveLength(12);
    expect(resources.every((resource) => resource.uri.includes("/bootstrap/"))).toBe(
      true,
    );
    expect(resources.some((resource) => resource.uri.includes("/records/"))).toBe(
      false,
    );
    const { resourceTemplates } = await connected.client.listResourceTemplates();
    expect(resourceTemplates).toHaveLength(4);
    expect(resourceTemplates.map((template) => template.name)).toEqual([
      "salt-knowledge-record",
      "salt-example",
      "salt-migration",
      "salt-markdown",
    ]);

    const manifestResource = resources.find((resource) =>
      resource.uri.endsWith("/bootstrap/manifest"),
    )!;
    const manifest = await connected.client.readResource({
      uri: manifestResource.uri,
    });
    expect(JSON.parse((manifest.contents[0] as any).text)).toMatchObject({
      schema_version: "1.0.0",
      bundle_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
    });

    await connected.client.listTools();
    const search = await connected.client.callTool({
      name: "search_salt",
      arguments: { query: "Button", limit: 1 },
    });
    const recordUri = (search.structuredContent as any).matches[0].resource_uri;
    const record = await connected.client.readResource({ uri: recordUri });
    expect(JSON.parse((record.contents[0] as any).text)).toMatchObject({
      family: expect.any(String),
      id: expect.any(String),
    });

    const baseUri = manifestResource.uri.replace(/\/bootstrap\/manifest$/u, "");
    const markdown = await connected.client.readResource({
      uri: `${baseUri}/markdown/guides%2Fguide.developing.md`,
    });
    expect((markdown.contents[0] as any).text).toContain("Developing");
  });
});
