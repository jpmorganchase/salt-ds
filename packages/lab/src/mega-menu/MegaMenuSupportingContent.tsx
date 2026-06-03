import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { MegaMenuColumn } from "./MegaMenuColumn";
import megaMenuSupportingContentCss from "./MegaMenuSupportingContent.css";

const withBaseName = makePrefixer("saltMegaMenuSupportingContent");

export interface MegaMenuSupportingContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the region.
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

  return (
    <MegaMenuColumn
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
    />
  );
});
