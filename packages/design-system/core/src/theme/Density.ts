export const DensityValues = ["high", "medium", "low", "touch"] as const;

export type Density = typeof DensityValues[number];
