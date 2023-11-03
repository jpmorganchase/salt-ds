import { forwardRef, ComponentPropsWithoutRef, MouseEvent } from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Button, makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./PillNext.css";
import { CloseIcon } from "@salt-ds/icons";

export interface PillNextProps extends ComponentPropsWithoutRef<"button"> {
  /* If true the pill will be disabled */
  disabled?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /* Pass an element to render an icon descriptor on the left of the label */
  icon?: React.ReactNode;
}

const withBaseName = makePrefixer("saltPillNext");

export const PillNext = forwardRef<HTMLButtonElement, PillNextProps>(
  function PillNext(
    { children, className, icon, disabled, onClose, ...restProps },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill-next",
      css: pillCss,
      window: targetWindow,
    });
    const { buttonProps, active } = useButton<HTMLButtonElement>({
      disabled,
      ...restProps,
    });
    // we do not want to spread tab index in this case because the button element
    // does not require tabindex="0" attribute
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tabIndex, ...restButtonProps } = buttonProps;

    return (
      <div className={withBaseName()}>
        <button
          data-testid="pill"
          ref={ref}
          className={clsx(
            withBaseName("action"),
            withBaseName("clickable"),
            {
              [withBaseName("active")]: active,
              [withBaseName("disabled")]: disabled,
            },
            className
          )}
          {...restButtonProps}
          {...restProps}
        >
          {icon}
          <span className={withBaseName("label")}>{children}</span>
        </button>
        {onClose && (
          <Button
            data-testid="pill-close-button"
            className={withBaseName("close-button")}
            disabled={disabled}
            onClick={onClose}
          >
            <CloseIcon />
          </Button>
        )}
      </div>
    );
  }
);
