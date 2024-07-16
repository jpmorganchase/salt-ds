export const ActionFontValues = ["Open Sans", "Amplitude"] as const;
/** @deprecated use `ActionFontValues` */
export const UNSTABLE_ActionFontValues = ActionFontValues;

export type ActionFont = (typeof ActionFontValues)[number];
/** @deprecated use `ActionFont` */
export type UNSTABLE_ActionFont = ActionFont;
