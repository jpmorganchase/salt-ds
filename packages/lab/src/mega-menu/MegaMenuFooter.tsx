import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuFooterCss from "./MegaMenuFooter.css";

const withBaseName = makePrefixer("saltMegaMenuFooter");

export interface MegaMenuFooterProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the footer. Renders as a full-width row beneath the sections,
   * at the bottom of `MegaMenuMain`.
   */
  children?: ReactNode;
}

export const MegaMenuFooter = forwardRef<HTMLDivElement, MegaMenuFooterProps>(
  function MegaMenuFooter({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-footer",
      css: megaMenuFooterCss,
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
  },
);
