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
import { computeAccent } from "./utils";

const withBaseName = makePrefixer("saltSplitHandle");

export interface SplitHandleProps extends PanelResizeHandleProps {
  variant?: SplitHandleVariant;
  /**
   * Change which sides get a border displayed
   *
   * Default is based on the orientation and appearance
   * set on the parent Stepper components, ex.
   * bordered + horizontal = left-right
   * bordered + vertical = top-bottom
   * transparent = none
   *
   */
  accent?: SplitHandleAccent;
}

export type SplitHandleVariant = "primary" | "secondary" | "tertiary";
export type SplitHandleAccent =
  | "top"
  | "bottom"
  | "right"
  | "left"
  | "top-bottom"
  | "left-right"
  | "none";

export function SplitHandle({
  variant,
  accent: accentProp,
  className,
  ...props
}: SplitHandleProps) {
  const targetWindow = useWindow();
  const orientation = useContext(OrientationContext);
  const appearance = useContext(AppearanceContext);

  const accent = accentProp ?? computeAccent(orientation, appearance);

  useComponentCssInjection({
    testId: "salt-split-handle",
    css: splitHandleCSS,
    window: targetWindow,
  });

  return (
    <PanelResizeHandle
      className={clsx(
        withBaseName(),
        withBaseName(appearance),
        withBaseName("accent", accent),
        variant && withBaseName(variant),
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
