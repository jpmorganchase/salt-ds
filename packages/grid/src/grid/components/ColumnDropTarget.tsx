import { useGridContext } from "../GridContext";
import { FC, useMemo } from "react";
import "./ColumnDropTarget.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridColumnDropTarget");

export interface ColumnDropTargetProps {}

export const ColumnDropTarget: FC<ColumnDropTargetProps> =
  function ColumnDropTarget(props) {
    const { model } = useGridContext();
    const { columnDragAndDrop } = model;
    const currentTarget = columnDragAndDrop.useCurrentTarget();

    const x = currentTarget ? currentTarget.x : 0;

    const style = useMemo(() => {
      return {
        left: `${x}px`,
      };
    }, [x]);

    if (!currentTarget) {
      return null;
    }

    return <div className={withBaseName()} style={style} />;
  };
