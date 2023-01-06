import { ElementType, forwardRef, ReactElement } from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";

export type StackLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line, default is "stretch".
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Controls the space between items, default is 3.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Adds a separator between elements, default is false.
       */
      separators?: FlexLayoutProps<ElementType>["separators"];
    }
  >;

type StackLayoutComponent = <T extends ElementType = "div">(
  props: StackLayoutProps<T>
) => ReactElement | null;

export const StackLayout: StackLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    { children, ...rest }: StackLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    return (
      <FlexLayout direction="column" ref={ref} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
