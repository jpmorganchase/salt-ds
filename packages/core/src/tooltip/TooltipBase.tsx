import { FloatingArrow, type FloatingArrowProps } from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";
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

  const { a11yProps } = useFormFieldProps();

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
    </>
  );
};
