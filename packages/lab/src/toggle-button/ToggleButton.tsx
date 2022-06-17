import {
  Button,
  ButtonProps,
  makePrefixer,
  Tooltip,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
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

    const [iconOnly, setIconOnly] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const groupContext = useContext(ToggleButtonGroupContext);

    const handleIconOnlyButton = useCallback(
      (button: HTMLButtonElement | null) => {
        setIconOnly(
          button?.querySelector(".uitkIcon") != null &&
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

    const { getTooltipProps, getTriggerProps } = useTooltip({
      disabled: disableTooltip,
      placement: orientation === "horizontal" ? "bottom" : "right",
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps<typeof Button>(
      {
        "aria-checked": toggled,
        "aria-label": ariaLabel,
        "aria-posinset": index !== undefined ? index + 1 : undefined,
        className: cx(
          withBaseName(),
          withBaseName(orientation),
          {
            [withBaseName("cta")]: variant === "cta",
            [withBaseName("secondary")]: variant === "secondary",
            [withBaseName("toggled")]: toggled,
            [withBaseName("disabled")]: disabled,
            [withBaseName("iconOnly")]: iconOnly,
          },
          className
        ),
        onClick: handleToggle,
        disabled,
        focusableWhenDisabled,
        role: groupContext ? "radio" : "checkbox",
        tabIndex: groupContext ? tabIndex : undefined,
        variant,
        ...restProps,
      }
    );

    const handleButtonRef = useForkRef(ref, buttonRef);
    const handleIconOnlyButtonRef = useForkRef(
      handleIconOnlyButton,
      handleButtonRef
    );
    const handleRef = useForkRef(triggerRef, handleIconOnlyButtonRef);

    return (
      <>
        <Tooltip {...getTooltipProps({ title: tooltipText })} />
        <Button {...triggerProps} ref={handleRef} />
      </>
    );
  }
);
