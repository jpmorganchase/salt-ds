import { ReactNode } from "react";
import { GridCellValueProps } from "../GridColumn";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import "./DefaultCellValue.css";

const withBaseName = makePrefixer("uitkGridDefaultCellValue");

// Default component for cell value wrappers. Rendered as a child of cell
// components (<td>s)
export function DefaultCellValue<T>(props: GridCellValueProps<T>) {
  const { value } = props;
  return (
    <div
      className={cn(withBaseName(), {
        [withBaseName("alignRight")]: props.column.info.props.align === "right",
      })}
    >
      {value as ReactNode}
    </div>
  );
}
