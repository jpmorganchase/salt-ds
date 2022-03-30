export const GRID_ALIGNMENT_BASE = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

export type GridAlignment = typeof GRID_ALIGNMENT_BASE[number];

export type GridProperty = number | "auto";

export type AnimationsDirection = "horizontal" | "vertical";
