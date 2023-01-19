import { ElementType, forwardRef, ReactElement } from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";

export type InlineLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * The minimum gap between the 2 sides of the layout.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Adds a separator between elements, default is false.
       */
      separators?: FlexLayoutProps<ElementType>["separators"];
    }
  >;

type InlineLayoutComponent = <T extends ElementType = "div">(
  props: InlineLayoutProps<T>
) => ReactElement | null;

export const InlineLayout: InlineLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    { children, ...rest }: InlineLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    return (
      <FlexLayout
        direction="row"
        ref={ref}
        wrap={false}
        justify="space-between"
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
