import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuContainerCss from "./MegaMenuContainer.css";

const withBaseName = makePrefixer("saltMegaMenuContainer");

export interface MegaMenuContainerProps extends HTMLAttributes<HTMLElement> {
  /**
   * The content of the mega menu container, typically MegaMenuHeader, MegaMenuGroup, and MegaMenuItem components.
   */
  children?: ReactNode;
}

export const MegaMenuContainer = forwardRef<
  HTMLElement,
  MegaMenuContainerProps
>(function MegaMenuContainer({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-container",
    css: megaMenuContainerCss,
    window: targetWindow,
  });

  return (
    <nav className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
    </nav>
  );
});
