import { forwardRef, ElementType, ReactElement } from "react";
import cx from "classnames";
import { GridItem, GridItemProps } from "../GridItem";
import "./BorderItem.css";
import {
  makePrefixer,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from "../../utils";

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
       * Position in the border layout
       */
      position: BorderPosition;
      /**
       * Defines if the item should stick to the edges of its container. Defaults to "false"
       */
      sticky?: boolean;
    }
  >;

const withBaseName = makePrefixer("uitkBorderItem");

type BorderItemComponent = <T extends ElementType = "div">(
  props: BorderItemProps<T>
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
    ref?: PolymorphicRef<T>
  ) => {
    const gridItemStyles = {
      ...style,
      "--gridItem-gridArea": position,
    };

    return (
      <GridItem
        ref={ref}
        className={cx(withBaseName(), className, "uitkGridItem-area", {
          [withBaseName("sticky")]: sticky,
        })}
        style={gridItemStyles}
        {...rest}
      >
        {children}
      </GridItem>
    );
  }
);
