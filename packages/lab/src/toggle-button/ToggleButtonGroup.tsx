import {
  ButtonVariant,
  makePrefixer,
  useControlled,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import {
  Children,
  cloneElement,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Orientation,
  ToggleButtonGroupContext,
} from "./internal/ToggleButtonGroupContext";

import "./ToggleButtonGroup.css";

const withBaseName = makePrefixer("uitkToggleButtonGroup");

export type ToggleButtonGroupChangeEventHandler = (
  event: SyntheticEvent<HTMLButtonElement>,
  index: number,
  toggled: boolean
) => void;

export interface ToggleButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  ariaLabel?: string;
  disabled?: boolean;
  disableTooltip?: boolean;
  defaultSelectedIndex?: number;
  focusableWhenDisabled?: boolean;
  selectedIndex?: number;
  orientation?: Orientation;
  variant?: ButtonVariant;
  width?: number;
  children: Array<ReactElement>;
  onChange?: ToggleButtonGroupChangeEventHandler;
}

const getNextIndex = (
  nodes: Array<HTMLButtonElement | undefined>,
  index: number,
  increment: number
) => (index + nodes.length + increment) % nodes.length;

const getNextActive = (
  nodes: Array<HTMLButtonElement | undefined>,
  index: number,
  increment: number
) => {
  let nextIndex = getNextIndex(nodes, index, increment);

  while (nextIndex !== index && !nodes[nextIndex]) {
    nextIndex = getNextIndex(nodes, nextIndex, increment);
  }

  return nodes[nextIndex];
};

export const ToggleButtonGroup = forwardRef<
  HTMLDivElement,
  ToggleButtonGroupProps
>(function ToggleButtonGroup(
  {
    ariaLabel = "Toggle options",
    children,
    className,
    disabled,
    disableTooltip,
    defaultSelectedIndex = 0,
    focusableWhenDisabled,
    selectedIndex: selectedIndexProp,
    orientation = "horizontal",
    variant = "primary",
    width,
    onChange,
    onFocus,
    onBlur,
    ...restProps
  },
  ref
) {
  const buttonRefs = useRef<Array<HTMLButtonElement | undefined>>([]);

  const [disableFocus, setDisableFocus] = useState(false);
  const [selectedIndex, setSelectedIndex] = useControlled({
    controlled: selectedIndexProp,
    default: defaultSelectedIndex,
    name: "ToggleButtonGroup",
    state: "selectedIndex",
  });

  const register = useCallback(
    (node: HTMLButtonElement | null, index: number) => {
      buttonRefs.current[index] = node || undefined;
    },
    []
  );

  const unregister = useCallback((index: number) => {
    buttonRefs.current[index] = undefined;
  }, []);

  // When focus is not on the active button and when you tab out
  // It should leave the toggle button group
  // It should not go to active button
  const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
    setDisableFocus(true);
    onFocus?.(event);
  };

  // When you tab out from toggle button group, it should restore tab index of active button
  // When you tab back in, focus should go to active button
  const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    setDisableFocus(false);
    onBlur?.(event);
  };

  const handleToggle: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    newValue
  ) => {
    if (!newValue) {
      return;
    }
    setSelectedIndex(index);
    onChange?.(event, index, newValue);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      getNextActive(buttonRefs.current, index, 1)?.focus();
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      getNextActive(buttonRefs.current, index, -1)?.focus();
    }
  };

  const groupContext = useMemo(
    () => ({
      disabled,
      disableFocus,
      disableTooltip,
      focusableWhenDisabled,
      orientation,
      register,
      unregister,
      variant,
    }),
    [
      disabled,
      disableFocus,
      disableTooltip,
      focusableWhenDisabled,
      orientation,
      register,
      unregister,
      variant,
    ]
  );

  const childrenCount = Children.count(children);

  const getToggleButtonItem = (child: ReactElement, index: number) => {
    return cloneElement(child, {
      ...child.props,
      "data-button-index": index,
      "aria-setsize": childrenCount + 1,
      key: `button-${index}`,
      toggled: selectedIndex === index,
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) =>
        handleKeyDown(event, index),
      onToggle: (event: SyntheticEvent<HTMLButtonElement>, newValue: boolean) =>
        handleToggle(event, index, newValue),
    });
  };

  return (
    <div
      {...restProps}
      aria-label={ariaLabel}
      className={cx(
        withBaseName(),
        withBaseName(orientation),
        {
          [withBaseName("cta")]: variant === "cta",
          [withBaseName("secondary")]: variant === "secondary",
          [withBaseName("primary")]: variant === "primary",
        },
        className
      )}
      ref={ref}
      role="radiogroup"
      onFocus={handleFocus}
      onBlur={handleBlur}
      // TODO: Make this responsive?
      style={{ width }}
    >
      <ToggleButtonGroupContext.Provider value={groupContext}>
        {children && children.map(getToggleButtonItem)}
      </ToggleButtonGroupContext.Provider>
    </div>
  );
});
