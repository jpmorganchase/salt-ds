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
   * Styling variant with full border. Defaults to false
   */
  bordered?: boolean;
  /**
   * Emphasize the styling by applying a background color: defaults to bold
   */
  variant?: "primary" | "secondary";
  /**
   * The tag category. Defaults to 1
   */
  category?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20;
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(function Tag(
  { children, className, variant = "primary", category = 1, bordered, ...rest },
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
      className={clsx(
        withBaseName(),
        withBaseName(`category-${category}`),
        withBaseName(variant),
        {
          [withBaseName("bordered")]: bordered,
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
