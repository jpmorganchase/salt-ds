import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuSupportingActionsCss from "./MegaMenuSupportingActions.css";

const withBaseName = makePrefixer("saltMegaMenuSupportingActions");

export interface MegaMenuSupportingActionsProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the supporting actions. Renders as a full-width row beneath the
   * groups, at the bottom of `MegaMenuBody`.
   */
  children?: ReactNode;
}

export const MegaMenuSupportingActions = forwardRef<
  HTMLDivElement,
  MegaMenuSupportingActionsProps
>(function MegaMenuSupportingActions({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-supporting-actions",
    css: megaMenuSupportingActionsCss,
    window: targetWindow,
  });

  return (
    <div
      data-mega-menu-supporting-actions=""
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
    />
  );
});
