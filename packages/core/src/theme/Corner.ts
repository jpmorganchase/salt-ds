export const CornerValues = ["sharp", "rounded"] as const;
/** @deprecated since 1.32.0. Use `CornerValues`. */
export const UNSTABLE_CornerValues = CornerValues;

export type Corner = (typeof CornerValues)[number];
/** @deprecated since 1.32.0. Use `Corner`. */
export type UNSTABLE_Corner = Corner;
