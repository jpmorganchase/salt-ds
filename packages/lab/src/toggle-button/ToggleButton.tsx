import {
  Children,
  forwardRef,
  ReactElement,
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
} from "react";
import cx from "classnames";
import {
  makePrefixer,
  Button,
  ButtonProps,
  Icon,
} from "@jpmorganchase/uitk-core";

import { useForkRef } from "../utils";
import { Tooltip } from "../tooltip";

import { ToggleButtonGroupContext } from "./internal/ToggleButtonGroupContext";

import "./ToggleButton.css";

const withBaseName = makePrefixer("uitkToggleButton");

export type ToggleButtonToggleEventHandler = (
  event: SyntheticEvent<HTMLButtonElement>,
  toggled: boolean
) => void;

export interface ToggleButtonProps extends ButtonProps {
  ariaLabel?: string;
  "data-button-index"?: number;
  toggled?: boolean;
  tooltipText?: string;
  disableTooltip?: boolean;
  onToggle?: ToggleButtonToggleEventHandler;
}

const iconType = (<Icon />).type;

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (props, ref) => {
    const {
      ariaLabel,
      className,
      onToggle,
      toggled = false,
      tooltipText = ariaLabel,
      variant: variantProp = "primary",
      disabled: disabledProp,
      disableTooltip: disableTooltipProp,
      focusableWhenDisabled: focusableWhenDisabledProp,
      "data-button-index": index,
      ...restProps
    } = props;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const setRef = useForkRef(ref, buttonRef);
    const groupContext = useContext(ToggleButtonGroupContext);

    const {
      register,
      unregister,
      disabled = disabledProp,
      disableTooltip = disableTooltipProp,
      focusableWhenDisabled = focusableWhenDisabledProp,
      orientation = "horizontal",
      variant = variantProp,
    } = groupContext || {};

    useEffect(() => {
      if (
        index !== undefined &&
        register &&
        unregister &&
        (!disabled || focusableWhenDisabled)
      ) {
        register(buttonRef.current, index);

        return function cleanup() {
          unregister(index);
        };
      }
    }, [index, disabled, focusableWhenDisabled, register, unregister]);

    const handleToggle = (event: SyntheticEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onToggle?.(event, !toggled);
      }
    };

    const getButtonWithTooltip = (button: ReactElement) =>
      disableTooltip || (disabled && !focusableWhenDisabled) ? (
        button
      ) : (
        <Tooltip
          placement={orientation === "horizontal" ? "bottom" : "right"}
          title={tooltipText}
        >
          {button}
        </Tooltip>
      );

    const tabIndex = toggled && !disabled ? 0 : -1;

    return getButtonWithTooltip(
      <Button
        {...restProps}
        aria-checked={toggled}
        aria-label={ariaLabel}
        aria-posinset={index !== undefined ? index + 1 : undefined}
        className={cx(
          withBaseName(),
          withBaseName(orientation),
          {
            [withBaseName("cta")]: variant === "cta",
            [withBaseName("secondary")]: variant === "secondary",
            [withBaseName("toggled")]: toggled,
            [withBaseName("disabled")]: disabled,
            [withBaseName("iconOnly")]:
              Children.count(props.children) === 1 &&
              (props.children as any)?.type === iconType,
          },
          className
        )}
        disabled={disabled}
        focusableWhenDisabled={focusableWhenDisabled}
        onClick={handleToggle}
        ref={setRef}
        role={groupContext ? "radio" : "checkbox"}
        tabIndex={groupContext ? tabIndex : undefined}
        variant={variant}
      />
    );
  }
);
