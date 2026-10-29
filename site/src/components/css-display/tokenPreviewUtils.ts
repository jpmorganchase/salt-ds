import type { CSSProperties } from "react";

export type PreviewType =
  | "color"
  | "shadow"
  | "borderStyle"
  | "borderWidth"
  | "outline"
  | "raw";

type TokenProperty =
  | "background"
  | "borderColor"
  | "color"
  | "outline"
  | "outlineColor"
  | "shadow"
  | "borderStyle"
  | "outlineStyle"
  | "borderWidth"
  | "outlineWidth"
  | "fontFamily"
  | "fontWeight"
  | "other";

export function getPreviewType(name: string, value: string): PreviewType {
  const property = inferTokenProperty(name);

  switch (property) {
    case "background":
    case "borderColor":
    case "color":
    case "outlineColor":
      return isColorLikeValue(value) ? "color" : "raw";
    case "shadow":
      return isShadowValue(value) ? "shadow" : "raw";
    case "outline":
      return isOutlineValue(value) ? "outline" : "raw";
    case "borderStyle":
    case "outlineStyle":
      return isBorderStyleValue(value) ? "borderStyle" : "raw";
    case "borderWidth":
    case "outlineWidth":
      return isLengthValue(value) ? "borderWidth" : "raw";
    case "fontFamily":
    case "fontWeight":
      return "raw";
    default:
      if (isShadowValue(value)) {
        return "shadow";
      }

      if (isOutlineValue(value)) {
        return "outline";
      }

      if (isExplicitBorderStyleReference(value)) {
        return "borderStyle";
      }

      if (isColorLikeValue(value)) {
        return "color";
      }

      return "raw";
  }
}

export function getSwatchStyle(
  type: PreviewType,
  value: string,
): CSSProperties | undefined {
  switch (type) {
    case "color":
      return isGradientValue(value)
        ? ({ "--preview-background": value } as CSSProperties)
        : ({ "--preview-background-color": value } as CSSProperties);
    case "shadow":
      return { "--preview-box-shadow": value } as CSSProperties;
    case "borderStyle":
      return { "--preview-border-style": value } as CSSProperties;
    case "borderWidth":
      return { "--preview-border-width": value } as CSSProperties;
    case "outline":
      return { "--preview-outline": value } as CSSProperties;
    default:
      return undefined;
  }
}

export function isGradientValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("linear-gradient(") ||
    normalized.startsWith("radial-gradient(") ||
    normalized.startsWith("conic-gradient(") ||
    normalized.startsWith("repeating-linear-gradient(") ||
    normalized.startsWith("repeating-radial-gradient(") ||
    normalized.startsWith("repeating-conic-gradient(")
  );
}

function isBorderStyleValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    /^(solid|dashed|dotted|double|none)$/i.test(normalized) ||
    normalized.startsWith("var(--salt-borderstyle-")
  );
}

function isExplicitBorderStyleReference(value: string) {
  return value.trim().toLowerCase().startsWith("var(--salt-borderstyle-");
}

function isShadowValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("var(--salt-shadow-") ||
    normalized.includes("inset") ||
    /(-?\d+(\.\d+)?px\s+){2,}/.test(normalized)
  );
}

function isOutlineValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("var(--salt-focused-outline") ||
    normalized.startsWith("var(--salt-outline") ||
    normalized.includes("outline")
  );
}

function isColorLikeValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "transparent" ||
    isGradientValue(normalized) ||
    normalized.startsWith("#") ||
    normalized.startsWith("rgb(") ||
    normalized.startsWith("rgba(") ||
    normalized.startsWith("hsl(") ||
    normalized.startsWith("hsla(") ||
    normalized.startsWith("oklch(") ||
    normalized.startsWith("var(--salt-color-") ||
    normalized.startsWith("var(--salt-palette-")
  );
}

function isLengthValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    /^-?\d+(\.\d+)?px$/.test(normalized) ||
    /^var\(--salt-[a-z0-9-]+\)$/.test(normalized)
  );
}

function inferTokenProperty(name: string): TokenProperty {
  const normalized = name.toLowerCase();

  if (normalized.endsWith("-background")) {
    return "background";
  }
  if (normalized.endsWith("-bordercolor")) {
    return "borderColor";
  }
  if (normalized.endsWith("-color")) {
    return "color";
  }
  if (normalized.endsWith("-fontfamily")) {
    return "fontFamily";
  }
  if (normalized.endsWith("-fontweight")) {
    return "fontWeight";
  }
  if (normalized.endsWith("-outline")) {
    return "outline";
  }
  if (normalized.endsWith("-outlinecolor")) {
    return "outlineColor";
  }
  if (normalized.endsWith("-shadow")) {
    return "shadow";
  }
  if (normalized.endsWith("-borderstyle")) {
    return "borderStyle";
  }
  if (normalized.endsWith("-outlinestyle")) {
    return "outlineStyle";
  }
  if (normalized.endsWith("-borderwidth")) {
    return "borderWidth";
  }
  if (normalized.endsWith("-outlinewidth")) {
    return "outlineWidth";
  }

  return "other";
}
