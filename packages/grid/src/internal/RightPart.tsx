import { RefObject } from "react";
import { clsx } from "clsx";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import "./RightPart.css";
import { makePrefixer } from "@salt-ds/core";
import { GridColumnModel, GridRowModel } from "../Grid";
import { useActiveOnWheel } from "./gridHooks";

const withBaseName = makePrefixer("saltGridRightPart");

export interface RightPartProps<T> {
  rightRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
  leftShadow?: boolean;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  hoverOverRowKey?: string;
  setHoverOverRowKey: (key: string | undefined) => void;
  zebra?: boolean;
}

export function RightPart<T>(props: RightPartProps<T>) {
  const {
    rightRef,
    onWheel,
    columns,
    leftShadow,
    rows,
    hoverOverRowKey,
    setHoverOverRowKey,
    zebra,
  } = props;

  const tableRef = useActiveOnWheel(onWheel);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      ref={rightRef}
      className={clsx(withBaseName(), {
        [withBaseName("leftShadow")]: leftShadow,
      })}
      data-testid="grid-right-part"
    >
      <div className={withBaseName("space")}>
        <table ref={tableRef} role="presentation">
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
