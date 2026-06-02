import { makePrefixer } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { MegaMenuSupportingBase } from "./MegaMenuSupportingBase";
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
>(function MegaMenuSupportingContent(props, ref) {
  return (
    <MegaMenuSupportingBase
      baseClassName={withBaseName()}
      cssTestId="salt-mega-menu-supporting-content"
      css={megaMenuSupportingContentCss}
      ref={ref}
      {...props}
    />
  );
});
