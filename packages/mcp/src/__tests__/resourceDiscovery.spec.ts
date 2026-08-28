import * as z from "zod/v4";
import { afterEach, describe, expect, it } from "vitest";
import {
  decodeDiscoveryCursor,
  encodeDiscoveryCursor,
  MAX_DISCOVERY_UTF8_BYTES,
  RESOURCE_PAGE_SIZE,
} from "../server/registerResources.js";
import { connectCurrentSpecClient } from "./mcpTestClient.js";

const BUNDLE = `sha256:${"1".repeat(64)}`;
const LIST_RESOURCES_RESULT = z
  .object({
    resources: z.array(z.object({ uri: z.string() }).passthrough()),
    nextCursor: z.string().optional(),
  })
  .passthrough();
const LIST_RESOURCE_TEMPLATES_RESULT = z
  .object({
    resourceTemplates: z.array(
      z.object({ uriTemplate: z.string() }).passthrough(),
    ),
    nextCursor: z.string().optional(),
  })
  .passthrough();
const closeCallbacks: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.allSettled(closeCallbacks.splice(0).map((close) => close()));
});

describe("bounded resource discovery", () => {
  it("uses deterministic stateless bundle-bound cursors", () => {
    expect(
      decodeDiscoveryCursor(undefined, {
        bundleDigest: BUNDLE,
        kind: "resources",
        total: 12,
      }),
    ).toBe(0);
    const cursor = encodeDiscoveryCursor({
      contract: "salt-mcp-discovery-cursor/1",
      bundle_digest: BUNDLE,
      kind: "resources",
      offset: RESOURCE_PAGE_SIZE,
    });
    const expected = {
      bundleDigest: BUNDLE,
      kind: "resources" as const,
      total: 12,
    };
    expect(decodeDiscoveryCursor(cursor, expected)).toBe(8);
    expect(decodeDiscoveryCursor(cursor, expected)).toBe(8);
    expect(() =>
      decodeDiscoveryCursor("", expected),
    ).toThrow(/cursor.*empty/iu);
    expect(() =>
      decodeDiscoveryCursor("not-a-cursor", expected),
    ).toThrow(/cursor.*malformed/iu);
    expect(() =>
      decodeDiscoveryCursor(cursor, {
        ...expected,
        bundleDigest: `sha256:${"2".repeat(64)}`,
      }),
    ).toThrow(/cross-bundle/iu);
    expect(() =>
      decodeDiscoveryCursor(cursor, { ...expected, kind: "resource_templates" }),
    ).toThrow(/stale/iu);
  });

  it("serves exact first and last pages and permits cursor reuse", async () => {
    const connected = await connectCurrentSpecClient();
    closeCallbacks.push(connected.close);
    const first = await connected.client.request(
      { method: "resources/list", params: {} },
      LIST_RESOURCES_RESULT,
    );
    expect(first.resources).toHaveLength(8);
    expect(first.nextCursor).toEqual(expect.any(String));
    expect(Buffer.byteLength(JSON.stringify(first), "utf8")).toBeLessThanOrEqual(
      MAX_DISCOVERY_UTF8_BYTES,
    );

    const last = await connected.client.request(
      { method: "resources/list", params: { cursor: first.nextCursor } },
      LIST_RESOURCES_RESULT,
    );
    expect(last.resources).toHaveLength(4);
    expect(last.nextCursor).toBeUndefined();
    const reused = await connected.client.request(
      { method: "resources/list", params: { cursor: first.nextCursor } },
      LIST_RESOURCES_RESULT,
    );
    expect(reused).toEqual(last);
  });

  it("rejects malformed and cross-bundle cursors without fallback", async () => {
    const connected = await connectCurrentSpecClient();
    closeCallbacks.push(connected.close);
    await expect(
      connected.client.request(
        { method: "resources/list", params: { cursor: "not-a-cursor" } },
        LIST_RESOURCES_RESULT,
      ),
    ).rejects.toThrow(/invalid.*cursor/iu);
    const crossBundle = encodeDiscoveryCursor({
      contract: "salt-mcp-discovery-cursor/1",
      bundle_digest: `sha256:${"0".repeat(64)}`,
      kind: "resources",
      offset: 8,
    });
    await expect(
      connected.client.request(
        { method: "resources/list", params: { cursor: crossBundle } },
        LIST_RESOURCES_RESULT,
      ),
    ).rejects.toThrow(/cross-bundle/iu);
    await expect(
      connected.client.request(
        {
          method: "resources/templates/list",
          params: { cursor: crossBundle },
        },
        LIST_RESOURCE_TEMPLATES_RESULT,
      ),
    ).rejects.toThrow(/cursor/iu);
  });
});
