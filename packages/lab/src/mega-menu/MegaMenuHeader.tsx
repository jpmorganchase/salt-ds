import { Divider, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuHeaderCss from "./MegaMenuHeader.css";

const withBaseName = makePrefixer("saltMegaMenuHeader");

export interface MegaMenuHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu header.
   */
  children?: ReactNode;
}

export const MegaMenuHeader = forwardRef<HTMLDivElement, MegaMenuHeaderProps>(
  function MegaMenuHeader({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-header",
      css: megaMenuHeaderCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        <div className={clsx(withBaseName("content"))}>{children}</div>
        <Divider variant="tertiary" aria-hidden />
      </div>
    );
  },
);

MegaMenuHeader.displayName = "MegaMenuHeader";

/** @internal Marker used by MegaMenuGroup to identify header children. */
(MegaMenuHeader as any).__isMegaMenuHeader = true;
