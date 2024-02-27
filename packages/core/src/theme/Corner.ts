export const UNSTABLE_CornerValues = ["sharp", "rounded"] as const;

export type UNSTABLE_Corner = (typeof UNSTABLE_CornerValues)[number];
