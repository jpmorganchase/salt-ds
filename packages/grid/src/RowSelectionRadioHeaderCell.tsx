import { AutoSizeHeaderCell } from "./HeaderCell";
import { RadioButtonIcon } from "@salt-ds/lab";
import "./CheckboxCell.css";
import cx from "classnames";
import { HeaderCellProps } from "./GridColumn";

export function RowSelectionRadioHeaderCell<T>(props: HeaderCellProps<T>) {
  return (
    <AutoSizeHeaderCell {...props}>
      <div className={cx("saltGridCheckboxContainer", "saltGrid-hidden")}>
        <RadioButtonIcon />
      </div>
    </AutoSizeHeaderCell>
  );
}
