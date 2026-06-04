import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuHeadingCss from "./MegaMenuHeading.css";

const withBaseName = makePrefixer("saltMegaMenuHeading");

export interface MegaMenuHeadingProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu heading.
   */
  children?: ReactNode;
}

export const MegaMenuHeading = forwardRef<HTMLDivElement, MegaMenuHeadingProps>(
  function MegaMenuHeading({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-heading",
      css: megaMenuHeadingCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        <div className={clsx(withBaseName("content"))}>{children}</div>
      </div>
    );
  },
);
