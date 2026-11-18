import { useClassNameInjection } from "@salt-ds/styles";
import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  type FormFieldValidationStatus,
  useFormFieldProps,
} from "../form-field-context";
import type { ValidationStatus } from "../status-indicator";
import {
  getRefFromChildren,
  makePrefixer,
  mergeProps,
  type UseFloatingUIProps,
  useFloatingComponent,
  useForkRef,
} from "../utils";
import { TooltipBase } from "./TooltipBase";
import { type UseTooltipProps, useTooltip } from "./useTooltip";

const withBaseName = makePrefixer("saltTooltip");

export interface TooltipProps
  extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">,
    Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * The children will be the Tooltip's trigger.
   */
  children: ReactNode;
  /**
   * If `true`, the Tooltip arrow is hidden.
   */
  hideArrow?: boolean;
  /**
   * If `true`, the status icon within the Tooltip is hidden.
   * If no status is provided, icon will also be hidden.
   */
  hideIcon?: boolean;
  /**
   * Content displayed inside the Tooltip. Can be a string or a React component.
   */
  content: ReactNode;
  /**
   * Optional string to determine the status of the Tooltip.
   */
  status?: FormFieldValidationStatus | ValidationStatus;
  /**
   * Delay in milliseconds before the Tooltip is shown.
   * @default 300
   */
  enterDelay?: number;
  /**
   * Delay in milliseconds before the Tooltip is hidden.
   * @default 0
   */
  leaveDelay?: number;
  /**
   * If `true`, the Tooltip isn't shown, for example when its trigger's text
   * isn't truncated. The Tooltip also isn't shown when the surrounding
   * `FormField` is disabled.
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
  /**
   * If `true`, the Tooltip is shown. Use with `onOpenChange` to control it.
   * Leave it unset for the Tooltip to show and hide itself when its trigger is
   * hovered or focused.
   */
  open?: UseFloatingUIProps["open"];
  /**
   * The placement of the Tooltip relative to its trigger.
   * @default "right"
   */
  placement?: UseFloatingUIProps["placement"];
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const { className, props: finalProps } = useClassNameInjection(
      "saltTooltip",
      props,
    );

    const {
      children,
      disabled: disabledProp = false,
      hideArrow = false,
      hideIcon = false,
      open: openProp,
      content,
      status: statusProp,
      placement = "right",
      enterDelay = 300,
      leaveDelay = 0,
      ...rest
    } = finalProps;

    const {
      disabled: formFieldDisabled,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const disabled = disabledProp || formFieldDisabled;
    const status = statusProp ?? (formFieldValidationStatus || undefined);
    const { Component: FloatingComponent } = useFloatingComponent();

    const hookProps: UseTooltipProps = {
      open: openProp,
      disabled,
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

    const triggerRef = useForkRef(getRefFromChildren(children), reference);

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);
    const hasContent = content != null && content !== "";

    return (
      <>
        {isValidElement<{ ref?: Ref<unknown> }>(children) &&
          cloneElement(children, {
            ...mergeProps(getTriggerProps(), children.props),
            ref: triggerRef,
          })}

        <FloatingComponent
          className={clsx(
            withBaseName(),
            { [withBaseName(status ?? "")]: status },
            className,
          )}
          open={open && !disabled && hasContent}
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
  },
);
