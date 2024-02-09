import {
  useListControl,
  ListControlProps,
} from "../list-control/ListControlState";

import { SyntheticEvent } from "react";
import { OptionValue } from "../list-control/ListControlContext";

export function useComboBoxNext<Item>(props: ListControlProps<Item>) {
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
    disabled,
    readOnly,
  } = props;

  const listControl = useListControl<Item>({
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    defaultValue,
    value,
    disabled,
    readOnly,
  });

  const {
    selectedState,
    getOptionsMatching,
    setValueState,
    setSelectedState,
    setOpen,
  } = listControl;

  const select = (event: SyntheticEvent, option: OptionValue<Item>) => {
    if (option.disabled || disabled || readOnly) {
      return;
    }

    let newSelected = [option.value];

    if (multiselect) {
      if (selectedState.includes(option.value)) {
        newSelected = selectedState.filter((item) => item !== option.value);
      } else {
        newSelected = selectedState.concat([option.value]);
      }
    }

    setSelectedState(newSelected);
    const newValue = getOptionsMatching((option) =>
      newSelected.includes(option.value)
    ).map((option) => option.text);
    setValueState(multiselect ? "" : newValue[0]);
    onSelectionChange?.(event, newSelected);

    if (!multiselect) {
      setOpen(false);
    }
  };

  return { ...listControl, select };
}
