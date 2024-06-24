import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";

import { ColumnSeparatorType } from "./Grid";

import cellCss from "./CellFrame.css";

export interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  isSelected?: boolean;
  isEditable?: boolean;
  separator?: ColumnSeparatorType;
}

// TODO: rename the prefix in next major version to match component name.
const withBaseName = makePrefixer("saltGridCell");

/** Cell frame used for creating custom cells and editors */
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

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-cell",
      css: cellCss,
      window: targetWindow,
    });

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
        <div className={withBaseName("body")}>{children}</div>
        <div className={withBaseName("columnSeparator")} />
        <div className={withBaseName("rowSeparator")} />
        <div className={withBaseName("topSeparator")} />
      </td>
    );
  }
);
