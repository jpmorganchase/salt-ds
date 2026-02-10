export const DensityValues = [
  "high",
  "medium",
  "low",
  "touch",
  "mobile",
] as const;

export type Density = (typeof DensityValues)[number];
