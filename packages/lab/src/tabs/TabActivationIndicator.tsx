import { makePrefixer } from "@salt-ds/core";
import React, { useRef } from "react";

import { useActivationIndicator } from "./useActivationIndicator";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import tabActivationIndicatorCss from "./TabActivationIndicator.css";

interface TabActivationIndicatorProps {
  hideThumb?: boolean;
  orientation?: "horizontal" | "vertical";
  disableAnimation?: boolean;
  tabId?: string;
}

const withBaseName = makePrefixer("saltTabActivationIndicator");

export const TabActivationIndicator = ({
  hideThumb = false,
  orientation = "horizontal",
  tabId,
}: TabActivationIndicatorProps) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-tab-activation-indicator",
    css: tabActivationIndicatorCss,
    window: targetWindow,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const style = useActivationIndicator({
    rootRef,
    tabId,
    orientation,
  });

  return (
    <div className={withBaseName()} ref={rootRef}>
      {hideThumb === false ? (
        <div className={withBaseName("thumb")} style={style} />
      ) : null}
    </div>
  );
};
