import { forwardRef, HTMLAttributes, ComponentPropsWithoutRef } from "react";
import cx from "classnames";
import { GridItem } from "../GridItem";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./BorderItem.css";

export const BORDER_POSITION = [
  "header",
  "left",
  "main",
  "right",
  "bottom",
] as const;

export type BorderPosition = typeof BORDER_POSITION[number];

type GridItemProps = ComponentPropsWithoutRef<typeof GridItem>;

export interface BorderItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Aligns a grid item inside a cell along the inline (row) axis. Defaults to "stretch"
   */
  horizontalAlignment?: GridItemProps["horizontalAlignment"];
  /**
   * Aligns a grid item inside a cell along the block (column) axis. Defaults to "stretch"
   */
  verticalAlignment?: GridItemProps["verticalAlignment"];
  /**
   * Position in the border layout
   */
  position: BorderPosition;
  /**
   * Defines if the item should stick to the edges of its container. Defaults to "false"
   */
  sticky?: boolean;
}

const withBaseName = makePrefixer("uitkBorderItem");

export const BorderItem = forwardRef<HTMLDivElement, BorderItemProps>(
  function BorderItem(
    { children, className, position, sticky = false, style, ...rest },
    ref
  ) {
    const gridItemStyles = {
      ...style,
      "--grid-item-grid-area": position,
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
