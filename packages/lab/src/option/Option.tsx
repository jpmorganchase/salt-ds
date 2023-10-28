import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  MouseEvent,
  useRef,
  useEffect,
  useMemo,
  Children,
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
  disabled?: boolean;
  value: string;
  textValue?: string;
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltOption");

function getOptionText(textValue: string | undefined, children: ReactNode) {
  if (textValue) {
    return textValue;
  }

  let textString = "";
  Children.forEach(children, (child) => {
    if (typeof child === "string") {
      textString += child;
    }
  });

  return textString;
}

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
    textValue,
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
  const optionText = getOptionText(textValue, children);

  const {
    setActive,
    activeState,
    multiselect,
    setOpen,
    select,
    register,
    selectedState,
    focusVisibleState,
  } = useListControlContext();

  const selected = selectedState.includes(value);
  const active = activeState?.id === id;

  const optionValue: OptionValue = useMemo(
    () => ({
      id: String(id),
      disabled: Boolean(disabled),
      value,
      text: optionText,
    }),
    [id, disabled, value, optionText]
  );

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled || id == undefined) {
      return;
    }

    // set active descendent
    setActive(optionValue);

    // handle close if multi-select
    if (!multiselect) {
      setOpen(event, false);
    }

    // handle selection
    select(event, optionValue);

    onClick?.(event);
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
      {...rest}
    >
      {multiselect && (
        <Checkbox checked={selected} aria-hidden="true" tabIndex={-1} />
      )}
      {children}
    </div>
  );
});
