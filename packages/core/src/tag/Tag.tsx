import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import tagCss from "./Tag.css";

const withBaseName = makePrefixer("saltTag");

export interface TagProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Styling variant with full border. Defaults to false
   */
  bordered?: boolean;
  /**
   * Emphasize the styling by applying a background color. Defaults to primary
   */
  variant?: "primary" | "secondary";
  /**
   * The tag category, needs to be within range of 1-20. Defaults to 1
   */
  category?: number;
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(function Tag(
  { children, className, variant = "primary", category = 1, bordered, ...rest },
  ref,
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
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
