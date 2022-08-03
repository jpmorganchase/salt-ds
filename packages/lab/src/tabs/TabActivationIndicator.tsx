import { makePrefixer } from "@jpmorganchase/uitk-core";
import React, { useRef } from "react";

import { useActivationIndicator } from "./useActivationIndicator";

import "./TabActivationIndicator.css";

interface TabActivationIndicatorProps {
  hideThumb?: boolean;
  orientation?: "horizontal" | "vertical";
  disableAnimation?: boolean;
  tabId?: string;
}

const withBaseName = makePrefixer("uitkTabActivationIndicator");

export const TabActivationIndicator: React.FC<TabActivationIndicatorProps> = ({
  hideThumb = false,
  orientation = "horizontal",
  tabId,
}) => {
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
