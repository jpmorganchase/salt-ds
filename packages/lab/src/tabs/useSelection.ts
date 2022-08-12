import { useControlled } from "@jpmorganchase/uitk-core";
import { KeyboardEvent, useCallback } from "react";
import { isTabElement } from "./tab-utils";

const activationKeys = new Set(["Enter", " "]);

const isActivationKey = (key: string) => activationKeys.has(key);

export const useSelection = ({
  defaultValue,
  onChange,
  value: valueProp,
}: {
  defaultValue?: number;
  onChange?: (tabIndex: number) => void;
  value?: number;
}): {
  activateTab: (tabIndex: number) => void;
  isControlled: boolean;
  onClick: (evt: MouseEvent, tabIndex: number) => void;
  onKeyDown: (evt: KeyboardEvent, tabIndex: number) => void;
  value: number;
} => {
  const [value, setValue, isControlled] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? (valueProp === undefined ? 0 : undefined),
    name: "Tabstrip",
    state: "value",
  });

  const activateTab = useCallback(
    (tabIndex: number) => {
      setValue(tabIndex);
      onChange && onChange(tabIndex);
    },
    [onChange, setValue]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent, tabIndex: number, childIndex?: number) => {
      const targetElement = e.target as HTMLElement;
      if (
        isActivationKey(e.key) &&
        tabIndex !== value &&
        isTabElement(targetElement)
      ) {
        e.stopPropagation();
        e.preventDefault();
        activateTab(tabIndex);
      }
    },
    [activateTab, value]
  );

  const onClick = useCallback(
    (e: MouseEvent, tabIndex: number) => {
      if (tabIndex !== value) {
        activateTab(tabIndex);
      }
    },
    [activateTab, value]
  );

  return {
    activateTab,
    isControlled,
    onClick,
    onKeyDown,
    value,
  };
};
