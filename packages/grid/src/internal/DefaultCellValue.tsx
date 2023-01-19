import { ReactNode } from "react";
import { GridCellValueProps } from "../GridColumn";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import "./DefaultCellValue.css";

const withBaseName = makePrefixer("saltGridDefaultCellValue");

// Default component for cell value wrappers. Rendered as a child of cell
// components (<td>s)
export function DefaultCellValue<T>(props: GridCellValueProps<T>) {
  const { value } = props;
  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("alignRight")]: props.column.info.props.align === "right",
      })}
    >
      {value as ReactNode}
    </div>
  );
}
