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

import {
  FlexLayout,
  FlexLayoutProps,
  makePrefixer,
  useControlled,
  useForkRef,
} from "@salt-ds/core";
import {
  InteractableCardGroupContext,
  Value,
} from "./internal/InteractableCardGroupContext";
import interactableCardGroupCss from "./InteractableCardGroup.css";

export interface InteractableCardGroupProps
  extends Omit<FlexLayoutProps<"div">, "onChange"> {
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
    gap = 2,
    value: valueProp,
    defaultValue,
    disabled,
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
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const newValue = event.currentTarget.value;
      setValue(newValue);
      if (value !== newValue) {
        onChange?.(event);
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
      disabled,
    }),
    [select, isSelected, disabled]
  );

  return (
    <InteractableCardGroupContext.Provider value={contextValue}>
      <FlexLayout
        gap={gap}
        className={clsx(withBaseName(), className)}
        role="radiogroup"
        ref={handleRef}
        {...rest}
      >
        {children}
      </FlexLayout>
    </InteractableCardGroupContext.Provider>
  );
});
