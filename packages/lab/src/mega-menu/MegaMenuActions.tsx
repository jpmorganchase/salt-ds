import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuActionsCss from "./MegaMenuActions.css";

const withBaseName = makePrefixer("saltMegaMenuActions");

export interface MegaMenuActionsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the actions. Place `MegaMenuActions` inside
   * `MegaMenuContent`, after `MegaMenuGroups`; it renders as a band beneath the
   * groups, spanning their width.
   */
  children?: ReactNode;
}

export const MegaMenuActions = forwardRef<HTMLDivElement, MegaMenuActionsProps>(
  function MegaMenuActions({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-actions",
      css: megaMenuActionsCss,
      window: targetWindow,
    });

    return (
      <div
        data-mega-menu-actions=""
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
