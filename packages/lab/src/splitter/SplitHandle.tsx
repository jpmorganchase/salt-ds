import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { PanelResizeHandle } from "react-resizable-panels";

import splitHandleCSS from "./SplitHandle.css";

const withBaseName = makePrefixer("saltSplitHandle");

export function SplitHandle() {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-split-handle",
    css: splitHandleCSS,
    window: targetWindow,
  });

  return (
    <PanelResizeHandle className={withBaseName()}>
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
      <span className={withBaseName("dot")} />
    </PanelResizeHandle>
  );
}
