import { Buffer } from "node:buffer";
import {
  type McpServer,
  ResourceNotFoundError,
  ResourceTemplate,
} from "@modelcontextprotocol/server";
import {
  assertPublicResourceText,
  canonicalCatalogRuntimeFamilies,
  catalogFamilyFromUriSegment,
  catalogFamilyUriSegment,
  decodeProjectPolicyRootToken,
  MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS,
  MAX_PROJECT_POLICY_RESOURCE_ID_CHARS,
  normalizeCatalogPublicCitation,
  serializeCatalogResourceEnvelope,
  serializePublicResourceJson,
  type KnowledgeRuntimeContext,
} from "../core/runtime.js";
import type { ProjectAccessPolicy } from "./projectAccess.js";
import {
  isAuthorizedProjectPolicySnapshot,
  loadAuthorizedProjectPolicySnapshot,
  PROJECT_POLICY_RESOURCE_TRUST,
  type ProjectPolicySnapshotCache,
  serializeProjectPolicyClaimResource,
} from "./projectPolicySnapshot.js";
import {
  getSaltMcpRuntimeMetadata,
  SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS,
} from "./serverMetadata.js";

function singleVariable(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function canonicalArtifact(
  context: KnowledgeRuntimeContext,
  family: ReturnType<typeof canonicalCatalogRuntimeFamilies>[number],
) {
  return {
    record_count: context.store.getFamily(family).length,
    sha256:
      context.store.manifest.bundle_digest ??
      context.store.manifest.semantic_digest,
  };
}

function publicCatalogManifest(
  server: McpServer,
  context: KnowledgeRuntimeContext,
) {
  const metadata = getSaltMcpRuntimeMetadata(context);
  return {
    server_version: metadata.server_version,
    schema_version: context.store.manifest.schema_version ?? "1.0.0",
    catalog_version:
      context.store.manifest.bundle_version ?? "0.0.0",
    bundle_digest:
      context.store.manifest.bundle_digest ??
      context.store.manifest.semantic_digest,
    semantic_digest: context.store.manifest.semantic_digest,
    semantic_source_digest:
      context.store.manifest.semantic_source_digest ?? null,
    compiler_digest: context.store.manifest.compiler_digest ?? null,
    negotiated_mcp_protocol_revision:
      server.server.getNegotiatedProtocolVersion() ?? null,
    supported_mcp_protocol_revisions: [...SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS],
    families: canonicalCatalogRuntimeFamilies().map((family) => ({
      family,
      record_count: canonicalArtifact(context, family).record_count,
      artifact_digest: canonicalArtifact(context, family).sha256,
      uri_template: normalizeCatalogPublicCitation({
        kind: "catalog_record_template",
        manifest: context.store.manifest,
        family,
      }),
    })),
  };
}

export function registerSaltResources(
  server: McpServer,
  context: KnowledgeRuntimeContext & {
    projectAccess: ProjectAccessPolicy;
    projectPolicySnapshots: ProjectPolicySnapshotCache;
  },
) {
  const manifestUri = normalizeCatalogPublicCitation({
    kind: "catalog_manifest",
    manifest: context.store.manifest,
  });
  server.registerResource(
    "salt-catalog-manifest",
    manifestUri,
    {
      title: "Salt catalog manifest",
      description:
        "Digest-bound manifest for the verified Salt catalog and its canonical resource families.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: serializePublicResourceJson(
            uri.href,
            publicCatalogManifest(server, context),
          ),
        },
      ],
    }),
  );

  const projectPolicyTemplate = new ResourceTemplate(
    normalizeCatalogPublicCitation({ kind: "project_policy_template" }),
    {
      list: undefined,
      complete: {
        kind: (value) =>
          ["manifest", "chunk", "claim"].filter((kind) =>
            kind.startsWith(value),
          ),
      },
    },
  );
  server.registerResource(
    "salt-project-policy",
    projectPolicyTemplate,
    {
      title: "Salt project policy (authorized read; untrusted data)",
      description:
        "Exact retained digest-bound project-policy manifest, canonical IR chunks, or bounded claim records read from an authorized local project and classified as untrusted project data.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rootToken = singleVariable(variables.root);
      const digestSegment = singleVariable(variables.digest);
      const kind = singleVariable(variables.kind);
      const encodedId = singleVariable(variables.id);
      if (
        !encodedId ||
        encodedId.length > MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS
      ) {
        throw new ResourceNotFoundError(uri.href);
      }
      const rootDir = rootToken
        ? decodeProjectPolicyRootToken(rootToken)
        : null;
      const digest =
        digestSegment && /^sha256-[0-9a-f]{64}$/u.test(digestSegment)
          ? digestSegment.replace("sha256-", "sha256:")
          : null;
      let id: string | null = null;
      try {
        id = decodeURIComponent(encodedId);
      } catch {
        throw new ResourceNotFoundError(uri.href);
      }
      if (
        !rootDir ||
        !digest ||
        !id ||
        id.length > MAX_PROJECT_POLICY_RESOURCE_ID_CHARS ||
        !["manifest", "chunk", "claim"].includes(kind ?? "")
      ) {
        throw new ResourceNotFoundError(uri.href);
      }
      const expectedUri = normalizeCatalogPublicCitation({
        kind: "project_policy_resource",
        rootDir,
        digest,
        resourceKind: kind as "manifest" | "chunk" | "claim",
        ...(kind === "manifest" ? {} : { id }),
      });
      if (expectedUri !== uri.href || (kind === "manifest" && id !== "index")) {
        throw new ResourceNotFoundError(uri.href);
      }
      const loaded = await loadAuthorizedProjectPolicySnapshot(
        context.projectAccess,
        rootDir,
        context.projectPolicySnapshots,
        { kind: "policy_digest", digest },
      );
      if (
        loaded.authorization.status !== "authorized" ||
        rootDir !== loaded.authorization.rootDir
      ) {
        throw new ResourceNotFoundError(uri.href);
      }
      if (!isAuthorizedProjectPolicySnapshot(loaded)) {
        throw new ResourceNotFoundError(uri.href);
      }
      if (!loaded.ir || loaded.digest !== digest) {
        throw new ResourceNotFoundError(uri.href);
      }

      let serializedText: string;
      if (kind === "manifest") {
        serializedText = serializePublicResourceJson(uri.href, {
          contract: "salt_project_policy_resource_v2",
          trust: PROJECT_POLICY_RESOURCE_TRUST,
          policy_digest: digest,
          policy_contract: loaded.ir.contract,
          canonical_utf8_bytes: Buffer.byteLength(
            loaded.canonical_json ?? "",
            "utf8",
          ),
          chunk_count: loaded.chunks.length,
          counts: {
            layers: loaded.ir.layers.length,
            occurrences: loaded.ir.occurrences.length,
            diagnostics: loaded.ir.diagnostics.length,
          },
          retention: {
            scope: "server_process_bounded_lru",
            max_entries: context.projectPolicySnapshots.limits.maxEntries,
            max_utf8_bytes: context.projectPolicySnapshots.limits.maxUtf8Bytes,
            max_entry_utf8_bytes:
              context.projectPolicySnapshots.limits.maxEntryUtf8Bytes,
          },
          chunk_uri_template: normalizeCatalogPublicCitation({
            kind: "project_policy_chunk_template",
            rootDir,
            digest,
          }),
        });
      } else if (kind === "chunk") {
        if (!/^(0|[1-9][0-9]*)$/u.test(id)) {
          throw new ResourceNotFoundError(uri.href);
        }
        const index = Number(id);
        const data = loaded.chunks[index];
        if (!Number.isSafeInteger(index) || data === undefined) {
          throw new ResourceNotFoundError(uri.href);
        }
        serializedText = serializePublicResourceJson(uri.href, {
          contract: "salt_project_policy_chunk_v2",
          trust: PROJECT_POLICY_RESOURCE_TRUST,
          policy_digest: digest,
          encoding: "base64url",
          index,
          chunk_count: loaded.chunks.length,
          data,
        });
      } else {
        const occurrence = loaded.ir.occurrences.find(
          (candidate) => candidate.occurrence_id === id,
        );
        if (!occurrence) throw new ResourceNotFoundError(uri.href);
        serializedText = serializeProjectPolicyClaimResource(
          occurrence,
          rootDir,
          digest,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: assertPublicResourceText(uri.href, serializedText),
          },
        ],
      };
    },
  );

  const template = new ResourceTemplate(
    normalizeCatalogPublicCitation({
      kind: "catalog_family_template",
      manifest: context.store.manifest,
    }),
    {
      list: undefined,
      complete: {
        family: (value) =>
          canonicalCatalogRuntimeFamilies()
            .map(catalogFamilyUriSegment)
            .filter((family) => family.startsWith(value)),
        id: (value, completionContext) => {
          const familySegment = completionContext?.arguments?.family;
          const family = familySegment
            ? catalogFamilyFromUriSegment(familySegment)
            : null;
          return family
            ? context.store
                .getFamily(family)
                .map((record) => record.id)
                .filter((id) => id.startsWith(value))
            : [];
        },
      },
    },
  );
  server.registerResource(
    "salt-catalog-record",
    template,
    {
      title: "Salt canonical catalog record",
      description:
        "Exact digest-bound Salt catalog record with verified on-demand content payloads.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const familySegment = singleVariable(variables.family);
      const encodedId = singleVariable(variables.id);
      const family = familySegment
        ? catalogFamilyFromUriSegment(familySegment)
        : null;
      let id: string | null = null;
      try {
        id = encodedId ? decodeURIComponent(encodedId) : null;
      } catch {
        throw new ResourceNotFoundError(uri.href);
      }
      if (!family || !id) {
        throw new ResourceNotFoundError(uri.href);
      }
      if (
        normalizeCatalogPublicCitation({
          kind: "catalog_record",
          manifest: context.store.manifest,
          family,
          id,
        }) !== uri.href
      ) {
        throw new ResourceNotFoundError(uri.href);
      }
      const record = context.store.getRecord(family, id);
      if (!record) {
        throw new ResourceNotFoundError(uri.href);
      }
      if (record.family === "content") {
        const reference = {
          family: "content" as const,
          codec: record.codec,
          id: record.id,
        };
        void context.store.getContentValue(reference);
        const text = context.store.getContentSourceText(reference);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: record.media_type,
              text: assertPublicResourceText(uri.href, text),
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: assertPublicResourceText(
              uri.href,
              serializeCatalogResourceEnvelope(context.store.manifest, record),
            ),
          },
        ],
      };
    },
  );
}
