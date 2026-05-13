import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuItemContent from "./MegaMenuItemContent.css";

const withBaseName = makePrefixer("saltMegaMenuItemContent");

export interface MegaMenuItemContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Mega Menu Item.
   */
  children?: ReactNode;
}

export const MegaMenuItemContent = forwardRef<
  HTMLDivElement,
  MegaMenuItemContentProps
>(function MegaMenuItemContent({ children, className, ...restProps }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-item-content",
    css: megaMenuItemContent,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...restProps} ref={ref}>
      {children}
    </div>
  );
});
