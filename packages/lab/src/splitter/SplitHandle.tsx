import {
  PanelResizeHandle,
  type PanelResizeHandleProps,
} from "react-resizable-panels";
import { useWindow } from "@salt-ds/window";
import { makePrefixer, Divider } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import clsx from "clsx";

import splitHandleCSS from "./SplitHandle.css";
import { useContext } from "react";
import { OrientationContext } from "./Splitter";

const withBaseName = makePrefixer("saltSplitHandle");

export interface SplitHandleProps extends PanelResizeHandleProps {
  divider?: boolean;
}

export function SplitHandle({
  divider = false,
  className,
  ...props
}: SplitHandleProps) {
  const targetWindow = useWindow();
  const orientation = useContext(OrientationContext);

  useComponentCssInjection({
    testId: "salt-split-handle",
    css: splitHandleCSS,
    window: targetWindow,
  });

  const dividerOrientation =
    orientation === "horizontal" ? "vertical" : "horizontal";

  return (
    <>
      <PanelResizeHandle
        className={clsx(
          withBaseName(),
          divider && withBaseName("divider"),
          className,
        )}
        {...props}
      >
        <span className={withBaseName("dot")} />
        <span className={withBaseName("dot")} />
        <span className={withBaseName("dot")} />
        <span className={withBaseName("dot")} />
      </PanelResizeHandle>
      {divider && (
        <Divider variant="tertiary" orientation={dividerOrientation} />
      )}
    </>
  );
}
