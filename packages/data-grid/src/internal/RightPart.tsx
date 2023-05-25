import { RefObject } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import { CellValidationState } from "../GridColumn";
import { GridColumnModel, GridRowModel } from "../Grid";

import { useActiveOnWheel } from "./gridHooks";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";

import rightPartCss from "./RightPart.css";

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
  getRowValidationStatus?: (
    row: GridRowModel<T>
  ) => CellValidationState | undefined;
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
    getRowValidationStatus,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-right-part",
    css: rightPartCss,
    window: targetWindow,
  });

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
            getRowValidationStatus={getRowValidationStatus}
          />
        </table>
      </div>
    </div>
  );
}
