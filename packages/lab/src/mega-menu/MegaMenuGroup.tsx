import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useMemo,
} from "react";
import megaMenuGroupCss from "./MegaMenuGroup.css";
import { MegaMenuGroupContext } from "./MegaMenuGroupContext";

const withBaseName = makePrefixer("saltMegaMenuGroup");

export interface MegaMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu group: a `MegaMenuGroupHeading` and a
   * `MegaMenuItemList` of `MegaMenuItem`s.
   */
  children?: ReactNode;
}

export const MegaMenuGroup = forwardRef<HTMLDivElement, MegaMenuGroupProps>(
  function MegaMenuGroup({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-group",
      css: megaMenuGroupCss,
      window: targetWindow,
    });

    // Generate the heading id here and share it via context: the heading wears
    // it and the list points `aria-labelledby` at it. No child inspection.
    // The group is also a navigation column (`data-mega-menu-column`).
    const headingId = useId();
    const contextValue = useMemo(() => ({ headingId }), [headingId]);

    return (
      <MegaMenuGroupContext.Provider value={contextValue}>
        <div
          data-mega-menu-column=""
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </MegaMenuGroupContext.Provider>
    );
  },
);
