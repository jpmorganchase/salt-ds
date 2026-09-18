export const ActionFontValues = ["Open Sans", "Amplitude"] as const;
/** @deprecated since 1.32.0. Use {@link ActionFontValues}. */
export const UNSTABLE_ActionFontValues = ActionFontValues;

export type ActionFont = (typeof ActionFontValues)[number];
/** @deprecated since 1.32.0. Use {@link ActionFont}. */
export type UNSTABLE_ActionFont = ActionFont;
