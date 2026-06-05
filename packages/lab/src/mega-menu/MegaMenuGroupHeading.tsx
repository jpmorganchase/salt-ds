import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuGroupHeadingCss from "./MegaMenuGroupHeading.css";
import { useMegaMenuGroup } from "./MegaMenuGroupContext";

const withBaseName = makePrefixer("saltMegaMenuGroupHeading");

export interface MegaMenuGroupHeadingProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu group heading.
   */
  children?: ReactNode;
}

export const MegaMenuGroupHeading = forwardRef<
  HTMLDivElement,
  MegaMenuGroupHeadingProps
>(function MegaMenuGroupHeading({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-group-heading",
    css: megaMenuGroupHeadingCss,
    window: targetWindow,
  });

  // The group owns the id and shares it via context; the heading wears it so
  // the sibling `MegaMenuItemList` can reference it with `aria-labelledby`.
  const { headingId } = useMegaMenuGroup() ?? {};

  return (
    <div
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
      id={headingId}
    >
      <div className={clsx(withBaseName("content"))}>{children}</div>
    </div>
  );
});
