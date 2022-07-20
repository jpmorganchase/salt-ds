import { useMemo, WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import { FooterRow } from "./FooterRow";
import { useGridContext } from "../GridContext";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridBottomLeftPart");

export interface BottomLeftPartProps<T> {
  onWheel: WheelEventHandler<HTMLTableElement>;
}

export function BottomLeftPart<T>(props: BottomLeftPartProps<T>) {
  const { onWheel } = props;
  const { model } = useGridContext();

  const leftColumns = model.useLeftColumns();
  const leftWidth = model.useLeftWidth();

  const tableStyle = useMemo(() => {
    return {
      width: `${leftWidth}px`,
    };
  }, [leftWidth]);

  return (
    <div className={withBaseName()}>
      <table style={tableStyle} onWheel={onWheel}>
        <TableColGroup columns={leftColumns} />
        <tfoot>
          <FooterRow columns={leftColumns} />
        </tfoot>
      </table>
    </div>
  );
}
