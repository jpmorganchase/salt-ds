import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import megaMenuGroupsCss from "./MegaMenuGroups.css";

const withBaseName = makePrefixer("saltMegaMenuGroups");

export interface MegaMenuGroupsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The `MegaMenuGroup` columns of the mega menu.
   */
  children?: ReactNode;
}

export const MegaMenuGroups = forwardRef<HTMLDivElement, MegaMenuGroupsProps>(
  function MegaMenuGroups({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-groups",
      css: megaMenuGroupsCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
