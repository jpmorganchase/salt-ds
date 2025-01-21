import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ElementType,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from "react";
import { FlexLayout, type FlexLayoutProps } from "../flex-layout";
import {
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  makePrefixer, type ResponsiveProp,
} from "../utils";
import splitLayoutCss from "./SplitLayout.css";

const withBaseName = makePrefixer("saltSplitLayout");

export type SplitLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line; default is `stretch`.
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Establishes the main-axis, defining the direction children are placed; default is `row`.
       */
      direction?: FlexLayoutProps<ElementType>["direction"];
      /**
       * End component to be rendered.
       */
      endItem?: ReactNode;
      /**
       * Controls the space between items; default is `3`.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Start component to be rendered.
       */
      startItem?: ReactNode;
      /**
       * Defines the margin around the component as a number (which acts as a multiplier) or a string representing the margin value; default is `0`.
       */
      margin?: ResponsiveProp<number | string>;
      /**
       * Defines the padding within the component as a number (which acts as a multiplier) or a string representing the padding value; default is `0`.
       */
      padding?: ResponsiveProp<number | string>;
    }
  >;

type SplitLayoutComponent = <T extends ElementType = "div">(
  props: SplitLayoutProps<T>,
) => ReactElement | null;

export const SplitLayout: SplitLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    { endItem, startItem, className, ...rest }: SplitLayoutProps<T>,
    ref?: PolymorphicRef<T>,
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-split-layout",
      css: splitLayoutCss,
      window: targetWindow,
    });

    const justify = endItem && !startItem ? "end" : "space-between";
    return (
      <FlexLayout
        className={clsx(withBaseName(), className)}
        ref={ref}
        justify={justify}
        {...rest}
      >
        {startItem}
        {endItem}
      </FlexLayout>
    );
  },
);
