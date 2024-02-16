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
  Value,
} from "./internal/InteractableCardGroupContext";
import interactableCardGroupCss from "./InteractableCardGroup.css";

export interface InteractableCardGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: Value;
  /**
   * The value. Use when the component is controlled.
   */
  value?: Value;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (event: SyntheticEvent<HTMLButtonElement>) => void;
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
    onChange,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toggle-button-group",
    css: interactableCardGroupCss,
    window: targetWindow,
  });

  const groupRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, groupRef);

  const [value, setValue] = useControlled({
    default: defaultValue,
    controlled: valueProp,
    name: "InteractableCardGroup",
    state: "value",
  });

  const select = useCallback(
    (value: Value) => {
      const newValue = value;
      setValue(value);
      if (value !== newValue) {
        onChange && onChange(value);
      }
    },
    [onChange, value, setValue]
  );

  const isSelected = useCallback(
    (id: Value) => {
      return value === id;
    },
    [value]
  );

  const contextValue = useMemo(
    () => ({
      select,
      isSelected,
    }),
    [select, isSelected]
  );

  return (
    <InteractableCardGroupContext.Provider value={contextValue}>
      <div
        className={clsx(withBaseName(), className)}
        role="radiogroup"
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </InteractableCardGroupContext.Provider>
  );
});
