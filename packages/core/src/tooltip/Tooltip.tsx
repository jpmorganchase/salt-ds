import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactNode,
  Ref,
} from "react";
import { FloatingArrow, FloatingPortal } from "@floating-ui/react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { StatusIndicator, ValidationStatus } from "../status-indicator";
import {
  makePrefixer,
  mergeProps,
  UseFloatingUIProps,
  useForkRef,
} from "../utils";
import { SaltProvider } from "../salt-provider";

import { useTooltip, UseTooltipProps } from "./useTooltip";
import tooltipCss from "./Tooltip.css";
import { useFormFieldProps } from "../form-field-context";

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
      disabled: disabledProp,
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
      a11yProps,
      disabled: formFieldDisabled,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const disabled = formFieldDisabled ?? disabledProp;
    const status = formFieldValidationStatus ?? statusProp;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tooltip",
      css: tooltipCss,
      window: targetWindow,
    });

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

        {open && !disabled && (
          <FloatingPortal>
            {/* The provider is needed to support the use case where an app has nested modes. The element that is portalled needs to have the same style as the current scope */}
            <SaltProvider>
              <div
                className={clsx(
                  withBaseName(),
                  withBaseName(status),
                  className
                )}
                ref={floatingRef}
                {...getTooltipProps()}
              >
                <div className={withBaseName("container")}>
                  {!hideIcon && (
                    <StatusIndicator
                      status={status}
                      size={1}
                      className={withBaseName("icon")}
                    />
                  )}
                  <span
                    id={a11yProps?.["aria-describedby"]}
                    className={withBaseName("content")}
                  >
                    {content}
                  </span>
                </div>
                {!hideArrow && (
                  <FloatingArrow
                    {...arrowProps}
                    className={withBaseName("arrow")}
                    strokeWidth={1}
                    fill="var(--salt-container-primary-background)"
                    stroke="var(--tooltip-status-borderColor)"
                    height={5}
                    width={10}
                  />
                )}
              </div>
            </SaltProvider>
          </FloatingPortal>
        )}
      </>
    );
  }
);
