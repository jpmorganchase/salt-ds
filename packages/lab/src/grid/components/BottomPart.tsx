import "./BottomPart.css";
import { TableColGroup } from "./TableColGroup";
import { FooterRow } from "./FooterRow";
import { RefObject, useMemo, WheelEventHandler } from "react";
import { useGridContext } from "../GridContext";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridBottomPart");

export interface BottomPartProps<T> {
  bottomRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// The footer of all scrollable (non-pinned) columns
export function BottomPart<T>(props: BottomPartProps<T>) {
  const { bottomRef, onWheel } = props;
  const { model } = useGridContext();

  const height = model.useBottomHeight();
  const width = model.useTotalWidth();
  const bodyVisibleColumnWidth = model.useBodyVisibleColumnWidth();
  const bodyVisibleAreaLeft = model.useBodyVisibleAreaLeft();
  const bodyVisibleColumns = model.useBodyVisibleColumns();

  const spaceStyle = useMemo(() => {
    return {
      height: `${height}px`,
      width: `${width}px`,
    };
  }, [height, width]);

  const tableStyle = useMemo(() => {
    return {
      width: `${bodyVisibleColumnWidth}px`,
      left: `${bodyVisibleAreaLeft}px`,
    };
  }, [bodyVisibleColumnWidth, bodyVisibleAreaLeft]);

  return (
    <div className={withBaseName()} ref={bottomRef}>
      <div className={withBaseName("space")} style={spaceStyle}>
        <table style={tableStyle} onWheel={onWheel}>
          <TableColGroup columns={bodyVisibleColumns} />
          <tfoot>
            <FooterRow columns={bodyVisibleColumns} />
          </tfoot>
        </table>
      </div>
    </div>
  );
}
