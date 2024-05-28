export const UNSTABLE_AccentValues = ["blue", "teal"] as const;

export type UNSTABLE_Accent = (typeof UNSTABLE_AccentValues)[number];
