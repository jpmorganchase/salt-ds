import {
  Button,
  type ButtonProps,
  capitalize,
  makePrefixer,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, useContext } from "react";
import { ButtonBarContext } from "./internal/ButtonBarContext";
import { useDescendant } from "./internal/useDescendant";

import orderedButtonCss from "./OrderedButton.css";

export interface OrderedButtonProps extends ButtonProps {
  /**
   * Aligns the button (and any buttons before/after) it on the left/right
   * of the container
   */
  align?: "left" | "right";
  /**
   * The order the button will be rendered when NOT stacked and the button bar is aligned left order.
   * Buttons are ordered in descending order by default and then by their source order.
   * This defaults to 1 for `CTA`, 2 for `regular` and 0 for `secondary`
   */
  alignLeftOrder?: number;
  /**
   * The className(s) of the component
   */
  className?: string;
  /**
   * The order the button will be rendered when NOT stacked. Buttons are ordered
   * in descending order by default and then by their source order.
   * This defaults to 0 for `CTA`, 1 for `regular` and 2 for `secondary`
   */
  order?: number;
  /**
   * The order the button will be rendered when stacked. Buttons are ordered
   * in descending order by default and then by their source order.
   * This defaults to 2 for `CTA`, 1 for `regular` and 0 for `secondary`
   */
  stackOrder?: number;
}

const withBasename = makePrefixer("saltOrderedButton");

export const OrderedButton = forwardRef<HTMLButtonElement, OrderedButtonProps>(
  function OrderedButton(
    {
      className,
      align: alignProp,
      order,
      alignLeftOrder,
      stackOrder,
      variant,
      ...restProps
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-ordered-button",
      css: orderedButtonCss,
      window: targetWindow,
    });

    const index = useDescendant({ order, stackOrder, alignLeftOrder, variant });
    const {
      matches,
      align: alignContext,
      alignedIndex,
    } = useContext(ButtonBarContext);

    const alignFromParent = index === alignedIndex ? alignContext : undefined;
    const align = alignProp || alignFromParent;

    return (
      <Button
        className={clsx(
          withBasename(),
          {
            [withBasename(`align${align ? capitalize(align) : ""}`)]:
              align && !matches,
            [withBasename("stacked")]: matches,
          },
          className,
        )}
        ref={ref}
        variant={variant}
        {...restProps}
      />
    );
  },
);
