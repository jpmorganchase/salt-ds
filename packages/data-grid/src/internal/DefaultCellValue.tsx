import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import type { GridCellValueProps } from "../GridColumn";

import defaultCellValueCss from "./DefaultCellValue.css";

const withBaseName = makePrefixer("saltGridDefaultCellValue");

// Default component for cell value wrappers. Rendered as a child of cell
// components (<td>s)
export function DefaultCellValue<T>(props: GridCellValueProps<T>) {
  const { value } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-default-cell-value",
    css: defaultCellValueCss,
    window: targetWindow,
  });

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
