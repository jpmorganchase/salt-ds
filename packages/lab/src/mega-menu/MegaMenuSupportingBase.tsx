import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

export interface MegaMenuSupportingBaseProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Prefixed base class name applied to the column root. */
  baseClassName: string;
  /** Test id used when injecting the component's CSS. */
  cssTestId: string;
  /** Component CSS to inject. */
  css: string;
}

/**
 * Shared internal base for the supporting columns (`MegaMenuSupportingActions`
 * and `MegaMenuSupportingContent`), which differ only by their prefixer/CSS.
 * Marked as a navigable column; its custom-region focusables are discovered
 * directly from the DOM by `getModel`.
 */
export const MegaMenuSupportingBase = forwardRef<
  HTMLDivElement,
  MegaMenuSupportingBaseProps
>(function MegaMenuSupportingBase(
  { baseClassName, cssTestId, css, className, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: cssTestId,
    css,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(baseClassName, className)}
      data-mega-menu-column=""
      ref={ref}
      {...rest}
    />
  );
});
