import { Buffer } from "node:buffer";
import {
  type McpServer,
  ResourceNotFoundError,
  ResourceTemplate,
} from "@modelcontextprotocol/server";
import {
  canonicalCatalogRuntimeFamilies,
  catalogFamilyFromUriSegment,
  catalogFamilyUriSegment,
  decodeProjectPolicyRootToken,
  MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS,
  MAX_PROJECT_POLICY_RESOURCE_ID_CHARS,
  normalizeCatalogPublicCitation,
  resolveCatalogRecordContentReferences,
  type SaltCatalogRuntimeContext,
} from "../core/runtime.js";
import type { ProjectAccessPolicy } from "./projectAccess.js";
import {
  isAuthorizedProjectPolicySnapshot,
  loadAuthorizedProjectPolicySnapshot,
  type ProjectPolicySnapshotCache,
  projectPolicyClaimRecord,
} from "./projectPolicySnapshot.js";
import {
  getSaltMcpRuntimeMetadata,
  SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS,
} from "./serverMetadata.js";

export const MAX_CATALOG_RESOURCE_READ_UTF8_BYTES = 64 * 1024;

function boundedResourceText(uri: string, text: string): string {
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > MAX_CATALOG_RESOURCE_READ_UTF8_BYTES) {
    throw new Error(
      `Resource '${uri}' is ${bytes} bytes; the public read limit is ${MAX_CATALOG_RESOURCE_READ_UTF8_BYTES} bytes.`,
    );
  }
  return text;
}

function singleVariable(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function canonicalArtifact(
  context: SaltCatalogRuntimeContext,
  family: ReturnType<typeof canonicalCatalogRuntimeFamilies>[number],
) {
  const artifact = context.store.manifest.artifacts.find(
    (candidate) => candidate.family === family && candidate.canonical,
  );
  if (!artifact) {
    throw new Error(`Catalog manifest omitted canonical family '${family}'.`);
  }
  return artifact;
}

function publicCatalogManifest(
  server: McpServer,
  context: SaltCatalogRuntimeContext,
) {
  const metadata = getSaltMcpRuntimeMetadata(context);
  return {
    server_version: metadata.server_version,
    schema_version: context.store.manifest.schema_version,
    catalog_version: context.store.manifest.catalog_version,
    semantic_digest: context.store.manifest.semantic_digest,
    input_inventory_digest: context.store.manifest.input_inventory_digest,
    generator_digest: context.store.manifest.generator.digest,
    source_revision: context.store.manifest.source_revision,
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
  context: SaltCatalogRuntimeContext & {
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
          text: boundedResourceText(
            uri.href,
            JSON.stringify(publicCatalogManifest(server, context)),
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
      title: "Authorized Salt project policy",
      description:
        "Exact retained digest-bound project-policy manifest, canonical IR chunks, or bounded claim records from an authorized local project.",
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
        digest,
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

      let payload: unknown;
      if (kind === "manifest") {
        payload = {
          contract: "salt_project_policy_resource_v2",
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
        };
      } else if (kind === "chunk") {
        if (!/^(0|[1-9][0-9]*)$/u.test(id)) {
          throw new ResourceNotFoundError(uri.href);
        }
        const index = Number(id);
        const data = loaded.chunks[index];
        if (!Number.isSafeInteger(index) || data === undefined) {
          throw new ResourceNotFoundError(uri.href);
        }
        payload = {
          contract: "salt_project_policy_chunk_v2",
          policy_digest: digest,
          encoding: "base64url",
          index,
          chunk_count: loaded.chunks.length,
          data,
        };
      } else {
        const occurrence = loaded.ir.occurrences.find(
          (candidate) => candidate.occurrence_id === id,
        );
        if (!occurrence) throw new ResourceNotFoundError(uri.href);
        payload = {
          contract: "salt_project_policy_claim_v2",
          policy_digest: digest,
          claim: projectPolicyClaimRecord(occurrence, rootDir),
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: boundedResourceText(uri.href, JSON.stringify(payload)),
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
      if (family === "content" && record.family === "content") {
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
              text: boundedResourceText(uri.href, text),
            },
          ],
        };
      }
      const contentResources = resolveCatalogRecordContentReferences(
        record,
      ).map((reference) => ({
        reference,
        uri: normalizeCatalogPublicCitation({
          kind: "catalog_record",
          manifest: context.store.manifest,
          family: "content",
          id: reference.id,
        }),
      }));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: boundedResourceText(
              uri.href,
              JSON.stringify({
                resolved_catalog_digest: context.store.manifest.semantic_digest,
                record,
                content_resources: contentResources,
              }),
            ),
          },
        ],
      };
    },
  );
}
