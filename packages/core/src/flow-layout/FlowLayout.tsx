import {
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
} from "react";
import { FlexLayout, type FlexLayoutProps } from "../flex-layout";
import type { PolymorphicComponentPropWithRef } from "../utils";

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
      /**
       * Defines the margin around the component. It can be specified as a number (which acts as a multiplier) or a string representing the margin value. Default is `0`.
       */
      margin?: FlexLayoutProps<ElementType>["margin"];
      /**
       * Defines the padding within the component. It can be specified as a number (which acts as a multiplier) or a string representing the padding value. Default is `0`.
       */
      padding?: FlexLayoutProps<ElementType>["padding"];
    }
  >;

type FlowLayoutComponent = <T extends ElementType = "div">(
  props: FlowLayoutProps<T>,
) => ReturnType<FunctionComponent>;

export const FlowLayout: FlowLayoutComponent = forwardRef(function FlowLayout<
  T extends ElementType = "div",
>({ as, children, ...rest }: FlowLayoutProps<T>, ref?: ForwardedRef<unknown>) {
  return (
    <FlexLayout as={as as ElementType} direction="row" ref={ref} wrap {...rest}>
      {children}
    </FlexLayout>
  );
});
