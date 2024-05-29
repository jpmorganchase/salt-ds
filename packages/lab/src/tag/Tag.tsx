import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";
import tagCss from "./Tag.css";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltTag");

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface TagProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Emphasize the styling by applying a background color: defaults to primary
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(function Tag(
  { children, className, variant = "primary", ...rest },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tag",
    css: tagCss,
    window: targetWindow,
  });

  return (
    <div
      ref={ref}
      className={clsx(withBaseName(), withBaseName(variant), className)}
      {...rest}
    >
      {children}
    </div>
  );
});
