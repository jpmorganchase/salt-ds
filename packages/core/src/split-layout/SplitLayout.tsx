import {
  ElementType,
  forwardRef,
  ReactElement,
  Children,
  useEffect,
} from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";

export type SplitLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Allow the items to wrap as needed, default is true.
       */
      wrap?: FlexLayoutProps<ElementType>["wrap"];
      /**
       * Controls the space between left and right items.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
    }
  >;

type SplitLayoutComponent = <T extends ElementType = "div">(
  props: SplitLayoutProps<T>
) => ReactElement | null;

export const SplitLayout: SplitLayoutComponent = forwardRef(
  <T extends ElementType>(
    { children, wrap = true, ...rest }: SplitLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const warnChildren = Children.toArray(children).length > 2;

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (warnChildren) {
          console.warn(
            "SplitLayout is recommended to work with no more than 2 children.\n"
          );
        }
      }
    }, [warnChildren]);
    return (
      <FlexLayout
        direction="row"
        ref={ref}
        wrap={wrap}
        justify="space-between"
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
