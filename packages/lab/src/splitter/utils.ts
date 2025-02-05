import type { SplitHandleAccent } from "./SplitHandle";
import type { SplitterAppearance, SplitterOrientation } from "./Splitter";

export function computeAccent(
  orientation: SplitterOrientation,
  appearance: SplitterAppearance,
): SplitHandleAccent {
  if (appearance === "transparent") {
    return "none";
  }

  if (orientation === "horizontal") {
    return "left-right";
  }

  return "top-bottom";
}
