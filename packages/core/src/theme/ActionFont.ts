export const UNSTABLE_ActionFontValues = ["Open Sans", "Amplitude"] as const;

export type UNSTABLE_ActionFont = (typeof UNSTABLE_ActionFontValues)[number];
