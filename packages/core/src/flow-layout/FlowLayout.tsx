import { ElementType, forwardRef, ReactNode } from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";

export type FlowLayoutProps<T extends ElementType> =
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
       * Defines the alignment along the main axis, default is "start"
       */
      justify?: FlexLayoutProps<ElementType>["justify"];
    }
  >;

type FlowLayoutComponent = <T extends ElementType = "div">(
  props: FlowLayoutProps<T>
) => ReactNode;

export const FlowLayout: FlowLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    { children, ...rest }: FlowLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    return (
      <FlexLayout direction="row" ref={ref} wrap {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
