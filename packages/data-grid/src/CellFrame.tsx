import { makePrefixer } from "@salt-ds/core";
import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import "./Cell.css";
import { ColumnSeparatorType } from "./Grid";

export interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  isSelected?: boolean;
  isEditable?: boolean;
  separator?: ColumnSeparatorType;
}

const withBaseName = makePrefixer("saltGridCell");

/**
 * Frame around a cell, containing styles of states (e.g. selected), different cell types (e.g. editable, separator), etc.
 * This is useful to implement a custom type of cell / cell editor.
 * */
export const CellFrame = forwardRef<HTMLTableCellElement, CellProps>(
  function CellFrame(props, ref) {
    const {
      children,
      separator,
      isSelected,
      isEditable,
      className,
      ...tdProps
    } = props;
    return (
      <td
        ref={ref}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("selected")]: isSelected,
            [withBaseName("editable")]: isEditable,
            [withBaseName("regularSeparator")]:
              separator === "regular" || separator === "groupEdge",
            [withBaseName("pinnedSeparator")]: separator === "pinned",
          },
          className
        )}
        {...tdProps}
      >
        <div className={withBaseName("body")}>{props.children}</div>
        <div className={withBaseName("columnSeparator")} />
        <div className={withBaseName("rowSeparator")} />
        <div className={withBaseName("topSeparator")} />
      </td>
    );
  }
);
