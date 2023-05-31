import { useMemo } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import columDropTargetCss from "./ColumnDropTarget.css";

const withBaseName = makePrefixer("saltGridColumnDropTarget");

export interface ColumnDropTargetProps {
  x?: number;
}

// When the user drags a column, this component is used to show the potential
// drop target. Experimental feature. No UX yet.
export function ColumnDropTarget(props: ColumnDropTargetProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-column-drop-target",
    css: columDropTargetCss,
    window: targetWindow,
  });

  const { x = 0 } = props;

  const style = useMemo(() => {
    return {
      left: `${x - 2}px`,
    };
  }, [x]);

  if (props.x === undefined) {
    return null;
  }

  return <div className={withBaseName()} style={style} />;
}
