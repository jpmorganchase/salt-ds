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
import { AppearanceContext } from "./Splitter";

const withBaseName = makePrefixer("saltSplitHandle");

export interface SplitHandleProps extends PanelResizeHandleProps {}

export function SplitHandle({ className, ...props }: SplitHandleProps) {
  const targetWindow = useWindow();
  const appearance = useContext(AppearanceContext);

  useComponentCssInjection({
    testId: "salt-split-handle",
    css: splitHandleCSS,
    window: targetWindow,
  });

  return (
    <PanelResizeHandle
      className={clsx(withBaseName(), withBaseName(appearance), className)}
      {...props}
    >
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
    </PanelResizeHandle>
  );
}
