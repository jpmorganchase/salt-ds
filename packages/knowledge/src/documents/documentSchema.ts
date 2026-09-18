import * as z from "zod/v4";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { isCanonicalSiteRoute } from "../catalog/catalogSiteRoute.js";

export interface DocumentSourceRange {
  start_offset: number;
  end_offset: number;
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
}

export interface DocumentSource {
  document_id: string;
  source_path: string;
  route: string;
}

export type DocumentInline =
  | { kind: "text"; value: string }
  | {
      kind: "emphasis" | "strong" | "delete";
      children: DocumentInline[];
    }
  | { kind: "inline_code"; value: string }
  | {
      kind: "link";
      href: string;
      title: string | null;
      children: DocumentInline[];
    }
  | { kind: "break" };

export type DocumentBlock =
  | { kind: "paragraph"; children: DocumentInline[] }
  | { kind: "heading"; level: number; children: DocumentInline[] }
  | {
      kind: "list";
      ordered: boolean;
      start: number | null;
      spread: boolean;
      items: DocumentBlock[][];
    }
  | {
      kind: "code";
      language: string | null;
      meta: string | null;
      value: string;
    }
  | {
      kind: "guidance_callout";
      tone: "positive" | "negative" | "neutral";
      label: string | null;
      blocks: DocumentBlock[];
    }
  | {
      kind: "diagram";
      asset: { public_path: string; source_path: string | null };
      alt: string;
      caption: string | null;
      blocks: DocumentBlock[];
    }
  | {
      kind: "diagram_group";
      label: string | null;
      items: Array<Extract<DocumentBlock, { kind: "diagram" }>>;
    }
  | {
      kind: "live_preview";
      component_name: string;
      example_name: string;
      display_name: string | null;
      purpose_section_id: string;
      example_source_path: string | null;
    }
  | { kind: "unsupported"; diagnostic_id: string };

export interface DocumentSection {
  id: string;
  /**
   * Present when a selected section has been composed with sections from
   * another document. Absent sections inherit DocumentModel.source.
   */
  source?: DocumentSource;
  heading_path: string[];
  heading: DocumentInline[] | null;
  level: number | null;
  blocks: DocumentBlock[];
}

export const SELECTED_MDX_DIAGNOSTIC_CODES = [
  "MDX_PARSE_ERROR",
  "MDX_SELECTED_SECTION_MISSING",
  "MDX_DUPLICATE_SELECTED_SECTION",
  "MDX_UNSUPPORTED_FLOW_NODE",
  "MDX_UNSUPPORTED_INLINE_NODE",
  "MDX_RUNTIME_CODE_INERT",
  "MDX_EXPRESSION_INERT",
  "MDX_UNSUPPORTED_COMPONENT",
  "MDX_DYNAMIC_ATTRIBUTE",
  "MDX_MISSING_REQUIRED_ATTRIBUTE",
  "MDX_INVALID_LITERAL_ATTRIBUTE",
  "MDX_EXAMPLE_SOURCE_INVALID",
  "MDX_ASSET_SOURCE_INVALID",
  "MDX_FRAGMENT_SOURCE_INVALID",
] as const;

export type SelectedMdxDiagnosticCode =
  (typeof SELECTED_MDX_DIAGNOSTIC_CODES)[number];

export interface SelectedMdxDiagnostic {
  code: SelectedMdxDiagnosticCode;
  message: string;
  section_id: string | null;
  range: DocumentSourceRange;
}

export interface DocumentModel {
  contract: "salt-document/1";
  source: DocumentSource;
  sections: DocumentSection[];
  diagnostics: SelectedMdxDiagnostic[];
}

const portableRepositoryPathCodec = z
  .string()
  .min(1)
  .refine(isPortableRepositoryPath, "Expected a portable repository path.");
const canonicalSiteRouteCodec = z
  .string()
  .min(1)
  .refine(
    isCanonicalSiteRoute,
    "Expected a canonical Salt documentation route.",
  );
const publicImagePathCodec = z
  .string()
  .regex(/^\/img\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/u);
const sectionIdCodec = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/u,
    "Expected a portable section id.",
  );

const sourceRangeCodec = z
  .object({
    start_offset: z.number().int().nonnegative(),
    end_offset: z.number().int().nonnegative(),
    start_line: z.number().int().positive(),
    start_column: z.number().int().positive(),
    end_line: z.number().int().positive(),
    end_column: z.number().int().positive(),
  })
  .strict();

const sourceCodec = z
  .object({
    document_id: z.string().min(1),
    source_path: portableRepositoryPathCodec,
    route: canonicalSiteRouteCodec,
  })
  .strict();

const inlineCodec: z.ZodType<DocumentInline> = z.lazy(() =>
  z.union([
    z.object({ kind: z.literal("text"), value: z.string() }).strict(),
    z
      .object({
        kind: z.enum(["emphasis", "strong", "delete"]),
        children: z.array(inlineCodec),
      })
      .strict(),
    z.object({ kind: z.literal("inline_code"), value: z.string() }).strict(),
    z
      .object({
        kind: z.literal("link"),
        href: z.string(),
        title: z.string().nullable(),
        children: z.array(inlineCodec),
      })
      .strict(),
    z.object({ kind: z.literal("break") }).strict(),
  ]),
);

const blockCodec: z.ZodType<DocumentBlock> = z.lazy(() =>
  z.union([
    z
      .object({ kind: z.literal("paragraph"), children: z.array(inlineCodec) })
      .strict(),
    z
      .object({
        kind: z.literal("heading"),
        level: z.number().int().min(1).max(6),
        children: z.array(inlineCodec),
      })
      .strict(),
    z
      .object({
        kind: z.literal("list"),
        ordered: z.boolean(),
        start: z.number().int().positive().nullable(),
        spread: z.boolean(),
        items: z.array(z.array(blockCodec)),
      })
      .strict(),
    z
      .object({
        kind: z.literal("code"),
        language: z.string().nullable(),
        meta: z.string().nullable(),
        value: z.string(),
      })
      .strict(),
    z
      .object({
        kind: z.literal("guidance_callout"),
        tone: z.enum(["positive", "negative", "neutral"]),
        label: z.string().nullable(),
        blocks: z.array(blockCodec),
      })
      .strict(),
    z
      .object({
        kind: z.literal("diagram"),
        asset: z
          .object({
            public_path: publicImagePathCodec,
            source_path: portableRepositoryPathCodec.nullable(),
          })
          .strict(),
        alt: z.string(),
        caption: z.string().nullable(),
        blocks: z.array(blockCodec),
      })
      .strict(),
    z
      .object({
        kind: z.literal("diagram_group"),
        label: z.string().nullable(),
        items: z.array(
          z
            .object({
              kind: z.literal("diagram"),
              asset: z
                .object({
                  public_path: publicImagePathCodec,
                  source_path: portableRepositoryPathCodec.nullable(),
                })
                .strict(),
              alt: z.string(),
              caption: z.string().nullable(),
              blocks: z.array(blockCodec),
            })
            .strict(),
        ),
      })
      .strict(),
    z
      .object({
        kind: z.literal("live_preview"),
        component_name: z.string().min(1),
        example_name: z.string().min(1),
        display_name: z.string().nullable(),
        purpose_section_id: sectionIdCodec,
        example_source_path: portableRepositoryPathCodec.nullable(),
      })
      .strict(),
    z
      .object({
        kind: z.literal("unsupported"),
        diagnostic_id: z.string().min(1),
      })
      .strict(),
  ]),
);

const sectionCodec: z.ZodType<DocumentSection> = z
  .object({
    id: sectionIdCodec,
    source: sourceCodec.optional(),
    heading_path: z.array(z.string()),
    heading: z.array(inlineCodec).nullable(),
    level: z.number().int().min(1).max(6).nullable(),
    blocks: z.array(blockCodec),
  })
  .strict();

const diagnosticCodec: z.ZodType<SelectedMdxDiagnostic> = z
  .object({
    code: z.enum(SELECTED_MDX_DIAGNOSTIC_CODES),
    message: z.string().min(1),
    section_id: z.string().min(1).nullable(),
    range: sourceRangeCodec,
  })
  .strict();

export const documentModelCodec: z.ZodType<DocumentModel> = z
  .object({
    contract: z.literal("salt-document/1"),
    source: sourceCodec,
    sections: z.array(sectionCodec),
    diagnostics: z.array(diagnosticCodec),
  })
  .strict()
  .superRefine((document, context) => {
    if (document.sections.length === 0 && document.diagnostics.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["sections"],
        message: "A successful selected document needs at least one section.",
      });
    }
    const ids = new Set<string>();
    document.sections.forEach((section, index) => {
      if (ids.has(section.id)) {
        context.addIssue({
          code: "custom",
          path: ["sections", index, "id"],
          message: "Document section ids must be unique.",
        });
      }
      ids.add(section.id);
    });
  });

export function parseDocumentModel(value: unknown): DocumentModel {
  return documentModelCodec.parse(value);
}
