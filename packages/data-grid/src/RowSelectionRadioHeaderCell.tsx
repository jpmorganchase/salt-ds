import { clsx } from "clsx";

import { RadioButtonIcon } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { AutoSizeHeaderCell } from "./HeaderCell";
import { HeaderCellProps } from "./GridColumn";

import checkboxCellCss from "./CheckboxCell.css";

export function RowSelectionRadioHeaderCell<T>(props: HeaderCellProps<T>) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-cell",
    css: checkboxCellCss,
    window: targetWindow,
  });

  return (
    <AutoSizeHeaderCell {...props}>
      <div className={clsx("saltGridCheckboxContainer", "saltGrid-hidden")}>
        <RadioButtonIcon />
      </div>
    </AutoSizeHeaderCell>
  );
}
