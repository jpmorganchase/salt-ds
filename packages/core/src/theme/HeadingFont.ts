export const HeadingFontValues = ["Open Sans", "Amplitude"] as const;
/** @deprecated since 1.32.0. Use {@link HeadingFontValues}. */
export const UNSTABLE_HeadingFontValues = HeadingFontValues;

export type HeadingFont = (typeof HeadingFontValues)[number];
/** @deprecated since 1.32.0. Use {@link HeadingFont}. */
export type UNSTABLE_HeadingFont = HeadingFont;
