import { useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useRegisterColumn } from "./MegaMenuGridContext";

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
 * Registers as a navigable column; its custom-region focusables are discovered
 * by the scoped fallback in `buildModelFromRegistry`.
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

  const registerColumn = useRegisterColumn();
  const columnRef = useForkRef<HTMLDivElement>(ref, registerColumn);

  return (
    <div className={clsx(baseClassName, className)} ref={columnRef} {...rest} />
  );
});
