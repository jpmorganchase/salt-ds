import { AutoSizeHeaderCell } from "./HeaderCell";
import { RadioButtonIcon } from "@salt-ds/lab";
import "./CheckboxCell.css";
import { clsx } from "clsx";
import { HeaderCellProps } from "./GridColumn";

export function RowSelectionRadioHeaderCell<T>(props: HeaderCellProps<T>) {
  return (
    <AutoSizeHeaderCell {...props}>
      <div className={clsx("saltGridCheckboxContainer", "saltGrid-hidden")}>
        <RadioButtonIcon />
      </div>
    </AutoSizeHeaderCell>
  );
}
