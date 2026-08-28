import { createHash } from "node:crypto";
import {
  type McpServer,
  ProtocolError,
  ProtocolErrorCode,
  ResourceNotFoundError,
} from "@modelcontextprotocol/server";
import {
  KNOWLEDGE_RECORD_FAMILIES,
  parseKnowledgeArtifactPath,
  type KnowledgeRecordFamily,
  type KnowledgeStore,
} from "@salt-ds/knowledge";
import { knowledgeBaseUri } from "./responseAdapters.js";

export const RESOURCE_PAGE_SIZE = 8;
export const MAX_BOOTSTRAP_RESOURCES = 16;
export const MAX_RESOURCE_TEMPLATES = 4;
export const MAX_DISCOVERY_UTF8_BYTES = 16 * 1024;
export const MAX_RESOURCE_UTF8_BYTES = 64 * 1024;

type DiscoveryKind = "resources" | "resource_templates";

interface CursorPayload {
  contract: "salt-mcp-discovery-cursor/1";
  bundle_digest: string;
  kind: DiscoveryKind;
  offset: number;
}

interface BootstrapDefinition {
  slug: string;
  name: string;
  title: string;
  description: string;
  mimeType: "application/json" | "text/markdown";
  artifact: string | null;
}

const BOOTSTRAP_DEFINITIONS: readonly BootstrapDefinition[] = Object.freeze([
  {
    slug: "manifest",
    name: "salt-knowledge-manifest",
    title: "Salt Knowledge manifest",
    description: "Validated Knowledge-v1 identity, compatibility, and artifact-tree root.",
    mimeType: "application/json",
    artifact: null,
  },
  {
    slug: "search-index",
    name: "salt-search-index",
    title: "Salt search index metadata",
    description: "Bounded metadata for the immutable lexical search shard.",
    mimeType: "application/json",
    artifact: "index.json",
  },
  {
    slug: "artifact-tree",
    name: "salt-artifact-tree",
    title: "Salt artifact tree root",
    description: "Digest-bound root of the verified Knowledge artifact tree.",
    mimeType: "application/json",
    artifact: "indexes/artifacts/root.json",
  },
  {
    slug: "guide-choosing-the-right-primitive",
    name: "salt-guide-choosing-the-right-primitive",
    title: "Choosing the right primitive",
    description: "Bootstrap guidance for selecting a Salt primitive or pattern.",
    mimeType: "text/markdown",
    artifact: "markdown/guides/guide.choosing-the-right-primitive.md",
  },
  {
    slug: "guide-composition-pitfalls",
    name: "salt-guide-composition-pitfalls",
    title: "Composition pitfalls",
    description: "Bootstrap guidance for avoiding invalid component composition.",
    mimeType: "text/markdown",
    artifact: "markdown/guides/guide.composition-pitfalls.md",
  },
  {
    slug: "guide-custom-wrappers",
    name: "salt-guide-custom-wrappers",
    title: "Custom wrappers",
    description: "Bootstrap guidance for project wrapper decisions.",
    mimeType: "text/markdown",
    artifact: "markdown/guides/guide.custom-wrappers.md",
  },
  {
    slug: "guide-developing",
    name: "salt-guide-developing",
    title: "Developing with Salt",
    description: "Bootstrap package and provider setup guidance.",
    mimeType: "text/markdown",
    artifact: "markdown/guides/guide.developing.md",
  },
  {
    slug: "guide-themes",
    name: "salt-guide-themes",
    title: "Salt themes",
    description: "Bootstrap theme selection and setup guidance.",
    mimeType: "text/markdown",
    artifact: "markdown/guides/guide.themes.md",
  },
  {
    slug: "migration-index",
    name: "salt-migration-index",
    title: "Salt migration index",
    description: "Bounded index of authored migration records.",
    mimeType: "text/markdown",
    artifact: "markdown/migrations/index.md",
  },
  {
    slug: "skill",
    name: "salt-agent-skill",
    title: "Salt Design System Skill",
    description: "Same-bundle Skill bootstrap instructions.",
    mimeType: "text/markdown",
    artifact: "skills/salt-design-system/SKILL.md",
  },
  {
    slug: "agents-pointer",
    name: "salt-agents-pointer",
    title: "Salt managed AGENTS pointer",
    description: "Same-bundle managed AGENTS.md bootstrap block.",
    mimeType: "text/markdown",
    artifact: "skills/salt-design-system/references/managed-agents-block.md",
  },
  {
    slug: "generation-receipt",
    name: "salt-generation-receipt",
    title: "Salt Knowledge generation receipt",
    description: "Immutable generation identity and input closure receipt.",
    mimeType: "application/json",
    artifact: "support/generation-receipt.json",
  },
]);

if (BOOTSTRAP_DEFINITIONS.length > MAX_BOOTSTRAP_RESOURCES) {
  throw new Error("Salt MCP bootstrap resource inventory exceeds its contract.");
}

function jsonUtf8Bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function assertDiscoveryBudget(value: unknown): void {
  const bytes = jsonUtf8Bytes(value);
  if (bytes > MAX_DISCOVERY_UTF8_BYTES) {
    throw new Error(
      `Salt MCP discovery response is ${bytes} UTF-8 bytes; the limit is ${MAX_DISCOVERY_UTF8_BYTES}.`,
    );
  }
}

function assertResourceText(uri: string, text: string): string {
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > MAX_RESOURCE_UTF8_BYTES) {
    throw new ProtocolError(
      ProtocolErrorCode.InvalidParams,
      `Resource ${uri} is ${bytes} UTF-8 bytes; the limit is ${MAX_RESOURCE_UTF8_BYTES}.`,
      { uri, reason: "resource_budget_exceeded" },
    );
  }
  return text;
}

function cursorSignature(encoded: string): string {
  return createHash("sha256")
    .update(`salt-mcp-discovery-cursor/1\0${encoded}`)
    .digest("hex");
}

export function encodeDiscoveryCursor(payload: CursorPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `smc1.${encoded}.${cursorSignature(encoded)}`;
}

function invalidCursor(reason: string): never {
  throw new ProtocolError(
    ProtocolErrorCode.InvalidParams,
    `Invalid Salt MCP discovery cursor: ${reason}.`,
    { reason: "invalid_cursor" },
  );
}

export function decodeDiscoveryCursor(
  cursor: string | undefined,
  expected: {
    bundleDigest: string;
    kind: DiscoveryKind;
    total: number;
  },
): number {
  if (cursor === undefined) return 0;
  if (cursor.length === 0) invalidCursor("empty");
  const match = /^smc1\.([A-Za-z0-9_-]+)\.([0-9a-f]{64})$/u.exec(cursor);
  if (!match?.[1] || !match[2] || cursorSignature(match[1]) !== match[2]) {
    invalidCursor("malformed");
  }
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
  } catch {
    invalidCursor("malformed payload");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    invalidCursor("malformed payload");
  }
  const value = payload as Record<string, unknown>;
  if (
    Object.keys(value).sort().join(",") !==
      "bundle_digest,contract,kind,offset" ||
    value.contract !== "salt-mcp-discovery-cursor/1" ||
    value.bundle_digest !== expected.bundleDigest ||
    value.kind !== expected.kind ||
    !Number.isSafeInteger(value.offset) ||
    (value.offset as number) <= 0 ||
    (value.offset as number) >= expected.total ||
    (value.offset as number) % RESOURCE_PAGE_SIZE !== 0
  ) {
    invalidCursor("stale, cross-bundle, or out of range");
  }
  return value.offset as number;
}

function templateDefinitions(baseUri: string) {
  return [
    {
      name: "salt-knowledge-record",
      title: "Salt Knowledge record",
      description: "Read one exact Knowledge-v1 record by family and ID.",
      uriTemplate: `${baseUri}/records/{family}/{id}`,
      mimeType: "application/json",
    },
    {
      name: "salt-example",
      title: "Salt example metadata",
      description: "Read one exact same-bundle example entry by ID.",
      uriTemplate: `${baseUri}/examples/{id}`,
      mimeType: "application/json",
    },
    {
      name: "salt-migration",
      title: "Salt migration record",
      description: "Read one exact authored migration index entry by ID.",
      uriTemplate: `${baseUri}/migrations/{id}`,
      mimeType: "application/json",
    },
    {
      name: "salt-markdown",
      title: "Salt normalized Markdown",
      description: "Read one exact artifact-tree-verified Markdown path.",
      uriTemplate: `${baseUri}/markdown/{path}`,
      mimeType: "text/markdown",
    },
  ] as const;
}

function exactDecodedSegment(segment: string): string | null {
  try {
    const decoded = decodeURIComponent(segment);
    return encodeURIComponent(decoded) === segment ? decoded : null;
  } catch {
    return null;
  }
}

function parseExactUri(uri: string, baseUri: string): string[] | null {
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return null;
  }
  if (
    parsed.protocol !== "salt-knowledge:" ||
    parsed.hostname !== "v1" ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.search ||
    parsed.hash ||
    !uri.startsWith(`${baseUri}/`)
  ) {
    return null;
  }
  return parsed.pathname.split("/").filter(Boolean).slice(1);
}

function textFromArtifact(store: KnowledgeStore, artifact: string): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    store.readArtifact(artifact),
  );
}

function staticResourceText(
  store: KnowledgeStore,
  definition: BootstrapDefinition,
): string {
  return definition.artifact === null
    ? JSON.stringify(store.manifest)
    : textFromArtifact(store, definition.artifact);
}

function readTemplatedResource(
  store: KnowledgeStore,
  baseUri: string,
  uri: string,
): { mimeType: string; text: string } | null {
  const segments = parseExactUri(uri, baseUri);
  if (!segments) return null;
  if (segments[0] === "records" && segments.length === 3) {
    const family = exactDecodedSegment(segments[1]!);
    const id = exactDecodedSegment(segments[2]!);
    if (
      !family ||
      !id ||
      !(KNOWLEDGE_RECORD_FAMILIES as readonly string[]).includes(family)
    ) {
      return null;
    }
    const record = store.getKnowledgeRecord(family as KnowledgeRecordFamily, id);
    return record
      ? { mimeType: "application/json", text: JSON.stringify(record) }
      : null;
  }
  if (segments[0] === "examples" && segments.length === 2) {
    const id = exactDecodedSegment(segments[1]!);
    if (!id) return null;
    const index = JSON.parse(textFromArtifact(store, "examples/index.json")) as {
      contract: string;
      examples: Array<{ id: string }>;
    };
    const example =
      index.contract === "salt-example-index/1"
        ? index.examples.find((entry) => entry.id === id)
        : null;
    return example
      ? { mimeType: "application/json", text: JSON.stringify(example) }
      : null;
  }
  if (segments[0] === "migrations" && segments.length === 2) {
    const id = exactDecodedSegment(segments[1]!);
    if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) return null;
    const index = textFromArtifact(store, "markdown/migrations/index.md");
    if (!index.split(/\r?\n/u).includes(`- ${id} (planned)`)) return null;
    return {
      mimeType: "application/json",
      text: JSON.stringify({
        contract: "salt-migration-index-entry/1",
        id,
        status: "planned",
        bundle_digest: store.manifest.bundle_digest,
      }),
    };
  }
  if (segments[0] === "markdown" && segments.length === 2) {
    const relative = exactDecodedSegment(segments[1]!);
    if (!relative || !relative.endsWith(".md")) return null;
    let artifact: string;
    try {
      artifact = parseKnowledgeArtifactPath(`markdown/${relative}`);
    } catch {
      return null;
    }
    try {
      return { mimeType: "text/markdown", text: textFromArtifact(store, artifact) };
    } catch {
      return null;
    }
  }
  return null;
}

export function registerSaltResources(server: McpServer, store: KnowledgeStore): void {
  const baseUri = knowledgeBaseUri(store.manifest);
  const bootstrap = BOOTSTRAP_DEFINITIONS.map((definition) => ({
    uri: `${baseUri}/bootstrap/${definition.slug}`,
    name: definition.name,
    title: definition.title,
    description: definition.description,
    mimeType: definition.mimeType,
  }));
  const templates = templateDefinitions(baseUri);
  if (templates.length > MAX_RESOURCE_TEMPLATES) {
    throw new Error("Salt MCP resource-template inventory exceeds its contract.");
  }

  server.server.registerCapabilities({
    resources: { listChanged: false, subscribe: false },
  });
  server.server.setRequestHandler("resources/list", async (request) => {
    const offset = decodeDiscoveryCursor(request.params?.cursor, {
      bundleDigest: store.manifest.bundle_digest,
      kind: "resources",
      total: bootstrap.length,
    });
    const resources = bootstrap.slice(offset, offset + RESOURCE_PAGE_SIZE);
    const nextOffset = offset + resources.length;
    const result = {
      resources,
      ...(nextOffset < bootstrap.length
        ? {
            nextCursor: encodeDiscoveryCursor({
              contract: "salt-mcp-discovery-cursor/1",
              bundle_digest: store.manifest.bundle_digest,
              kind: "resources",
              offset: nextOffset,
            }),
          }
        : {}),
    };
    assertDiscoveryBudget(result);
    return result;
  });
  server.server.setRequestHandler("resources/templates/list", async (request) => {
    decodeDiscoveryCursor(request.params?.cursor, {
      bundleDigest: store.manifest.bundle_digest,
      kind: "resource_templates",
      total: templates.length,
    });
    const result = { resourceTemplates: [...templates] };
    assertDiscoveryBudget(result);
    return result;
  });
  server.server.setRequestHandler("resources/read", async (request, ctx) => {
    ctx.mcpReq.signal.throwIfAborted();
    const uri = request.params.uri;
    const staticIndex = bootstrap.findIndex((entry) => entry.uri === uri);
    let resource: { mimeType: string; text: string } | null = null;
    if (staticIndex >= 0) {
      const definition = BOOTSTRAP_DEFINITIONS[staticIndex]!;
      resource = {
        mimeType: definition.mimeType,
        text: staticResourceText(store, definition),
      };
    } else {
      resource = readTemplatedResource(store, baseUri, uri);
    }
    if (!resource) throw new ResourceNotFoundError(uri);
    ctx.mcpReq.signal.throwIfAborted();
    return {
      contents: [
        {
          uri,
          mimeType: resource.mimeType,
          text: assertResourceText(uri, resource.text),
        },
      ],
    };
  });
}
