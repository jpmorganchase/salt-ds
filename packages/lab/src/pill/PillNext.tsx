import {
  forwardRef,
  MouseEvent,
  PropsWithChildren,
  HTMLAttributes,
  KeyboardEvent,
  useState,
} from "react";
import { useWindow } from "@salt-ds/window";
import { CloseSmallIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./PillNext.css";
import clsx from "clsx";

type ClickEvent = MouseEvent<Element, globalThis.MouseEvent>;

interface PillProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onClose?: (e: ClickEvent | KeyboardEvent<HTMLDivElement>) => void;
}

const withBaseName = makePrefixer("saltPill");

export const Pill = forwardRef<HTMLDivElement, PropsWithChildren<PillProps>>(
  function Pill(
    { onClose, onClick, children, className, icon, ...restProps },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill",
      css: pillCss,
      window: targetWindow,
    });

    const clickable = onClick !== undefined;
    const closable = onClose !== undefined;
    const interactive = clickable || closable;

    if (interactive) {
      return (
        <InteractivePill
          onClose={onClose}
          onClick={onClick}
          className={className}
          icon={icon}
          {...restProps}
        >
          {children}
        </InteractivePill>
      );
    }

    return (
      <div ref={ref} {...restProps} className={clsx(withBaseName(), className)}>
        {icon}
        <span className={withBaseName("label")}>{children}</span>
      </div>
    );
  }
);

const InteractivePill = forwardRef<
  HTMLDivElement,
  PropsWithChildren<PillProps>
>(function InteractivePill(
  { disabled, onClick, className, onClose, children, icon, ...restProps },
  ref
) {
  const clickable = onClick !== undefined;
  const closable = onClose !== undefined;
  const { buttonProps, active } = useButton<HTMLDivElement>({
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
          if (e.key === "Backspace") {
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
      ref={ref}
      role={clickable ? "button" : undefined}
      {...restProps}
      {...buttonProps}
      className={clsx(withBaseName(), className, {
        [withBaseName("clickable")]: clickable,
        [withBaseName("active")]: active,
        [withBaseName("closable")]: closable,
        [withBaseName("nestedHover")]: nestedHover,
      })}
      aria-disabled={disabled ? true : undefined}
      tabIndex={!disabled ? 0 : -1}
    >
      {icon}
      <span className={withBaseName("label")}>{children}</span>
      {closable ? (
        <PillCloseButton
          onMouseEnter={handleNestedMouseEnter}
          onMouseLeave={handleNestedMouseLeave}
          onClick={onClose}
        />
      ) : null}
    </div>
  );
});

const PillCloseButton = ({
  onClick,
  disabled,
  onMouseEnter,
  onMouseLeave,
}: {
  disabled?: boolean;
  onClick: (e: ClickEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const { buttonProps, active } = useButton({
    disabled,
    onClick: (e) => {
      e.stopPropagation();
      onClick(e);
    },
  });

  return (
    <div
      {...buttonProps}
      role="button"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
      aria-label="Close Pill"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={-1}
      className={clsx(withBaseName("deleteButton"), {
        [withBaseName("deleteButton-active")]: active,
      })}
    >
      <CloseSmallIcon aria-hidden />
    </div>
  );
};
