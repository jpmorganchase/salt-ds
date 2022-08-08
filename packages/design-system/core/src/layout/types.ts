export const LAYOUT_DIRECTION = ["row", "column"] as const;
export type LayoutDirection = typeof LAYOUT_DIRECTION[number];
export type LayoutSeparator = "start" | "center" | "end";
export type LayoutAnimation = "slide" | "fade";
export type LayoutAnimationDirection = "horizontal" | "vertical";
export type LayoutAnimationTransition = "increase" | "decrease";
