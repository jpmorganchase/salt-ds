import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { FloatingArrow, FloatingArrowProps } from "@floating-ui/react";
import { TooltipProps } from "./Tooltip";
import { makePrefixer } from "../utils";
import { useFormFieldProps } from "../form-field-context";

import tooltipCss from "./Tooltip.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltTooltip");

interface TooltipBaseProps extends Omit<TooltipProps, "children"> {
  arrowProps: FloatingArrowProps;
  /**
   * A string to determine the status of the Tooltip. Defaults to `info`.
   */
  status: ValidationStatus;
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
    </>
  );
};
