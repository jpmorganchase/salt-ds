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
import { MegaMenuColumn } from "./MegaMenuColumn";
import megaMenuSectionCss from "./MegaMenuSection.css";
import { MegaMenuSectionContext } from "./MegaMenuSectionContext";

const withBaseName = makePrefixer("saltMegaMenuSection");

export interface MegaMenuSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu section: a `MegaMenuHeading` and a
   * `MegaMenuList` of `MegaMenuLink`s.
   */
  children?: ReactNode;
}

export const MegaMenuSection = forwardRef<HTMLDivElement, MegaMenuSectionProps>(
  function MegaMenuSection({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-section",
      css: megaMenuSectionCss,
      window: targetWindow,
    });

    // Generate the heading id here and share it via context: the heading wears
    // it and the list points `aria-labelledby` at it. No child inspection.
    const headingId = useId();
    const contextValue = useMemo(() => ({ headingId }), [headingId]);

    return (
      <MegaMenuSectionContext.Provider value={contextValue}>
        <MegaMenuColumn
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...rest}
        >
          {children}
        </MegaMenuColumn>
      </MegaMenuSectionContext.Provider>
    );
  },
);
