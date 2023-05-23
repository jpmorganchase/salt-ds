import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes } from "react";
import { ColumnSeparatorType } from "./Grid";

import "./CellFrame.css";

export interface CellFrameProps extends HTMLAttributes<HTMLTableCellElement> {
  isSelected?: boolean;
  isEditable?: boolean;
  separator?: ColumnSeparatorType;
}

const withBaseName = makePrefixer("saltGridCellFrame");

/**
 * Frame around a cell, containing styles of states (e.g. selected), different cell types (e.g. editable, separator), etc.
 * This is useful to implement a custom type of cell / cell editor.
 * */
export const CellFrame = forwardRef<HTMLTableCellElement, CellFrameProps>(
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
