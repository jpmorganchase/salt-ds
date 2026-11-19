import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
} from "react";
import { GridItem, type GridItemProps } from "../grid-item";
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type ResponsiveProp,
} from "../utils";
import borderItemCss from "./BorderItem.css";

export const BORDER_POSITION = [
  "north",
  "west",
  "center",
  "east",
  "south",
] as const;

export type BorderPosition = (typeof BORDER_POSITION)[number];

export type BorderItemProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Aligns a grid item inside a cell along the inline (row) axis.
       * @default "stretch"
       */
      horizontalAlignment?: GridItemProps<T>["horizontalAlignment"];
      /**
       * Aligns a grid item inside a cell along the block (column) axis.
       * @default "stretch"
       */
      verticalAlignment?: GridItemProps<T>["verticalAlignment"];
      /**
       * Position in the Border Layout.
       */
      position: BorderPosition;
      /**
       * If `true`, the item sticks to the edges of its container.
       */
      sticky?: boolean;
      /**
       * Defines the margin around the component. It can be specified as a number (which acts as a multiplier) or a string representing the margin value.
       * @default 0
       */
      margin?: ResponsiveProp<number | string>;
      /**
       * Defines the padding within the component. It can be specified as a number (which acts as a multiplier) or a string representing the padding value.
       * @default 0
       */
      padding?: ResponsiveProp<number | string>;
    }
  >;

const withBaseName = makePrefixer("saltBorderItem");

type BorderItemComponent = <T extends ElementType = "div">(
  props: BorderItemProps<T>,
) => ReturnType<FunctionComponent>;

export const BorderItem: BorderItemComponent = forwardRef(function BorderItem<
  T extends ElementType,
>(props: unknown, ref?: ForwardedRef<unknown>) {
  // Props need to be typed this way due to polymorphic types not working with required props.
  const {
    as,
    children,
    className,
    position,
    sticky = false,
    style,
    ...rest
  } = props as BorderItemProps<T>;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-border-item",
    css: borderItemCss,
    window: targetWindow,
  });

  const gridItemStyles = {
    ...style,
    "--gridItem-gridArea": position,
  };

  return (
    <GridItem
      as={as as ElementType}
      ref={ref}
      className={clsx(
        withBaseName(),
        "saltGridItem-area",
        {
          [withBaseName("sticky")]: sticky,
        },
        className,
      )}
      style={gridItemStyles}
      {...rest}
    >
      {children}
    </GridItem>
  );
});
