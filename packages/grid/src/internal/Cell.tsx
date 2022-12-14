import { makePrefixer } from "@salt-ds/core";
import { forwardRef, HTMLAttributes } from "react";
import cn from "classnames";
import "./Cell.css";
import { ColumnSeparatorType } from "../Grid";

export interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  isSelected?: boolean;
  isEditable?: boolean;
  separator?: ColumnSeparatorType;
}

const withBaseName = makePrefixer("saltGridCell");

export const Cell = forwardRef<HTMLTableCellElement, CellProps>(
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
        className={cn(
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
