export const HeadingFontValues = ["Open Sans", "Amplitude"] as const;
/** @deprecated use `HeadingFontValues` */
export const UNSTABLE_HeadingFontValues = HeadingFontValues;

export type HeadingFont = (typeof HeadingFontValues)[number];
/** @deprecated Use `HeadingFont` */
export type UNSTABLE_HeadingFont = HeadingFont;
