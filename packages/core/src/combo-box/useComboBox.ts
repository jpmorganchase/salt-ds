import type { ComponentPropsWithoutRef, SyntheticEvent } from "react";
import type { OptionValue } from "../list-control/ListControlContext";
import {
  type ListControlProps,
  useListControl,
} from "../list-control/ListControlState";
import { useControlled, useEventCallback } from "../utils";

export type UseComboBoxProps<Item> = ListControlProps<Item> &
  Pick<ComponentPropsWithoutRef<"input">, "value" | "defaultValue">;

export function getInputValueAfterSelection<Item>(
  option: OptionValue<Item>,
  multiselect: boolean | undefined,
  valueToString: (item: Item) => string,
): string {
  return multiselect ? "" : valueToString(option.value);
}

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

  const { selectedState, setSelectedState, setOpen } = listControl;

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

  const select = useEventCallback(
    (event: SyntheticEvent, option: OptionValue<Item>) => {
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
      setValueState(
        getInputValueAfterSelection(
          option,
          multiselect,
          listControl.valueToString,
        ),
      );
      onSelectionChange?.(event, newSelected);

      if (!multiselect) {
        setOpen(false);
      }
    },
  );

  const removePill = (event: SyntheticEvent, itemToRemove: Item) => {
    if (!multiselect || disabled || readOnly) {
      return;
    }

    let newSelected: Item[];

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
