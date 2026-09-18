import {
  isCanonicalSiteRoute,
  isSafeAbsoluteHttpsUrl,
  type KnowledgeRecordFamily,
  officialSaltSiteUrl,
} from "@salt-ds/knowledge";
import {
  type ProjectPolicyResourceKind,
  projectPolicyResourceTemplate,
  projectPolicyResourceUri,
} from "../policy/projectPolicyResourceIdentity.js";
import {
  catalogManifestResourceUri,
  catalogRecordResourceTemplate,
  catalogRecordResourceUri,
  type KnowledgeManifestIdentity,
} from "./catalogResourceIdentity.js";

export type CatalogPublicCitation =
  | { kind: "catalog_manifest"; manifest: KnowledgeManifestIdentity }
  | {
      kind: "catalog_record";
      manifest: KnowledgeManifestIdentity;
      family: KnowledgeRecordFamily;
      id: string;
    }
  | {
      kind: "catalog_record_template";
      manifest: KnowledgeManifestIdentity;
      family: KnowledgeRecordFamily;
    }
  | { kind: "catalog_family_template"; manifest: KnowledgeManifestIdentity }
  | { kind: "project_policy_template" }
  | {
      kind: "project_policy_chunk_template";
      rootDir: string;
      digest: string;
    }
  | {
      kind: "project_policy_resource";
      rootDir: string;
      digest: string;
      resourceKind: ProjectPolicyResourceKind;
      id?: string;
    }
  | { kind: "site_route"; locator: string }
  | { kind: "external_https"; locator: string };

function absoluteHttpsUrl(locator: string): string {
  if (
    !isSafeAbsoluteHttpsUrl(locator) ||
    locator.length === 0 ||
    locator !== locator.trim() ||
    locator !== locator.normalize("NFC")
  ) {
    throw new Error(`Expected an absolute HTTPS citation: ${locator}`);
  }
  let parsed: URL;
  try {
    parsed = new URL(locator);
  } catch {
    throw new Error(`Expected an absolute HTTPS citation: ${locator}`);
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== ""
  ) {
    throw new Error(`Expected an absolute HTTPS citation: ${locator}`);
  }
  return parsed.href;
}

/**
 * The only public citation projection boundary.
 *
 * Catalog claims use immutable MCP resource identities. Curated site routes
 * and external references become absolute HTTPS URLs before reaching a tool
 * result, so an origin-relative catalog locator is never mistaken for a
 * client-resolvable citation.
 */
export function normalizeCatalogPublicCitation(
  citation: CatalogPublicCitation,
): string {
  switch (citation.kind) {
    case "catalog_manifest":
      return catalogManifestResourceUri(citation.manifest);
    case "catalog_record":
      return catalogRecordResourceUri(
        citation.manifest,
        citation.family,
        citation.id,
      );
    case "catalog_record_template":
      return catalogRecordResourceUri(
        citation.manifest,
        citation.family,
        "{id}",
      ).replace("%7Bid%7D", "{id}");
    case "catalog_family_template":
      return catalogRecordResourceTemplate(citation.manifest);
    case "project_policy_template":
      return projectPolicyResourceTemplate();
    case "project_policy_chunk_template":
      return projectPolicyResourceUri({
        rootDir: citation.rootDir,
        digest: citation.digest,
        kind: "chunk",
        id: "{index}",
      }).replace("%7Bindex%7D", "{index}");
    case "project_policy_resource":
      return projectPolicyResourceUri({
        rootDir: citation.rootDir,
        digest: citation.digest,
        kind: citation.resourceKind,
        id: citation.id,
      });
    case "site_route":
      return officialSaltSiteUrl(citation.locator);
    case "external_https":
      return absoluteHttpsUrl(citation.locator);
  }
}

export function normalizeCatalogPublicLocator(locator: string): string {
  if (isCanonicalSiteRoute(locator)) {
    return normalizeCatalogPublicCitation({
      kind: "site_route",
      locator,
    });
  }
  if (isSafeAbsoluteHttpsUrl(locator)) {
    return normalizeCatalogPublicCitation({
      kind: "external_https",
      locator,
    });
  }
  throw new Error(`Unsupported public citation locator: ${locator}`);
}
