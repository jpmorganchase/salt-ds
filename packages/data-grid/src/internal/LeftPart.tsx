import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { RefObject } from "react";

import type { GridColumnModel, GridRowModel } from "../Grid";
import type { CellValidationState } from "../GridColumn";
import { useActiveOnWheel } from "./gridHooks";
import leftPartCss from "./LeftPart.css";
import { TableBody } from "./TableBody";
import { TableColGroup } from "./TableColGroup";

const withBaseName = makePrefixer("saltGridLeftPart");

export interface LeftPartProps<T> {
  leftRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
  rightShadow?: boolean;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  hoverOverRowKey?: string;
  setHoverOverRowKey: (key: string | undefined) => void;
  zebra?: boolean;
  getRowValidationStatus?: (
    row: GridRowModel<T>,
  ) => CellValidationState | undefined;
}

export function LeftPart<T>(props: LeftPartProps<T>) {
  const {
    leftRef,
    onWheel,
    rightShadow,
    columns,
    rows,
    hoverOverRowKey,
    setHoverOverRowKey,
    zebra,
    getRowValidationStatus,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-left-part",
    css: leftPartCss,
    window: targetWindow,
  });

  const tableRef = useActiveOnWheel(onWheel);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      ref={leftRef}
      className={clsx(withBaseName(), {
        [withBaseName("rightShadow")]: rightShadow,
      })}
    >
      <div className={withBaseName("space")} data-testid="grid-left-part">
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
