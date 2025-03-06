import type { SplitHandleBorder } from "./SplitHandle";
import type { SplitterAppearance, SplitterOrientation } from "./Splitter";

export function computeAccent(
  appearance: SplitterAppearance,
  orientation: SplitterOrientation,
): SplitHandleBorder {
  if (appearance === "transparent") {
    return "none";
  }

  if (orientation === "horizontal") {
    return "top-bottom";
  }

  return "left-right";
}

export function computeVariant(
  appearance: SplitterAppearance,
): "primary" | "transparent" {
  return appearance === "bordered" ? "primary" : "transparent";
}
