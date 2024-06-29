import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import { ChevronDownIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { type ReactNode, forwardRef } from "react";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

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
        <ChevronDownIcon
          className={withBaseName("caretIcon")}
          data-testid="menu-button-trigger-caret"
        />
      )}
    </Button>
  );
});
