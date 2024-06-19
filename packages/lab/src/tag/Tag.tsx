import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";
import tagCss from "./Tag.css";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltTag");

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;
type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

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
   * The tag category. Defaults to 1
   */
  category?: Range<1, 20>;
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
