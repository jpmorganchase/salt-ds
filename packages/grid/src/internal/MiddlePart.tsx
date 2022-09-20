import { RefObject, WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import "./MiddlePart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnModel, GridRowModel } from "../Grid";

const withBaseName = makePrefixer("uitkGridMiddlePart");

export interface MiddlePartProps<T> {
  middleRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLTableElement>;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  hoverOverRowKey?: string;
  setHoverOverRowKey: (key: string | undefined) => void;
  midGap: number;
  zebra?: boolean;
}

export function MiddlePart<T>(props: MiddlePartProps<T>) {
  const {
    middleRef,
    onWheel,
    columns,
    rows,
    hoverOverRowKey,
    setHoverOverRowKey,
    midGap,
    zebra,
  } = props;

  return (
    <div ref={middleRef} className={withBaseName()}>
      <div className={withBaseName("space")}>
        <table onWheel={onWheel}>
          <TableColGroup columns={columns} gap={midGap} />
          <TableBody
            columns={columns}
            rows={rows}
            hoverRowKey={hoverOverRowKey}
            setHoverRowKey={setHoverOverRowKey}
            gap={midGap}
            zebra={zebra}
          />
        </table>
      </div>
    </div>
  );
}
