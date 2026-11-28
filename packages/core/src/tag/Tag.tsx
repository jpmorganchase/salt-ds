import {
  useComponentCssInjection,
  useComponentDefaults,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import tagCss from "./Tag.css";

const withBaseName = makePrefixer("saltTag");

export interface TagProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the tag has a full border.
   */
  bordered?: boolean;
  /**
   * Emphasizes the styling by applying a background color.
   * @default "primary"
   */
  variant?: "primary" | "secondary";
  /**
   * The tag category, from `1` to `20`.
   * @default 1
   */
  category?: number;
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  function Tag(props, ref) {
    const { props: propsWithDefaults, rootDataAttributes } =
      useComponentDefaults("saltTag", props);
    const {
      children,
      className,
      variant = "primary",
      category = 1,
      bordered,
      ...rest
    } = propsWithDefaults;

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
        {...rootDataAttributes}
      >
        {children}
      </div>
    );
  },
);
