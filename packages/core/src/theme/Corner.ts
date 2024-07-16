export const CornerValues = ["sharp", "rounded"] as const;
/** @deprecated use `CornerValues` */
export const UNSTABLE_CornerValues = CornerValues;

export type Corner = (typeof CornerValues)[number];
/** @deprecated Use `Corner` */
export type UNSTABLE_Corner = Corner;
