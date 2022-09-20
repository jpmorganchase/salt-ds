import { AutoSizeHeaderCell, HeaderCellProps } from "./HeaderCell";
import { makePrefixer, RadioIcon } from "@jpmorganchase/uitk-core";
import "./CheckboxCell.css";
import cx from "classnames";

export function RowSelectionRadioHeaderCell<T>(props: HeaderCellProps<T>) {
  return (
    <AutoSizeHeaderCell {...props}>
      <div className={cx("uitkGridCheckboxContainer", "uitkGrid-hidden")}>
        <RadioIcon />
      </div>
    </AutoSizeHeaderCell>
  );
}
