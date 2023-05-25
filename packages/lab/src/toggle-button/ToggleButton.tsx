import { Button, ButtonProps, makePrefixer, Tooltip } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  forwardRef,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ToggleButtonGroupContext } from "./internal/ToggleButtonGroupContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toggleButtonCss from "./ToggleButton.css";

const withBaseName = makePrefixer("saltToggleButton");

export type ToggleButtonToggleEventHandler = (
  event: SyntheticEvent<HTMLButtonElement>,
  toggled: boolean
) => void;

export interface ToggleButtonProps extends ButtonProps {
  "aria-label"?: string;
  "data-button-index"?: number;
  toggled?: boolean;
  tooltipText?: string;
  disableTooltip?: boolean;
  onToggle?: ToggleButtonToggleEventHandler;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (props, ref) => {
    const {
      "aria-label": ariaLabel,
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

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toggle-button",
      css: toggleButtonCss,
      window: targetWindow,
    });

    const [iconOnly, setIconOnly] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const groupContext = useContext(ToggleButtonGroupContext);

    const handleIconOnlyButton = useCallback(
      (button: HTMLButtonElement | null) => {
        setIconOnly(
          button?.querySelector(".saltIcon") != null &&
            button?.childElementCount === 1
        );
      },
      [setIconOnly]
    );

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

    const tabIndex = toggled && !disabled ? 0 : -1;

    return (
      <Tooltip
        content={tooltipText}
        disabled={disableTooltip}
        placement={orientation === "horizontal" ? "bottom" : "right"}
      >
        <Button
          ref={handleIconOnlyButton}
          aria-checked={toggled}
          aria-label={ariaLabel}
          aria-posinset={index !== undefined ? index + 1 : undefined}
          className={clsx(
            withBaseName(),
            withBaseName(orientation),
            {
              [withBaseName("primary")]: variant === "primary",
              [withBaseName("cta")]: variant === "cta",
              [withBaseName("secondary")]: variant === "secondary",
              [withBaseName("toggled")]: toggled,
              [withBaseName("disabled")]: disabled,
              [withBaseName("iconOnly")]: iconOnly,
            },
            className
          )}
          onClick={handleToggle}
          disabled={disabled}
          focusableWhenDisabled={focusableWhenDisabled}
          role={groupContext ? "radio" : "checkbox"}
          tabIndex={groupContext ? tabIndex : undefined}
          variant={variant}
          {...restProps}
        />
      </Tooltip>
    );
  }
);
