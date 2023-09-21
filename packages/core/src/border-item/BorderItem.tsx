import { forwardRef, ElementType, ReactNode } from "react";
import { clsx } from "clsx";
import { GridItem, GridItemProps } from "../grid-item";
import borderItemCss from "./BorderItem.css";
import {
  makePrefixer,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export const BORDER_POSITION = [
  "north",
  "west",
  "center",
  "east",
  "south",
] as const;

export type BorderPosition = typeof BORDER_POSITION[number];

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
    }
  >;

const withBaseName = makePrefixer("saltBorderItem");

type BorderItemComponent = <T extends ElementType = "div">(
  props: BorderItemProps<T>
) => ReactNode;

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
    ref?: PolymorphicRef<T>
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
          className
        )}
        style={gridItemStyles}
        {...rest}
      >
        {children}
      </GridItem>
    );
  }
);
