import React, { HTMLAttributes, ReactNode } from "react";

export type FormLabelNecessity = "optional" | "required";
// export type FormLabelNecessityStyle = 'full' | 'abbreviated';

export interface NecessityIndicatorOptions {
  /**
   * The FormField is required
   */
  required?: boolean;
  /**
   * Whether to show a label adornment for required or optional
   */
  displayedNecessity?: FormLabelNecessity;
  // This API is removed as this is not flexible enough.
  // User could always use `necessityText` to display more customized text, e.g. in other language.
  // necessityStyle?: FormLabelNecessityStyle;
  /**
   * Customize text displayed for necessity. Default to `(Required)` or `(Optional)`.
   */
  necessityText?: ReactNode;
  className?: string;
}

export const NecessityIndicator = ({
  required,
  children,
  necessityText: necessityTextProp = children,
  displayedNecessity,
  className,
  ...restProps
}: NecessityIndicatorOptions & HTMLAttributes<HTMLSpanElement>) => {
  let necessityText: ReactNode = "";

  if (necessityTextProp) {
    necessityText = necessityTextProp;
  } else {
    if (required && displayedNecessity === "required") {
      necessityText = `(Required)`;
    } else if (!required && displayedNecessity === "optional") {
      necessityText = `(Optional)`;
    }
  }

  if (necessityText) {
    return (
      <span
        className={className}
        data-testid="necessity-indicator"
        {...restProps}
      >
        {necessityText}
      </span>
    );
  }
  return null;
};
