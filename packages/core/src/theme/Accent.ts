export const AccentValues = ["blue", "teal"] as const;
/** @deprecated since 1.32.0. Use `AccentValues`. */
export const UNSTABLE_AccentValues = AccentValues;

export type Accent = (typeof AccentValues)[number];
/** @deprecated since 1.32.0. Use `Accent`. */
export type UNSTABLE_Accent = Accent;
