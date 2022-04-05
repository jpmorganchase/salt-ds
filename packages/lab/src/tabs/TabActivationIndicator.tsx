import React, { RefObject, useRef } from "react";
import classnames from "classnames";
import { useActivationIndicator } from "./useActivationIndicator";

import "./TabActivationIndicator.css";

interface TabActivationIndicatorProps {
  hideBackground?: boolean;
  hideThumb?: boolean;
  orientation?: "horizontal" | "vertical";
  disableAnimation?: boolean;
  tabRef: RefObject<HTMLElement | null>;
}

export const TabActivationIndicator: React.FC<TabActivationIndicatorProps> = ({
  hideBackground = false,
  hideThumb = false,
  orientation = "horizontal",
  tabRef,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rootClass = "uitkTabActivationIndicator";
  const style = useActivationIndicator(rootRef, tabRef, orientation);

  return (
    <div
      className={classnames(rootClass, `${rootClass}-${orientation}`, {
        [`${rootClass}-no-background`]: hideBackground,
      })}
      ref={rootRef}
    >
      {hideThumb === false ? (
        <div className={`${rootClass}-thumb`} style={style} />
      ) : null}
    </div>
  );
};
