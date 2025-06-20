import { Button, type ButtonProps, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type ReactNode } from "react";

import menuButtonTrigger from "./MenuButtonTrigger.css";

const withBaseName = makePrefixer("saltMenuButtonTrigger");

export interface MenuButtonTriggerProps extends ButtonProps {
  className?: string;
  hideCaret?: boolean;
  isMenuOpen?: boolean;
  children?: ReactNode;
}

export const MenuButtonTrigger = forwardRef<
  HTMLButtonElement,
  MenuButtonTriggerProps
>(function MenuButtonTrigger(
  { className, hideCaret, isMenuOpen, children, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-menu-button-trigger",
    css: menuButtonTrigger,
    window: targetWindow,
  });
  const { ExpandIcon } = useIcon();

  return (
    <Button
      ref={ref}
      className={clsx(withBaseName(), className, {
        [withBaseName("buttonOpen")]: isMenuOpen,
      })}
      data-testid="menu-button-trigger"
      {...rest}
    >
      {children}
      {!hideCaret && (
        <ExpandIcon
          className={withBaseName("caretIcon")}
          data-testid="menu-button-trigger-caret"
        />
      )}
    </Button>
  );
});
