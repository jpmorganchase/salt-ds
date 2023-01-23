import { forwardRef, ReactNode, ElementType, ReactElement } from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { FlexItem, FlexItemProps } from "../flex-item";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";

export interface SplitItemProps extends FlexItemProps<ElementType> {
  /**
   * A list of items. Required to have some children.
   */
  children: ReactNode;
}

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
       * Controls the space between items.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Content to be rendered inside left split item.
       */
      leftSplitItem: ReactNode;
      /**
       * The props to be passed to the left split wrapper.
       */
      leftSplitItemProps?: Partial<FlexItemProps<ElementType>>;
      /**
       * Content to be rendered inside right split item.
       */
      rightSplitItem: ReactNode;
      rightSplitItemProps?: Partial<FlexItemProps<ElementType>>;
    }
  >;

const SplitItem = forwardRef<HTMLDivElement, SplitItemProps>(function SplitItem(
  { children, ...rest },
  ref
) {
  return (
    <FlexItem {...rest} ref={ref}>
      {children}
    </FlexItem>
  );
});

type SplitLayoutComponent = <T extends ElementType = "div">(
  props: SplitLayoutProps<T>
) => ReactElement | null;

export const SplitLayout: SplitLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      align,
      leftSplitItem,
      leftSplitItemProps,
      rightSplitItem,
      rightSplitItemProps,
      wrap = true,
      gap,
      ...rest
    }: SplitLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    return (
      <FlexLayout
        align={align}
        direction="row"
        ref={ref}
        wrap={wrap}
        gap={gap}
        justify="space-between"
        {...rest}
      >
        <SplitItem {...leftSplitItemProps}>{leftSplitItem}</SplitItem>
        <SplitItem {...rightSplitItemProps}>{rightSplitItem}</SplitItem>
      </FlexLayout>
    );
  }
);
