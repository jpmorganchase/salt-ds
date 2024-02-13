export const UNSTABLE_CornerRadiusValues = ["sharp", "rounded"] as const;

export type UNSTABLE_CornerRadius =
  (typeof UNSTABLE_CornerRadiusValues)[number];
