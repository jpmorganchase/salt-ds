import {
  useListControl,
  ListControlProps,
} from "../list-control/ListControlState";

import { SyntheticEvent } from "react";
import { OptionValue } from "../list-control/ListControlContext";

export function useComboBoxNext(props: ListControlProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    defaultValue,
    value,
  } = props;

  const listControl = useListControl({
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    defaultValue,
    value,
  });

  const { selectedState, getOptionsMatching, setValueState, setSelectedState } =
    listControl;

  const select = (event: SyntheticEvent, option: OptionValue) => {
    const { disabled, value } = option;

    if (disabled) {
      return;
    }

    let newSelected = [value];

    if (multiselect) {
      if (selectedState.includes(value)) {
        newSelected = selectedState.filter((item) => item !== value);
      } else {
        newSelected = selectedState.concat([value]);
      }
    }

    setSelectedState(newSelected);
    const newValue = getOptionsMatching((option) =>
      newSelected.includes(option.value)
    ).map((option) => option.text);
    setValueState(multiselect ? "" : newValue[0]);
    onSelectionChange?.(event, newSelected);
  };

  return { ...listControl, select };
}
