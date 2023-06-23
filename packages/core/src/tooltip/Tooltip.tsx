import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactNode,
  Ref,
} from "react";

import { ValidationStatus } from "../status-indicator";
import {
  makePrefixer,
  mergeProps,
  UseFloatingUIProps,
  useForkRef,
  useFloatingComponent,
} from "../utils";

import { useTooltip, UseTooltipProps } from "./useTooltip";
import { useFormFieldProps } from "../form-field-context";
import { TooltipBase } from "./TooltipBase";

const withBaseName = makePrefixer("saltTooltip");

export interface TooltipProps
  extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">,
    Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * The children will be the Tooltip's trigger.
   */
  children: ReactNode;
  /**
   * Whether to hide the Tooltip arrow. Defaults to `false`.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide the status icon within the Tooltip. Defaults to `false`.
   */
  hideIcon?: boolean;
  /**
   * Content displayed inside the Tooltip. Can be a string or a React component.
   */
  content: ReactNode;
  /**
   * A string to determine the status of the Tooltip. Defaults to `info`.
   */
  status?: ValidationStatus;
  /**
   * Delay in milliseconds before the Tooltip is shown.
   */
  enterDelay?: number;
  /**
   * Delay in milliseconds before the Tooltip is hidden. Defaults to 300ms.
   */
  leaveDelay?: number;
  /**
   * Option to not display the Tooltip. Can be used in conditional situations like text truncation. Defaults to 0.
   */
  disabled?: boolean;
  /**
   * Option to remove the hover listener.
   */
  disableHoverListener?: boolean;
  /**
   * Option to remove the focus listener.
   */
  disableFocusListener?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      children,
      className,
      disabled: disabledProp = false,
      hideArrow = false,
      hideIcon = false,
      open: openProp,
      content,
      status: statusProp = "info",
      placement = "right",
      enterDelay = 300,
      leaveDelay = 0,
      ...rest
    } = props;

    const {
      disabled: formFieldDisabled,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const disabled = formFieldDisabled ?? disabledProp;
    const status = formFieldValidationStatus ?? statusProp;

    const { Component } = useFloatingComponent();

    const hookProps: UseTooltipProps = {
      open: openProp,
      placement,
      enterDelay,
      leaveDelay,
      ...rest,
    };

    const {
      arrowProps,
      open,
      floating,
      reference,
      getTriggerProps,
      getTooltipProps,
    } = useTooltip(hookProps);

    const triggerRef = useForkRef(
      // @ts-ignore
      isValidElement(children) ? children.ref : null,
      reference
    );
    const floatingRef = useForkRef(floating, ref) as Ref<HTMLDivElement>;

    return (
      <>
        {isValidElement(children) &&
          cloneElement(children, {
            ...mergeProps(getTriggerProps(), children.props),
            ref: triggerRef,
          })}

        <Component
          className={clsx(withBaseName(), withBaseName(status), className)}
          open={open}
          disabled={disabled}
          ref={floatingRef}
          {...getTooltipProps()}
        >
          <TooltipBase
            hideIcon={hideIcon}
            status={status}
            content={content}
            hideArrow={hideArrow}
            arrowProps={arrowProps}
          />
        </Component>
      </>
    );
  }
);
