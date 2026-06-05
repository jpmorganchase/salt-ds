import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuActionBarCss from "./MegaMenuActionBar.css";

const withBaseName = makePrefixer("saltMegaMenuActionBar");

export interface MegaMenuActionBarProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the action bar. Renders as a full-width row beneath the
   * groups, at the bottom of `MegaMenuBody`.
   */
  children?: ReactNode;
}

export const MegaMenuActionBar = forwardRef<
  HTMLDivElement,
  MegaMenuActionBarProps
>(function MegaMenuActionBar({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-action-bar",
    css: megaMenuActionBarCss,
    window: targetWindow,
  });

  return (
    <div
      data-mega-menu-band=""
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
    />
  );
});
