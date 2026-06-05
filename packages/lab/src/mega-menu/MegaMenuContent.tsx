import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuContentCss from "./MegaMenuContent.css";

const withBaseName = makePrefixer("saltMegaMenuContent");

export interface MegaMenuContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content. Renders to the left of `MegaMenuBody` when placed before it,
   * and to the right when placed after.
   */
  children?: ReactNode;
}

export const MegaMenuContent = forwardRef<HTMLDivElement, MegaMenuContentProps>(
  function MegaMenuContent({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-content",
      css: megaMenuContentCss,
      window: targetWindow,
    });

    // Side content is also a navigation column (`data-mega-menu-column`).
    return (
      <div
        data-mega-menu-column=""
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
