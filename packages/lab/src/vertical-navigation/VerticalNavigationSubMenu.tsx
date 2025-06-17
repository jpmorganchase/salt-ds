import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import verticalNavigationSubMenuCss from "./VerticalNavigationSubMenu.css";

export interface VerticalNavigationSubMenuProps
  extends ComponentPropsWithoutRef<"ul"> {}

const withBaseName = makePrefixer("saltVerticalNavigationSubMenu");

export const VerticalNavigationSubMenu = forwardRef<
  HTMLUListElement,
  VerticalNavigationSubMenuProps
>(function VerticalNavigationSubMenu(props, ref) {
  const { children, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-sub-menu",
    css: verticalNavigationSubMenuCss,
    window: targetWindow,
  });

  return (
    <ul ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      {children}
    </ul>
  );
});
