import React, { RefObject, useRef } from "react";
import classnames from "classnames";
import { useActivationIndicator } from "./useActivationIndicator";

import "./ActivationIndicator.css";

interface ActivationIndicatorProps {
  hideBackground?: boolean;
  hideThumb?: boolean;
  orientation?: "horizontal" | "vertical";
  disableAnimation?: boolean;
  tabRef: RefObject<HTMLElement | null>;
}

export const ActivationIndicator: React.FC<ActivationIndicatorProps> = ({
  hideBackground = false,
  hideThumb = false,
  orientation = "horizontal",
  tabRef,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rootClass = "uitkActivationIndicator";
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
