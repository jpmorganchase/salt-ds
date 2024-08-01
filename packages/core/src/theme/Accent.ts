export const AccentValues = ["blue", "teal"] as const;
/** @deprecated use `AccentValues` */
export const UNSTABLE_AccentValues = AccentValues;

export type Accent = (typeof AccentValues)[number];
/** @deprecated use `Accent` */
export type UNSTABLE_Accent = Accent;
