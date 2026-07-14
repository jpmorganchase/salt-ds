import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  memo,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { CheckboxIcon } from "../checkbox";
import type { OptionValue } from "../list-control/ListControlContext";
import { useListControlOptionContext } from "../list-control/ListControlOptionContext";
import {
  OPTION_STATE_ACTIVE,
  OPTION_STATE_FOCUS_VISIBLE,
  OPTION_STATE_SELECTED,
} from "../list-control/ListControlOptionStore";
import { makePrefixer, useForkRef, useId } from "../utils";
import optionCss from "./Option.css";

export interface OptionProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the option will be disabled.
   */
  disabled?: boolean;
  /**
   * The value of the option.
   */
  value: unknown;
  /**
   * The content of the option.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltOption");

const OptionComponent = forwardRef<HTMLDivElement, OptionProps>(
  function Option(props, ref) {
    const {
      className,
      children,
      disabled: disabledProp,
      onClick,
      id: idProp,
      value,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-option",
      css: optionCss,
      window: targetWindow,
    });

    const optionRef = useRef(null);
    const id = useId(idProp);

    const {
      setActive,
      multiselect,
      select,
      register,
      optionStateStore,
      valueToString,
      disabled: listDisabled,
      listRef,
    } = useListControlOptionContext();

    const disabled = disabledProp || listDisabled;

    const optionId = String(id);
    const { getSnapshot, optionValue, subscribe } = useMemo(() => {
      const nextOptionValue: OptionValue<unknown> = {
        id: optionId,
        disabled: Boolean(disabled),
        value,
      };
      return {
        getSnapshot: () =>
          optionStateStore.getSnapshot(optionId, nextOptionValue),
        optionValue: nextOptionValue,
        subscribe: (listener: () => void) =>
          optionStateStore.subscribe(optionId, listener),
      };
    }, [optionId, disabled, value, optionStateStore]);
    const optionState = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getSnapshot,
    );
    const selected = (optionState & OPTION_STATE_SELECTED) !== 0;
    const active = (optionState & OPTION_STATE_ACTIVE) !== 0;
    const focusVisible = (optionState & OPTION_STATE_FOCUS_VISIBLE) !== 0;

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      if (disabled || id === undefined) {
        return;
      }

      listRef?.current?.focus({ preventScroll: true });
      // set active descendent
      setActive(optionValue);

      // handle selection
      select(event, optionValue);

      onClick?.(event);
    };

    const handleMouseOver = () => {
      setActive(optionValue);
    };

    useEffect(() => {
      if (id && optionRef.current) {
        return register(optionValue, optionRef.current);
      }
    }, [optionValue, id, register]);

    const handleRef = useForkRef(optionRef, ref);

    return (
      <div
        aria-disabled={disabled ? "true" : undefined}
        aria-selected={selected}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("active")]: active,
            [withBaseName("focusVisible")]: focusVisible,
          },
          className,
        )}
        ref={handleRef}
        role="option"
        id={id}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        tabIndex={-1}
        {...rest}
      >
        {multiselect && <CheckboxIcon checked={selected} />}
        {children ?? valueToString(value)}
      </div>
    );
  },
);

// Context isolation makes this bailout effective for unchanged option props.
export const Option = memo(OptionComponent) as typeof OptionComponent;
