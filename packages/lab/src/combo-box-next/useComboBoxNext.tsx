import {
  useListControl,
  ListControlProps,
} from "../list-control/ListControlState";

import { ComponentPropsWithoutRef, SyntheticEvent } from "react";
import { OptionValue } from "../list-control/ListControlContext";
import { useControlled } from "@salt-ds/core";

export type UseComboBoxNextProps<Item> = ListControlProps<Item> &
  Pick<ComponentPropsWithoutRef<"input">, "value" | "defaultValue">;

export function useComboBoxNext<Item>(props: UseComboBoxNextProps<Item>) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    disabled,
    readOnly,
    valueToString,
    value,
    defaultValue,
  } = props;

  const listControl = useListControl<Item>({
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    disabled,
    readOnly,
    valueToString,
  });

  const { selectedState, getOptionsMatching, setSelectedState, setOpen } =
    listControl;

  const [valueState, setValueState] = useControlled({
    controlled: value,
    default:
      defaultValue ?? selectedState.length === 1
        ? listControl.valueToString(selectedState[0])
        : defaultValue,
    name: "ComboBoxNext",
    state: "value",
  });

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
    ).map((option) => listControl.valueToString(option.value));
    setValueState(multiselect ? "" : newValue[0]);
    onSelectionChange?.(event, newSelected);

    if (!multiselect) {
      setOpen(false);
    }
  };

  return { ...listControl, select, valueState, setValueState };
}
