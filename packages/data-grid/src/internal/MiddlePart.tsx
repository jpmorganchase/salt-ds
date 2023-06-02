import { RefObject } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer } from "@salt-ds/core";

import { GridColumnModel, GridRowModel } from "../Grid";
import { CellValidationState } from "../GridColumn";

import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import { useActiveOnWheel } from "./gridHooks";

import middlePartCss from "./MiddlePart.css";

const withBaseName = makePrefixer("saltGridMiddlePart");

export interface MiddlePartProps<T> {
  middleRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  hoverOverRowKey?: string;
  setHoverOverRowKey: (key: string | undefined) => void;
  midGap: number;
  zebra?: boolean;
  getRowValidationStatus?: (
    row: GridRowModel<T>
  ) => CellValidationState | undefined;
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
    getRowValidationStatus,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-middle-part",
    css: middlePartCss,
    window: targetWindow,
  });

  const tableRef = useActiveOnWheel(onWheel);

  return (
    <div
      ref={middleRef}
      className={withBaseName()}
      data-testid="grid-middle-part"
    >
      <div className={withBaseName("space")}>
        <table ref={tableRef} role="presentation">
          <TableColGroup columns={columns} gap={midGap} />
          <TableBody
            columns={columns}
            rows={rows}
            hoverRowKey={hoverOverRowKey}
            setHoverRowKey={setHoverOverRowKey}
            gap={midGap}
            zebra={zebra}
            getRowValidationStatus={getRowValidationStatus}
          />
        </table>
      </div>
    </div>
  );
}
