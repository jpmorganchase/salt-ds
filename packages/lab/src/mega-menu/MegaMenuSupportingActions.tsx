import { makePrefixer } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuSupportingActionsCss from "./MegaMenuSupportingActions.css";
import { MegaMenuSupportingBase } from "./MegaMenuSupportingBase";

const withBaseName = makePrefixer("saltMegaMenuSupportingActions");

export interface MegaMenuSupportingActionsProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Supporting action links displayed below the menu sections.
   */
  children?: ReactNode;
}

export const MegaMenuSupportingActions = forwardRef<
  HTMLDivElement,
  MegaMenuSupportingActionsProps
>(function MegaMenuSupportingActions(props, ref) {
  return (
    <MegaMenuSupportingBase
      baseClassName={withBaseName()}
      cssTestId="salt-mega-menu-supporting-actions"
      css={megaMenuSupportingActionsCss}
      ref={ref}
      {...props}
    />
  );
});
