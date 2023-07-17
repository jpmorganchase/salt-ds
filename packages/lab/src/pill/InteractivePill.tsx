import { forwardRef, PropsWithChildren, useState } from "react";
import { makePrefixer, useButton } from "@salt-ds/core";
import clsx from "clsx";
import { PillProps } from "./Pill";
import { PillCloseButton } from "./PillCloseButton";

const withBaseName = makePrefixer("saltPill");

export const InteractivePill = forwardRef<
  HTMLDivElement,
  PropsWithChildren<PillProps>
>(function InteractivePill(
  { disabled, onClick, className, onClose, children, icon, ...restProps },
  ref
) {
  const clickable = onClick !== undefined;
  const closable = onClose !== undefined;
  const {
    buttonProps: { disabled: disabledAttribute, ...buttonProps },
    active,
  } = useButton<HTMLDivElement>({
    disabled: disabled || !clickable,
    onClick,
    onKeyUp: clickable
      ? (e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            onClick?.(e);
          }
          restProps.onKeyUp?.(e);
        }
      : restProps.onKeyUp,
    onKeyDown: closable
      ? (e) => {
          if (disabled) return;
          if (e.key === "Backspace" || e.key === "Delete") {
            onClose(e);
          }
          restProps.onKeyDown?.(e);
        }
      : restProps.onKeyDown,
  });
  const [nestedHover, setNestedHover] = useState(false);
  const handleNestedMouseEnter = () => {
    setNestedHover(true);
  };
  const handleNestedMouseLeave = () => {
    setNestedHover(false);
  };

  return (
    <div
      data-testid="pill"
      ref={ref}
      role={clickable ? "button" : undefined}
      aria-roledescription={closable ? "Closable pill" : undefined}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("clickable")]: clickable,
          [withBaseName("active")]: clickable && active,
          [withBaseName("closable")]: closable,
          [withBaseName("nestedHover")]: nestedHover,
        },
        className
      )}
      {...buttonProps}
      tabIndex={closable ? (disabled ? -1 : 0) : buttonProps.tabIndex}
      aria-disabled={disabled ? true : undefined}
      {...restProps}
    >
      {icon}
      <span className={withBaseName("label")}>{children}</span>
      {closable ? (
        <PillCloseButton
          disabled={disabled}
          onMouseEnter={handleNestedMouseEnter}
          onMouseLeave={handleNestedMouseLeave}
          onClick={onClose}
        />
      ) : null}
    </div>
  );
});
