import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { useContext } from "react";
import {
  PanelResizeHandle,
  type PanelResizeHandleProps,
} from "react-resizable-panels";

import splitHandleCSS from "./SplitHandle.css";
import { AppearanceContext, OrientationContext } from "./Splitter";
import { computeAccent, computeVariant } from "./utils";

const withBaseName = makePrefixer("saltSplitHandle");

export type SplitHandleVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "transparent";

export type SplitHandleBorder =
  | "top"
  | "bottom"
  | "right"
  | "left"
  | "top-bottom"
  | "left-right"
  | "none";

export interface SplitHandleProps extends PanelResizeHandleProps {
  /**
   * Styling variant
   * @default "primary"
   */
  variant?: SplitHandleVariant;
  /**
   * Change which sides get a border displayed
   *
   * Default is based on the orientation and appearance
   * set on the parent Stepper components, ex.
   * bordered + vertical = left-right
   * bordered + horizontal = top-bottom
   * transparent = none
   */
  border?: SplitHandleBorder;
}

export function SplitHandle({
  variant: variantProp,
  border: borderProp,
  hitAreaMargins = {
    coarse: 9,
    fine: 9,
  },
  className,
  ...props
}: SplitHandleProps) {
  const targetWindow = useWindow();
  const appearance = useContext(AppearanceContext);
  const orientation = useContext(OrientationContext);

  const variant = variantProp ?? computeVariant(appearance);
  const border = borderProp ?? computeAccent(appearance, orientation);

  useComponentCssInjection({
    testId: "salt-split-handle",
    css: splitHandleCSS,
    window: targetWindow,
  });

  return (
    <PanelResizeHandle
      hitAreaMargins={hitAreaMargins}
      data-variant={variant}
      data-border={border}
      className={clsx(
        withBaseName(),
        withBaseName(appearance),
        withBaseName("border", border),
        withBaseName("variant", variant),
        className,
      )}
      {...props}
    >
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
    </PanelResizeHandle>
  );
}
