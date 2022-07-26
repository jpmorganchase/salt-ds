import React, { RefObject, useRef } from "react";
import classnames from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

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
    <div className={classnames(withBaseName())} ref={rootRef}>
      {hideThumb === false ? (
        <div className={withBaseName("thumb")} style={style} />
      ) : null}
    </div>
  );
};
