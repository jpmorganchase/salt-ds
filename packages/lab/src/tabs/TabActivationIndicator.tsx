import { makePrefixer } from "@salt-ds/core";
import React, { useRef } from "react";

import { useActivationIndicator } from "./useActivationIndicator";

import "./TabActivationIndicator.css";

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
