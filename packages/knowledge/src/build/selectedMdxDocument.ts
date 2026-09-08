import { parseExpression } from "@babel/parser";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type {
  DocumentBlock,
  DocumentInline,
  DocumentModel,
  DocumentSection,
  DocumentSourceRange,
  SelectedMdxDiagnosticCode,
} from "../documents/documentSchema.js";

export interface SelectedMdxSectionSelector {
  id: string;
  heading_path: readonly string[];
  include_descendants: boolean;
}

export interface ParseSelectedMdxDocumentInput {
  source: DocumentModel["source"];
  mdx: string;
  selectors: readonly SelectedMdxSectionSelector[];
}

interface MdxPosition {
  start?: { line?: number; column?: number; offset?: number };
  end?: { line?: number; column?: number; offset?: number };
}

interface MdxAttribute {
  type?: string;
  name?: string;
  value?: string | null | { type?: string; value?: string };
}

interface MdxNode {
  type: string;
  children?: MdxNode[];
  value?: string;
  depth?: number;
  ordered?: boolean;
  start?: number | null;
  spread?: boolean;
  lang?: string | null;
  meta?: string | null;
  url?: string;
  title?: string | null;
  name?: string | null;
  attributes?: MdxAttribute[];
  position?: MdxPosition;
}

interface SourceSection {
  heading_path: string[];
  heading: MdxNode | null;
  level: number | null;
  range: DocumentSourceRange;
  nodes: MdxNode[];
  children: SourceSection[];
  parent: SourceSection | null;
}

interface SelectedSection {
  section: SourceSection;
  selector: SelectedMdxSectionSelector | null;
  id: string;
}

function resolveRemarkPlugin<T>(plugin: T): T {
  if (
    plugin &&
    typeof plugin === "object" &&
    "default" in (plugin as Record<string, unknown>)
  ) {
    return ((plugin as unknown as { default: T }).default ?? plugin) as T;
  }

  return plugin;
}

function defaultRange(): DocumentSourceRange {
  return {
    start_offset: 0,
    end_offset: 0,
    start_line: 1,
    start_column: 1,
    end_line: 1,
    end_column: 1,
  };
}

function rangeFor(node: MdxNode | null | undefined): DocumentSourceRange {
  const start = node?.position?.start;
  const end = node?.position?.end;
  if (!start || !end) return defaultRange();

  return {
    start_offset: start.offset ?? 0,
    end_offset: end.offset ?? start.offset ?? 0,
    start_line: start.line ?? 1,
    start_column: start.column ?? 1,
    end_line: end.line ?? start.line ?? 1,
    end_column: end.column ?? start.column ?? 1,
  };
}

function plainText(node: MdxNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(plainText).join("");
}

function headingPathKey(path: readonly string[]): string {
  return path.join("\u0000");
}

function slugSegment(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(^-|-$)/gu, "");
  return slug || "section";
}

function sectionsFromTree(tree: MdxNode): SourceSection {
  const root: SourceSection = {
    heading_path: [],
    heading: null,
    level: null,
    range: defaultRange(),
    nodes: [],
    children: [],
    parent: null,
  };
  const stack: SourceSection[] = [root];

  for (const node of tree.children ?? []) {
    if (node.type === "heading" && typeof node.depth === "number") {
      while (
        stack.length > 1 &&
        (stack.at(-1)?.level ?? Number.NEGATIVE_INFINITY) >= node.depth
      ) {
        stack.pop();
      }
      const parent = stack.at(-1) ?? root;
      const section: SourceSection = {
        heading_path: [...parent.heading_path, plainText(node).trim()],
        heading: node,
        level: node.depth,
        range: rangeFor(node),
        nodes: [],
        children: [],
        parent,
      };
      parent.children.push(section);
      stack.push(section);
      continue;
    }
    (stack.at(-1) ?? root).nodes.push(node);
  }

  return root;
}

function allSections(root: SourceSection): SourceSection[] {
  return [root, ...root.children.flatMap(allSections)];
}

function isDescendantOf(
  section: SourceSection,
  ancestor: SourceSection,
): boolean {
  let current: SourceSection | null = section.parent;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function isSafePathSegment(value: string): boolean {
  return /^[A-Za-z0-9._-]+$/u.test(value) && value !== "." && value !== "..";
}

function deriveExampleSourcePath(
  componentName: string,
  exampleName: string,
): string | null {
  const componentSegments = componentName.split("/");
  if (
    componentSegments.length === 0 ||
    componentSegments.some((segment) => !isSafePathSegment(segment)) ||
    !/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(exampleName)
  ) {
    return null;
  }
  return `site/src/examples/${componentSegments.join("/")}/${exampleName}.tsx`;
}

function deriveAssetSourcePath(publicPath: string): string | null {
  if (!publicPath.startsWith("/img/")) return null;
  const segments = publicPath.slice(1).split("/");
  if (segments.some((segment) => !isSafePathSegment(segment))) return null;
  return `site/public/${segments.join("/")}`;
}

function isMdxComment(node: MdxNode): boolean {
  const value = node.value?.trim() ?? "";
  return /^\/\*[\s\S]*\*\/$/u.test(value);
}

class SectionConverter {
  private diagnosticCount = 0;
  private lastDiagnosticId = "";

  constructor(
    private readonly diagnostics: DocumentModel["diagnostics"],
    private readonly sectionId: string,
    private readonly purposeSectionId: string,
  ) {}

  private diagnostic(
    code: SelectedMdxDiagnosticCode,
    message: string,
    node: MdxNode | null | undefined,
  ): string {
    this.diagnosticCount += 1;
    const diagnosticId = `${code}:${this.diagnosticCount}`;
    this.lastDiagnosticId = diagnosticId;
    this.diagnostics.push({
      code,
      message,
      section_id: this.sectionId,
      range: rangeFor(node),
    });
    return diagnosticId;
  }

  private unsupported(
    code: SelectedMdxDiagnosticCode,
    message: string,
    node: MdxNode,
  ): DocumentBlock {
    return {
      kind: "unsupported",
      diagnostic_id: this.diagnostic(code, message, node),
    };
  }

  inline(nodes: readonly MdxNode[]): DocumentInline[] {
    const result: DocumentInline[] = [];
    for (const node of nodes) {
      switch (node.type) {
        case "text":
          result.push({ kind: "text", value: node.value ?? "" });
          break;
        case "emphasis":
        case "strong":
        case "delete":
          result.push({
            kind: node.type,
            children: this.inline(node.children ?? []),
          });
          break;
        case "inlineCode":
          result.push({ kind: "inline_code", value: node.value ?? "" });
          break;
        case "link":
          result.push({
            kind: "link",
            href: node.url ?? "",
            title: node.title ?? null,
            children: this.inline(node.children ?? []),
          });
          break;
        case "break":
          result.push({ kind: "break" });
          break;
        case "mdxTextExpression":
          if (!isMdxComment(node)) {
            this.diagnostic(
              "MDX_EXPRESSION_INERT",
              "MDX text expressions are inert and cannot supply selected guidance.",
              node,
            );
          }
          break;
        default:
          this.diagnostic(
            "MDX_UNSUPPORTED_INLINE_NODE",
            `Unsupported selected MDX inline node '${node.type}'.`,
            node,
          );
      }
    }
    return result;
  }

  private attributes(node: MdxNode): Map<string, MdxAttribute> | null {
    const result = new Map<string, MdxAttribute>();
    for (const attribute of node.attributes ?? []) {
      if (attribute.type === "mdxJsxExpressionAttribute" || !attribute.name) {
        this.diagnostic(
          "MDX_DYNAMIC_ATTRIBUTE",
          "Spread and expression attributes are not supported in selected MDX.",
          node,
        );
        return null;
      }
      if (result.has(attribute.name)) {
        this.diagnostic(
          "MDX_INVALID_LITERAL_ATTRIBUTE",
          `Duplicate '${attribute.name}' attribute in selected MDX.`,
          node,
        );
        return null;
      }
      result.set(attribute.name, attribute);
    }
    return result;
  }

  private literalString(
    attributes: ReadonlyMap<string, MdxAttribute>,
    name: string,
    node: MdxNode,
    required = false,
  ): string | null {
    const attribute = attributes.get(name);
    if (!attribute) {
      if (required) {
        this.diagnostic(
          "MDX_MISSING_REQUIRED_ATTRIBUTE",
          `Selected MDX <${node.name}> requires a literal '${name}' attribute.`,
          node,
        );
      }
      return null;
    }
    if (typeof attribute.value !== "string") {
      this.diagnostic(
        "MDX_DYNAMIC_ATTRIBUTE",
        `Selected MDX <${node.name}> '${name}' must be a literal string.`,
        node,
      );
      return null;
    }
    return attribute.value;
  }

  private onlyKnownAttributes(
    attributes: ReadonlyMap<string, MdxAttribute>,
    allowed: readonly string[],
    node: MdxNode,
  ): boolean {
    let valid = true;
    for (const name of attributes.keys()) {
      if (!allowed.includes(name)) {
        this.diagnostic(
          "MDX_INVALID_LITERAL_ATTRIBUTE",
          `Selected MDX <${node.name}> has unsupported '${name}' metadata.`,
          node,
        );
        valid = false;
      }
    }
    return valid;
  }

  private diagram(
    node: MdxNode,
  ): Extract<DocumentBlock, { kind: "diagram" }> | null {
    const attributes = this.attributes(node);
    if (!attributes) return null;
    const known = this.onlyKnownAttributes(
      attributes,
      [
        "src",
        "srcDark",
        "alt",
        "caption",
        "background",
        "border",
        "contentPosition",
      ],
      node,
    );
    const src = this.literalString(attributes, "src", node, true);
    const alt = this.literalString(attributes, "alt", node, true);
    const caption = this.literalString(attributes, "caption", node);
    if (!known || !src || alt === null) return null;
    const sourcePath = deriveAssetSourcePath(src);
    if (!sourcePath) {
      this.diagnostic(
        "MDX_ASSET_SOURCE_INVALID",
        `Selected MDX Diagram source '${src}' is outside the supported public image path.`,
        node,
      );
      return null;
    }
    if (alt.trim().length === 0 && !caption?.trim()) {
      this.diagnostic(
        "MDX_MISSING_REQUIRED_ATTRIBUTE",
        "Selected MDX Diagram needs meaningful alt text or a caption.",
        node,
      );
      return null;
    }
    return {
      kind: "diagram",
      asset: { public_path: src, source_path: sourcePath },
      alt,
      caption,
      blocks: this.blocks(node.children ?? []),
    };
  }

  private imageSwitcher(node: MdxNode): DocumentBlock | null {
    const attributes = this.attributes(node);
    if (!attributes) return null;
    const known = this.onlyKnownAttributes(
      attributes,
      ["images", "label"],
      node,
    );
    const label = this.literalString(attributes, "label", node);
    const images = attributes.get("images");
    if (
      !known ||
      !images ||
      images.value === null ||
      typeof images.value !== "object"
    ) {
      this.diagnostic(
        "MDX_MISSING_REQUIRED_ATTRIBUTE",
        "Selected MDX ImageSwitcher requires a literal images array.",
        node,
      );
      return null;
    }
    const literal = parseLiteralImages(images.value.value ?? "");
    if (!literal) {
      this.diagnostic(
        "MDX_DYNAMIC_ATTRIBUTE",
        "Selected MDX ImageSwitcher images must be an array of literal src/alt objects.",
        node,
      );
      return null;
    }
    const items: Array<Extract<DocumentBlock, { kind: "diagram" }>> = [];
    for (const image of literal) {
      const sourcePath = deriveAssetSourcePath(image.src);
      if (!sourcePath) {
        this.diagnostic(
          "MDX_ASSET_SOURCE_INVALID",
          `Selected MDX ImageSwitcher source '${image.src}' is outside the supported public image path.`,
          node,
        );
        return null;
      }
      items.push({
        kind: "diagram",
        asset: { public_path: image.src, source_path: sourcePath },
        alt: image.alt,
        caption: null,
        blocks: [],
      });
    }
    if (
      items.length === 0 ||
      (!label?.trim() && items.every((item) => !item.alt.trim()))
    ) {
      this.diagnostic(
        "MDX_MISSING_REQUIRED_ATTRIBUTE",
        "Selected MDX ImageSwitcher needs a label or meaningful image alt text.",
        node,
      );
      return null;
    }
    return { kind: "diagram_group", label, items };
  }

  private livePreview(node: MdxNode): DocumentBlock | null {
    const attributes = this.attributes(node);
    if (!attributes) return null;
    const known = this.onlyKnownAttributes(
      attributes,
      ["componentName", "exampleName", "displayName"],
      node,
    );
    const componentName = this.literalString(
      attributes,
      "componentName",
      node,
      true,
    );
    const exampleName = this.literalString(
      attributes,
      "exampleName",
      node,
      true,
    );
    const displayName = this.literalString(attributes, "displayName", node);
    if (!known || !componentName || !exampleName) return null;
    const exampleSourcePath = deriveExampleSourcePath(
      componentName,
      exampleName,
    );
    if (!exampleSourcePath) {
      this.diagnostic(
        "MDX_EXAMPLE_SOURCE_INVALID",
        `Selected MDX LivePreview reference '${componentName}/${exampleName}' is unsafe.`,
        node,
      );
      return null;
    }
    return {
      kind: "live_preview",
      component_name: componentName,
      example_name: exampleName,
      display_name: displayName,
      purpose_section_id: this.purposeSectionId,
      example_source_path: exampleSourcePath,
    };
  }

  private guidanceCallout(node: MdxNode): DocumentBlock | null {
    const attributes = this.attributes(node);
    if (!attributes) return null;
    const known = this.onlyKnownAttributes(
      attributes,
      ["type", "customPillText", "label"],
      node,
    );
    const type = this.literalString(attributes, "type", node, true);
    const customLabel = this.literalString(attributes, "customPillText", node);
    const label = this.literalString(attributes, "label", node);
    if (
      !known ||
      !type ||
      !["positive", "negative", "neutral"].includes(type)
    ) {
      this.diagnostic(
        "MDX_INVALID_LITERAL_ATTRIBUTE",
        "Selected MDX GuidanceCallout type must be positive, negative, or neutral.",
        node,
      );
      return null;
    }
    return {
      kind: "guidance_callout",
      tone: type as "positive" | "negative" | "neutral",
      label: customLabel ?? label,
      blocks: this.blocks(node.children ?? []),
    };
  }

  private diagrams(node: MdxNode): DocumentBlock | null {
    const attributes = this.attributes(node);
    if (!attributes) return null;
    if (!this.onlyKnownAttributes(attributes, [], node)) return null;
    const items: Array<Extract<DocumentBlock, { kind: "diagram" }>> = [];
    for (const child of node.children ?? []) {
      if (child.type === "text" && !child.value?.trim()) continue;
      if (child.type === "mdxJsxFlowElement" && child.name === "Diagram") {
        const diagram = this.diagram(child);
        if (diagram) items.push(diagram);
        continue;
      }
      this.diagnostic(
        "MDX_UNSUPPORTED_FLOW_NODE",
        "Selected MDX Diagrams may contain only Diagram children.",
        child,
      );
    }
    return { kind: "diagram_group", label: null, items };
  }

  blocks(nodes: readonly MdxNode[]): DocumentBlock[] {
    const result: DocumentBlock[] = [];
    for (const node of nodes) {
      switch (node.type) {
        case "text":
          if (node.value?.trim()) {
            result.push(
              this.unsupported(
                "MDX_UNSUPPORTED_FLOW_NODE",
                "Selected MDX contains unsupported flow text.",
                node,
              ),
            );
          }
          break;
        case "paragraph":
          result.push({
            kind: "paragraph",
            children: this.inline(node.children ?? []),
          });
          break;
        case "heading":
          result.push({
            kind: "heading",
            level: node.depth ?? 1,
            children: this.inline(node.children ?? []),
          });
          break;
        case "list":
          result.push({
            kind: "list",
            ordered: node.ordered === true,
            start: node.ordered === true ? (node.start ?? 1) : null,
            spread: node.spread === true,
            items: (node.children ?? []).map((item) =>
              this.blocks(item.children ?? []),
            ),
          });
          break;
        case "code":
          result.push({
            kind: "code",
            language: node.lang ?? null,
            meta: node.meta ?? null,
            value: node.value ?? "",
          });
          break;
        case "mdxJsxFlowElement": {
          const converted =
            node.name === "GuidanceCallout"
              ? this.guidanceCallout(node)
              : node.name === "Diagram"
                ? this.diagram(node)
                : node.name === "Diagrams"
                  ? this.diagrams(node)
                  : node.name === "LivePreview"
                    ? this.livePreview(node)
                    : node.name === "ImageSwitcher"
                      ? this.imageSwitcher(node)
                      : null;
          if (converted) {
            result.push(converted);
          } else if (
            node.name === "GuidanceCallout" ||
            node.name === "Diagram" ||
            node.name === "Diagrams" ||
            node.name === "LivePreview" ||
            node.name === "ImageSwitcher"
          ) {
            result.push({
              kind: "unsupported",
              diagnostic_id: this.lastDiagnosticId,
            });
          } else {
            result.push(
              this.unsupported(
                "MDX_UNSUPPORTED_COMPONENT",
                `Unsupported selected MDX component <${node.name ?? "unknown"}>.`,
                node,
              ),
            );
          }
          break;
        }
        case "mdxFlowExpression":
          if (!isMdxComment(node)) {
            result.push(
              this.unsupported(
                "MDX_EXPRESSION_INERT",
                "MDX expressions are inert and cannot supply selected guidance.",
                node,
              ),
            );
          }
          break;
        case "mdxjsEsm":
          result.push(
            this.unsupported(
              "MDX_RUNTIME_CODE_INERT",
              "MDX ESM is inert and cannot supply selected guidance.",
              node,
            ),
          );
          break;
        default:
          result.push(
            this.unsupported(
              "MDX_UNSUPPORTED_FLOW_NODE",
              `Unsupported selected MDX flow node '${node.type}'.`,
              node,
            ),
          );
      }
    }
    return result;
  }
}

function parseLiteralImages(
  value: string,
): Array<{ src: string; alt: string }> | null {
  try {
    const expression = parseExpression(value, {
      sourceType: "module",
    }) as unknown as {
      type?: string;
      elements?: Array<{
        type?: string;
        properties?: Array<{
          type?: string;
          computed?: boolean;
          key?: { type?: string; name?: string; value?: string };
          value?: { type?: string; value?: string };
        }>;
      } | null>;
    };
    if (expression.type !== "ArrayExpression") return null;
    const images: Array<{ src: string; alt: string }> = [];
    for (const element of expression.elements ?? []) {
      if (!element || element.type !== "ObjectExpression") return null;
      const values = new Map<string, string>();
      for (const property of element.properties ?? []) {
        if (
          property.type !== "ObjectProperty" ||
          property.computed === true ||
          property.value?.type !== "StringLiteral"
        ) {
          return null;
        }
        const key =
          property.key?.type === "Identifier"
            ? property.key.name
            : property.key?.type === "StringLiteral"
              ? property.key.value
              : undefined;
        if (
          !key ||
          values.has(key) ||
          typeof property.value.value !== "string"
        ) {
          return null;
        }
        values.set(key, property.value.value);
      }
      const src = values.get("src");
      const alt = values.get("alt");
      if (!src || alt === undefined || values.size !== 2) return null;
      images.push({ src, alt });
    }
    return images;
  } catch {
    return null;
  }
}

function selectedPurposeId(
  section: SourceSection,
  identifiers: ReadonlyMap<SourceSection, string>,
): string {
  let current: SourceSection | null = section;
  while (current) {
    if (current.level === 2 && identifiers.has(current)) {
      return identifiers.get(current)!;
    }
    current = current.parent;
  }
  return identifiers.get(section)!;
}

export function parseSelectedMdxDocument(
  input: ParseSelectedMdxDocumentInput,
): DocumentModel {
  const diagnostics: DocumentModel["diagnostics"] = [];
  let tree: MdxNode;
  try {
    tree = unified()
      .use(resolveRemarkPlugin(remarkParse) as never)
      .use(resolveRemarkPlugin(remarkGfm) as never)
      .use(resolveRemarkPlugin(remarkMdx) as never)
      .parse(input.mdx) as MdxNode;
  } catch (error) {
    diagnostics.push({
      code: "MDX_PARSE_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Could not parse selected MDX.",
      section_id: null,
      range: defaultRange(),
    });
    return {
      contract: "salt-document/1",
      source: input.source,
      sections: [],
      diagnostics,
    };
  }

  const root = sectionsFromTree(tree);
  const candidates = allSections(root);
  const selected = new Map<SourceSection, SelectedMdxSectionSelector | null>();
  for (const selector of input.selectors) {
    const matches = candidates.filter(
      (section) =>
        headingPathKey(section.heading_path) ===
        headingPathKey(selector.heading_path),
    );
    if (matches.length === 0) {
      diagnostics.push({
        code: "MDX_SELECTED_SECTION_MISSING",
        message: `Selected MDX section '${selector.heading_path.join(" > ") || "overview"}' is missing.`,
        section_id: selector.id,
        range: defaultRange(),
      });
      continue;
    }
    if (matches.length > 1) {
      diagnostics.push({
        code: "MDX_DUPLICATE_SELECTED_SECTION",
        message: `Selected MDX section '${selector.heading_path.join(" > ") || "overview"}' is ambiguous.`,
        section_id: selector.id,
        range: rangeFor(matches[1]?.heading),
      });
      continue;
    }
    const match = matches[0];
    if (selected.has(match)) {
      diagnostics.push({
        code: "MDX_DUPLICATE_SELECTED_SECTION",
        message: `Selected MDX section '${selector.id}' overlaps another explicit selector.`,
        section_id: selector.id,
        range: match.range,
      });
      continue;
    }
    selected.set(match, selector);
    if (selector.include_descendants) {
      for (const candidate of candidates) {
        if (isDescendantOf(candidate, match)) selected.set(candidate, null);
      }
    }
  }

  const selectedSections = candidates.filter((section) =>
    selected.has(section),
  );
  const identifiers = new Map<SourceSection, string>();
  for (const section of selectedSections) {
    const selector = selected.get(section);
    if (selector) {
      identifiers.set(section, selector.id);
      continue;
    }
    let parent = section.parent;
    while (parent && !identifiers.has(parent)) parent = parent.parent;
    const parentId = parent ? identifiers.get(parent) : undefined;
    identifiers.set(
      section,
      parentId
        ? `${parentId}.${slugSegment(section.heading_path.at(-1) ?? "section")}`
        : slugSegment(section.heading_path.at(-1) ?? "overview"),
    );
  }

  const output: DocumentSection[] = selectedSections.map((section) => {
    const id = identifiers.get(section)!;
    const converter = new SectionConverter(
      diagnostics,
      id,
      selectedPurposeId(section, identifiers),
    );
    return {
      id,
      heading_path: [...section.heading_path],
      heading: section.heading
        ? converter.inline(section.heading.children ?? [])
        : null,
      level: section.level,
      blocks: converter.blocks(section.nodes),
    };
  });

  return {
    contract: "salt-document/1",
    source: input.source,
    sections: output,
    diagnostics,
  };
}

export function hasSelectedMdxErrors(document: DocumentModel): boolean {
  return document.diagnostics.length > 0;
}
