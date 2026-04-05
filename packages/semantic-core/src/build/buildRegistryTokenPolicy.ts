import type { TokenRecord } from "../types.js";
import { uniqueStrings } from "./buildRegistryShared.js";

const DESIGN_TOKENS_DOC = "/salt/themes/design-tokens/index";
const FOUNDATIONS_INDEX_DOC = "/salt/foundations/index";

const CHARACTERISTIC_DOC_BY_CATEGORY: Record<string, string> = {
  accent: "/salt/themes/design-tokens/brand",
  actionable: "/salt/themes/design-tokens/actionable-characteristic",
  category: "/salt/themes/design-tokens/category-characteristic",
  container: "/salt/themes/design-tokens/container-characteristic",
  content: "/salt/themes/design-tokens/content-characteristic",
  editable: "/salt/themes/design-tokens/editable-characteristic",
  focused: "/salt/themes/design-tokens/how-to-read-tokens",
  navigable: "/salt/themes/design-tokens/navigable-characteristic",
  overlayable: "/salt/themes/design-tokens/overlayable-characteristic",
  selectable: "/salt/themes/design-tokens/selectable-characteristic",
  sentiment: "/salt/themes/design-tokens/sentiment-characteristic",
  separable: "/salt/themes/design-tokens/separable-characteristic",
  status: "/salt/themes/design-tokens/status-characteristic",
  target: "/salt/themes/design-tokens/container-characteristic",
  text: "/salt/themes/design-tokens/how-to-read-tokens",
};

const FOUNDATION_DOC_BY_CATEGORY: Record<string, string> = {
  alpha: FOUNDATIONS_INDEX_DOC,
  animation: FOUNDATIONS_INDEX_DOC,
  borderstyle: "/salt/foundations/borderStyle",
  color: "/salt/foundations/color/index",
  cursor: "/salt/foundations/cursor",
  curve: FOUNDATIONS_INDEX_DOC,
  duration: "/salt/foundations/duration",
  size: "/salt/foundations/size",
  spacing: "/salt/foundations/spacing",
  typography: "/salt/foundations/typography",
  zindex: "/salt/foundations/elevation/z-index",
};

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

function withDocs(...docs: Array<string | null | undefined>): string[] {
  return uniqueStrings(docs.filter((value): value is string => Boolean(value)));
}

function buildPalettePolicy(): NonNullable<TokenRecord["policy"]> {
  return {
    usage_tier: "palette",
    direct_component_use: "never",
    preferred_for: [
      "internal theme and mode mapping inside the Salt token system",
    ],
    avoid_for: [
      "direct component styling",
      "pattern styling",
      "custom UI color selection",
    ],
    notes: [
      "Palette tokens sit between foundations and characteristics and should not be referenced directly in components or patterns.",
      "Choose a semantic characteristic token instead of applying a palette token to UI code.",
    ],
    docs: withDocs(DESIGN_TOKENS_DOC),
    structural_roles: [],
    pairing: null,
  };
}

function buildCharacteristicPolicy(
  tokenName: string,
  category: string,
): NonNullable<TokenRecord["policy"]> {
  const characteristicDoc =
    CHARACTERISTIC_DOC_BY_CATEGORY[category] ??
    "/salt/themes/design-tokens/how-to-read-tokens";
  const preferredFor = ["semantic component styling", "pattern styling"];
  const avoidFor = ["choosing by visual similarity alone"];
  const notes = [
    "Use characteristic tokens directly in components and patterns, choosing by semantic intent rather than by appearance.",
  ];

  if (category === "content") {
    preferredFor.push(
      "text foreground",
      "icon foreground",
      "default static foreground",
    );
    notes.unshift(
      "Use content tokens for standard text and icon foregrounds unless another characteristic takes precedence.",
    );
  } else if (category === "container") {
    preferredFor.push("surface backgrounds", "container border colors");
    avoidFor.push("mixing container background and border levels");
    notes.unshift(
      "Pair container background and border tokens from the same level to keep surfaces visually coherent.",
    );
  } else if (category === "separable") {
    preferredFor.push("divider colors", "separator colors");
    avoidFor.push("borrowing container or content colors for separators");
    notes.unshift(
      "Use separable tokens to divide sections and groups rather than reusing unrelated border colors.",
    );
  } else if (category === "navigable") {
    preferredFor.push(
      "navigation states",
      "navigation indicators",
      "navigation emphasis",
    );
  } else if (category === "actionable") {
    preferredFor.push("action control states", "action affordances");
  } else if (category === "selectable") {
    preferredFor.push("selection states", "selectable controls");
  } else if (category === "editable") {
    preferredFor.push("editable field states", "input control styling");
  } else if (category === "status") {
    preferredFor.push(
      "error states",
      "warning states",
      "success states",
      "informational states",
    );
  } else if (category === "sentiment") {
    preferredFor.push("tone and emotional emphasis");
  } else if (category === "target") {
    preferredFor.push("drop target feedback");
  } else if (category === "overlayable") {
    preferredFor.push("shadow", "scrim", "overlay styling");
  } else if (category === "text") {
    preferredFor.push("typographic styling");
  }

  let structuralRoles: string[] = [];
  let pairing: NonNullable<TokenRecord["policy"]>["pairing"] = null;

  if (category === "container") {
    const containerMatch = tokenName.match(
      /^--salt-container-([a-z0-9]+)-(background|borderColor)(?:-|$)/i,
    );

    if (containerMatch) {
      const level = containerMatch[1]?.toLowerCase() ?? null;
      const role =
        containerMatch[2] === "background"
          ? "container-background"
          : "container-border-color";

      structuralRoles = [role];
      pairing = {
        family: "container",
        role,
        level,
      };
    }
  } else if (category === "separable") {
    if (/bordercolor/i.test(tokenName)) {
      structuralRoles = ["separator-color"];
    } else if (/background/i.test(tokenName)) {
      structuralRoles = ["separator-feedback-background"];
    } else if (/foreground/i.test(tokenName)) {
      structuralRoles = ["separator-feedback-foreground"];
    }
  }

  return {
    usage_tier: "characteristic",
    direct_component_use: "always",
    preferred_for: preferredFor,
    avoid_for: avoidFor,
    notes,
    docs: withDocs(characteristicDoc, DESIGN_TOKENS_DOC),
    structural_roles: structuralRoles,
    pairing,
  };
}

function buildFoundationPolicy(
  tokenName: string,
  category: string,
): NonNullable<TokenRecord["policy"]> {
  const foundationDoc =
    FOUNDATION_DOC_BY_CATEGORY[category] ?? FOUNDATIONS_INDEX_DOC;
  const preferredFor = ["low-level structural styling"];
  const avoidFor = [
    "semantic component styling when a characteristic token fits",
  ];
  const notes = [
    "Foundation tokens are low-level primitives. Use them directly for structural values, not as a substitute for semantic characteristic tokens.",
  ];

  if (category === "size") {
    preferredFor.push("structural sizing", "component dimensions");
    notes.push(
      "Use density-responsive size tokens by default and reserve fixed-size tokens for dimensions that must remain constant.",
    );

    if (tokenName.includes("--salt-size-fixed-")) {
      preferredFor.push(
        "border thickness",
        "separator thickness",
        "constant dimensions across densities",
      );
      notes.unshift(
        "Fixed size tokens remain constant across densities and are the correct choice for border and separator thickness.",
      );
    }
    if (tokenName.includes("--salt-size-indicator")) {
      preferredFor.push("indicator thickness");
    }
    if (tokenName.includes("--salt-size-bar")) {
      preferredFor.push("track thickness", "accent bar thickness");
    }
  } else if (category === "spacing") {
    preferredFor.push("padding", "layout gaps", "spatial separation");
    if (tokenName.includes("--salt-spacing-fixed-")) {
      preferredFor.push("constant spacing across densities");
      notes.unshift(
        "Fixed spacing tokens are only for spacing that must stay constant across densities; otherwise prefer responsive spacing tokens.",
      );
    }
  } else if (category === "borderstyle") {
    preferredFor.push("border style", "separator style");
    notes.unshift(
      "Use border style foundations for line style. Solid is the standard baseline; dashed is reserved for special cases such as drop targets.",
    );
  } else if (category === "color") {
    preferredFor.push(
      "low-level color infrastructure",
      "cases without a semantic characteristic equivalent",
    );
    avoidFor.push("direct semantic UI color decisions");
    notes.unshift(
      "Color foundation tokens are raw values. Prefer characteristic tokens when styling component or pattern states semantically.",
    );
  } else if (category === "typography") {
    preferredFor.push(
      "type scale",
      "font family",
      "font weight",
      "text metrics",
    );
  } else if (category === "duration") {
    preferredFor.push("motion duration");
  } else if (category === "cursor") {
    preferredFor.push("cursor behavior");
  } else if (category === "zindex") {
    preferredFor.push("layer ordering");
  }

  let structuralRoles: string[] = [];

  if (category === "size" && tokenName.includes("--salt-size-fixed-")) {
    structuralRoles = ["border-thickness", "separator-thickness"];
  } else if (category === "borderstyle") {
    if (tokenName === "--salt-borderStyle-solid") {
      structuralRoles = ["border-style-default", "separator-style-default"];
    } else if (tokenName === "--salt-borderStyle-dashed") {
      structuralRoles = ["drop-target-border-style"];
    } else if (tokenName === "--salt-borderStyle-dotted") {
      structuralRoles = ["temporary-border-style"];
    }
  }

  return {
    usage_tier: "foundation",
    direct_component_use: "conditional",
    preferred_for: preferredFor,
    avoid_for: avoidFor,
    notes,
    docs: withDocs(foundationDoc, DESIGN_TOKENS_DOC),
    structural_roles: structuralRoles,
    pairing: null,
  };
}

export function getTokenPolicy(
  token: Pick<TokenRecord, "name" | "category">,
): NonNullable<TokenRecord["policy"]> | null {
  const category = normalizeCategory(token.category);

  if (token.name.startsWith("--salt-palette-") || category === "palette") {
    return buildPalettePolicy();
  }

  if (Object.hasOwn(CHARACTERISTIC_DOC_BY_CATEGORY, category)) {
    return buildCharacteristicPolicy(token.name, category);
  }

  if (Object.hasOwn(FOUNDATION_DOC_BY_CATEGORY, category)) {
    return buildFoundationPolicy(token.name, category);
  }

  return null;
}
