import { useGridContext } from "../GridContext";
import { useMemo, WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import { FooterRow } from "./FooterRow";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridBottomRightPart");

export interface BottomRightPartProps<T> {
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// The footer of all columns pinned to the right
export function BottomRightPart<T>(props: BottomRightPartProps<T>) {
  const { onWheel } = props;
  const { model } = useGridContext();
  const rightColumns = model.useRightColumns();
  const rightWidth = model.useRightWidth();

  const tableStyle = useMemo(() => {
    return {
      width: `${rightWidth}px`,
    };
  }, [rightWidth]);

  return (
    <div className={withBaseName()}>
      <table style={tableStyle} onWheel={onWheel}>
        <TableColGroup columns={rightColumns} />
        <tfoot>
          <FooterRow columns={rightColumns} />
        </tfoot>
      </table>
    </div>
  );
}
