import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridColumnModel } from "../Grid";
import { HeaderCell } from "../HeaderCell";
import { HeaderCellValue } from "../HeaderCellValue";
import { useCursorContext } from "../CursorContext";

import { FakeHeaderCell } from "./FakeHeaderCell";

import HeaderRowCss from "./HeaderRow.css";

const withBaseName = makePrefixer("saltGridHeaderRow");

export interface HeaderRowProps<T> {
  columns: GridColumnModel<T>[];
  gap?: number;
}

export function HeaderRow<T>(props: HeaderRowProps<T>) {
  const { columns, gap } = props;

  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-header-row",
    css: HeaderRowCss,
    window: targetWindow,
  });

  const { cursorColIdx, focusedPart, headerIsFocusable } = useCursorContext();

  const ariaRowIndex = headerIsFocusable ? 1 : undefined;

  return (
    <tr className={withBaseName()} role="row" aria-rowindex={ariaRowIndex}>
      {columns.map((column) => {
        const Cell = column.info.props.headerComponent || HeaderCell;
        const CellValue =
          column.info.props.headerValueComponent || HeaderCellValue;
        const isFocused =
          focusedPart === "header" && cursorColIdx === column.index;
        return (
          <Cell
            key={column.info.props.id}
            column={column}
            isFocused={isFocused}
          >
            <CellValue column={column} isFocused={isFocused} />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeHeaderCell /> : null}
    </tr>
  );
}
