export const ModeValues = ["light", "dark"] as const;

export type Mode = (typeof ModeValues)[number];
