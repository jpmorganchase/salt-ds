import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactNode,
} from "react";

import { ValidationStatus, VALIDATION_NAMED_STATUS } from "../status-indicator";
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

    const disabled = disabledProp || formFieldDisabled;
    const status =
      formFieldValidationStatus !== undefined &&
      VALIDATION_NAMED_STATUS.includes(formFieldValidationStatus)
        ? formFieldValidationStatus
        : statusProp;
    const { Component: FloatingComponent } = useFloatingComponent();

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
      getTooltipPosition,
    } = useTooltip(hookProps);

    const triggerRef = useForkRef(
      // @ts-expect-error children.ref cannot currently be typed.
      isValidElement(children) ? children.ref : null,
      reference
    );

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

    return (
      <>
        {isValidElement(children) &&
          cloneElement(children, {
            ...mergeProps(getTriggerProps(), children.props),
            ref: triggerRef,
          })}

        <FloatingComponent
          className={clsx(withBaseName(), withBaseName(status), className)}
          open={open && !disabled}
          {...getTooltipProps()}
          ref={floatingRef}
          {...getTooltipPosition()}
        >
          <TooltipBase
            hideIcon={hideIcon}
            status={status}
            content={content}
            hideArrow={hideArrow}
            arrowProps={arrowProps}
          />
        </FloatingComponent>
      </>
    );
  }
);
