import { FloatingArrow, type FloatingArrowProps } from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldHelperTextId } from "../form-field/internal/FormFieldInternalContext";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";
import type { TooltipProps } from "./Tooltip";
import tooltipCss from "./Tooltip.css";

const withBaseName = makePrefixer("saltTooltip");

interface TooltipBaseProps extends Omit<TooltipProps, "children"> {
  arrowProps: FloatingArrowProps;
  /**
   * Optional string to determine the status of the Tooltip.
   */
  status?: ValidationStatus;
}

export const TooltipBase = (props: TooltipBaseProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tooltip",
    css: tooltipCss,
    window: targetWindow,
  });

  // In a FormField, the tooltip can be used as helper text that describes the control.
  const helperTextId = useFormFieldHelperTextId();

  const { arrowProps, content, hideArrow, hideIcon, status } = props;

  return (
    <>
      <div className={withBaseName("container")}>
        {!hideIcon && status && (
          <StatusIndicator
            status={status}
            size={1}
            className={withBaseName("icon")}
          />
        )}
        <span id={helperTextId} className={withBaseName("content")}>
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
          height={6}
          width={12}
        />
      )}
    </>
  );
};
