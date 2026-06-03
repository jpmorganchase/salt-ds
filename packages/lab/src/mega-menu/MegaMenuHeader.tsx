import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuHeaderCss from "./MegaMenuHeader.css";

const withBaseName = makePrefixer("saltMegaMenuHeader");

export interface MegaMenuHeaderProps extends ComponentPropsWithoutRef<"div"> {
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
      </div>
    );
  },
);
