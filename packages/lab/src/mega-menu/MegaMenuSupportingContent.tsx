import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuSupportingContentCss from "./MegaMenuSupportingContent.css";

const withBaseName = makePrefixer("saltMegaMenuSupportingContent");

export interface MegaMenuSupportingContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content. Renders to the left of `MegaMenuBody` when placed before it,
   * and to the right when placed after.
   */
  children?: ReactNode;
}

export const MegaMenuSupportingContent = forwardRef<
  HTMLDivElement,
  MegaMenuSupportingContentProps
>(function MegaMenuSupportingContent({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-supporting-content",
    css: megaMenuSupportingContentCss,
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
});
