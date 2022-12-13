import { AutoSizeHeaderCell } from "./HeaderCell";
import { RadioButtonIcon } from "@jpmorganchase/uitk-lab";
import "./CheckboxCell.css";
import cx from "classnames";
import { HeaderCellProps } from "./GridColumn";

export function RowSelectionRadioHeaderCell<T>(props: HeaderCellProps<T>) {
  return (
    <AutoSizeHeaderCell {...props}>
      <div className={cx("uitkGridCheckboxContainer", "uitkGrid-hidden")}>
        <RadioButtonIcon />
      </div>
    </AutoSizeHeaderCell>
  );
}
