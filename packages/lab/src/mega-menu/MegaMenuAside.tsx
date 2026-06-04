import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuAsideCss from "./MegaMenuAside.css";
import { MegaMenuColumn } from "./MegaMenuColumn";

const withBaseName = makePrefixer("saltMegaMenuAside");

export interface MegaMenuAsideProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the aside. Renders to the left of `MegaMenuMain` when placed
   * before it, and to the right when placed after.
   */
  children?: ReactNode;
}

export const MegaMenuAside = forwardRef<HTMLDivElement, MegaMenuAsideProps>(
  function MegaMenuAside({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-aside",
      css: megaMenuAsideCss,
      window: targetWindow,
    });

    return (
      <MegaMenuColumn
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
