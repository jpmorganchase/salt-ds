import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer } from "../utils";
import megaMenuAsideCss from "./MegaMenuAside.css";

const withBaseName = makePrefixer("saltMegaMenuAside");

export interface MegaMenuAsideProps extends ComponentPropsWithoutRef<"aside"> {
  /**
   * The content. Renders to the left of `MegaMenuContent` when placed before
   * it, and to the right when placed after.
   */
  children?: ReactNode;
}

export const MegaMenuAside = forwardRef<HTMLElement, MegaMenuAsideProps>(
  function MegaMenuAside({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-aside",
      css: megaMenuAsideCss,
      window: targetWindow,
    });

    // Side content is also a navigation column (`data-mega-menu-column`).
    return (
      <aside
        data-mega-menu-column=""
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
