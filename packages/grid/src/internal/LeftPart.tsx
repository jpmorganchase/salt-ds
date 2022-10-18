import cn from "classnames";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import { RefObject } from "react";
import "./LeftPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnModel, GridRowModel } from "../Grid";
import { useActiveOnWheel } from "./gridHooks";

const withBaseName = makePrefixer("uitkGridLeftPart");

export interface LeftPartProps<T> {
  leftRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
  isRaised?: boolean;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  hoverOverRowKey?: string;
  setHoverOverRowKey: (key: string | undefined) => void;
  zebra?: boolean;
}

export function LeftPart<T>(props: LeftPartProps<T>) {
  const {
    leftRef,
    onWheel,
    isRaised,
    columns,
    rows,
    hoverOverRowKey,
    setHoverOverRowKey,
    zebra,
  } = props;

  const tableRef = useActiveOnWheel(onWheel);

  return (
    <div
      ref={leftRef}
      className={cn(withBaseName(), {
        [withBaseName("raised")]: isRaised,
      })}
    >
      <div className={withBaseName("space")} data-testid="grid-left-part">
        <table ref={tableRef}>
          <TableColGroup columns={columns} />
          <TableBody
            columns={columns}
            rows={rows}
            hoverRowKey={hoverOverRowKey}
            setHoverRowKey={setHoverOverRowKey}
            zebra={zebra}
          />
        </table>
      </div>
    </div>
  );
}
