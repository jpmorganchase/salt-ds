import { RefObject } from "react";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import "./MiddlePart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnModel, GridRowModel } from "../Grid";
import { useActiveOnWheel } from "./gridHooks";

const withBaseName = makePrefixer("uitkGridMiddlePart");

export interface MiddlePartProps<T> {
  middleRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
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

  const tableRef = useActiveOnWheel(onWheel);

  return (
    <div
      ref={middleRef}
      className={withBaseName()}
      data-testid="grid-middle-part"
    >
        <table ref={tableRef} role="presentation">
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
