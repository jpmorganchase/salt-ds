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
  emphasis?: "bold" | "subtle";
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(function Tag(
  { children, className, emphasis = "bold", bordered, ...rest },
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
        withBaseName(emphasis),
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
