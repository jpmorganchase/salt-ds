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
  makePrefixer,
} from "../utils";
import splitLayoutCss from "./SplitLayout.css";

const withBaseName = makePrefixer("saltSplitLayout");

export type SplitLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Establishes the main-axis, defining the direction children are placed. Default is "row".
       */
      direction?: FlexLayoutProps<ElementType>["direction"];
      /**
       * End component to be rendered.
       */
      endItem?: ReactNode;
      /**
       * Controls the space between left and right items.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Start component to be rendered.
       */
      startItem?: ReactNode;
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
