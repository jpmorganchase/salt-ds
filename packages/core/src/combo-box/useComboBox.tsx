import { ComponentPropsWithoutRef, SyntheticEvent } from "react";
import {
  useListControl,
  ListControlProps,
} from "../list-control/ListControlState";
import { OptionValue } from "../list-control/ListControlContext";
import { useControlled } from "../utils";

export type UseComboBoxProps<Item> = ListControlProps<Item> &
  Pick<ComponentPropsWithoutRef<"input">, "value" | "defaultValue">;

export function useComboBox<Item>(props: UseComboBoxProps<Item>) {
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
      defaultValue ??
      (selectedState.length === 1 && !multiselect
        ? listControl.valueToString(selectedState[0])
        : defaultValue),
    name: "ComboBox",
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
    ).map((option) => listControl.valueToString(option.data.value));
    setValueState(multiselect ? "" : newValue[0]);
    onSelectionChange?.(event, newSelected);

    if (!multiselect) {
      setOpen(false);
    }
  };

  const removePill = (event: SyntheticEvent, itemToRemove: Item) => {
    if (!multiselect || disabled || readOnly) {
      return;
    }

    let newSelected;

    if (selectedState.includes(itemToRemove)) {
      newSelected = selectedState.filter((item) => item !== itemToRemove);
    } else {
      newSelected = selectedState.concat([itemToRemove]);
    }

    setSelectedState(newSelected);
    setValueState("");
    onSelectionChange?.(event, newSelected);
  };

  return { ...listControl, select, valueState, setValueState, removePill };
}
