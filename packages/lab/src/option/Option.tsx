import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Checkbox, makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  OptionValue,
  useListControlContext,
} from "../list-control/ListControlContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
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

export const Option = forwardRef<HTMLDivElement, OptionProps>(function Option(
  props,
  ref
) {
  const {
    className,
    children,
    disabled,
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
    activeState,
    multiselect,
    select,
    register,
    selectedState,
    focusVisibleState,
    valueToString,
  } = useListControlContext();

  const selected = selectedState.includes(value);
  const active = activeState?.id === id;

  const optionValue: OptionValue<unknown> = useMemo(
    () => ({
      id: String(id),
      disabled: Boolean(disabled),
      value,
    }),
    [id, disabled, value]
  );

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled || id == undefined) {
      return;
    }

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
          [withBaseName("focusVisible")]: focusVisibleState && active,
        },
        className
      )}
      ref={handleRef}
      role="option"
      id={id}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      {...rest}
    >
      {multiselect && (
        <Checkbox
          checked={selected}
          aria-hidden="true"
          inputProps={{ tabIndex: -1 }}
        />
      )}
      {children ?? valueToString(value)}
    </div>
  );
});
