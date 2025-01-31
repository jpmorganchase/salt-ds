import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ElementType, type ReactElement, forwardRef } from "react";
import { GridItem, type GridItemProps } from "../grid-item";
import {
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  makePrefixer,
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
       * Aligns a grid item inside a cell along the inline (row) axis. Defaults to "stretch"
       */
      horizontalAlignment?: GridItemProps<T>["horizontalAlignment"];
      /**
       * Aligns a grid item inside a cell along the block (column) axis. Defaults to "stretch"
       */
      verticalAlignment?: GridItemProps<T>["verticalAlignment"];
      /**
       * Position in the Border Layout
       */
      position: BorderPosition;
      /**
       * Defines if the item should stick to the edges of its container. Defaults to "false"
       */
      sticky?: boolean;
      /**
       * Defines the margin around the component. It can be specified as a number (which acts as a multiplier) or a string representing the margin value. Default is `0`.
       */
      margin?: ResponsiveProp<number | string>;
      /**
       * Defines the padding within the component. It can be specified as a number (which acts as a multiplier) or a string representing the padding value. Default is `0`.
       */
      padding?: ResponsiveProp<number | string>;
    }
  >;

const withBaseName = makePrefixer("saltBorderItem");

type BorderItemComponent = <T extends ElementType = "div">(
  props: BorderItemProps<T>,
) => ReactElement | null;

export const BorderItem: BorderItemComponent = forwardRef(
  <T extends ElementType>(
    {
      children,
      className,
      position,
      sticky = false,
      style,
      ...rest
    }: BorderItemProps<T>,
    ref?: PolymorphicRef<T>,
  ) => {
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
  },
);
