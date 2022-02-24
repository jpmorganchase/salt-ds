import React, { forwardRef, ReactNode } from "react";
import classnames from "classnames";
import { makePrefixer, Button, ButtonProps } from "@brandname/core";
import { ChevronDownIcon } from "@brandname/icons";
import "./MenuTrigger.css";

const withBaseName = makePrefixer("uitkMenuTrigger");

export interface MenuTriggerProps extends ButtonProps {
  className?: string;
  hideCaret?: boolean;
  isMenuOpen?: boolean;
  children?: ReactNode;
}

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger(
    { className, hideCaret, isMenuOpen, children, ...rest },
    ref
  ) {
    return (
      <Button
        ref={ref}
        className={classnames(withBaseName(), className, {
          [withBaseName("buttonOpen")]: isMenuOpen,
        })}
        data-testid="menu-trigger-button"
        {...rest}
      >
        {children}
        {!hideCaret && (
          <ChevronDownIcon
            className={withBaseName("caretIcon")}
            data-testid="menu-trigger-button-caret"
          />
        )}
      </Button>
    );
  }
);
