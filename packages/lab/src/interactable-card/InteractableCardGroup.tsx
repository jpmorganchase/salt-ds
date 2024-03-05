import {
  ComponentPropsWithoutRef,
  forwardRef,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import {
  InteractableCardGroupContext,
  SelectionVariant,
  Value,
} from "./internal/InteractableCardGroupContext";
import interactableCardGroupCss from "./InteractableCardGroup.css";

export interface InteractableCardGroupProps
  extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: Value;
  /**
   * If `true`, the Interactable Card Group will be disabled.
   */
  disabled?: boolean;
  /**
   * The value. Use when the component is controlled.
   */
  value?: Value;
  /**
   * The seletion variant.
   */
  selectionVariant?: SelectionVariant;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (event: SyntheticEvent<HTMLButtonElement>, value: Value) => void;
}

const withBaseName = makePrefixer("saltInteractableCardGroup");

export const InteractableCardGroup = forwardRef<
  HTMLDivElement,
  InteractableCardGroupProps
>(function InteractableCardGroup(props, ref) {
  const {
    children,
    className,
    value: valueProp,
    defaultValue,
    disabled,
    onChange,
    selectionVariant = "single",
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-interactable-card-group",
    css: interactableCardGroupCss,
    window: targetWindow,
  });

  const groupRef = useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(ref, groupRef);

  const [value, setValue] = useControlled({
    default: defaultValue,
    controlled: valueProp,
    name: "InteractableCardGroup",
    state: "value",
  });

  const select = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const newValue = event.currentTarget.value;
      if (selectionVariant === "multiselect") {
        setValue((oldValues: Value) => {
          const currentValues = Array.isArray(oldValues) ? oldValues : [];
          const isSelected = currentValues.includes(newValue);

          return isSelected
            ? currentValues.filter((value) => value !== newValue)
            : [...currentValues, newValue];
        });
      } else {
        setValue(newValue);
        if (value !== newValue) {
          onChange?.(event, newValue);
        }
      }
    },
    [onChange, value, setValue, selectionVariant]
  );

  const isSelected = useCallback(
    (id: Value) =>
      selectionVariant === "multiselect"
        ? Array.isArray(value) && value.includes(id as any)
        : value === id,
    [value, selectionVariant]
  );

  const contextValue = useMemo(
    () => ({
      select,
      isSelected,
      disabled,
      selectionVariant,
    }),
    [select, isSelected, disabled, selectionVariant]
  );

  return (
    <InteractableCardGroupContext.Provider value={contextValue}>
      <div
        className={clsx(withBaseName(), className)}
        role={selectionVariant === "multiselect" ? "group" : "radiogroup"}
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </InteractableCardGroupContext.Provider>
  );
});
