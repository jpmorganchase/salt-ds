import { CellValueProps } from "../../grid";
import { VuuChartCell, VuuRow } from "../model";
import { useGridContext } from "../../grid/GridContext";
import "./ChartCellValueVuu.css";

export const ChartCellValueVuu = function ChartCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuChartCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const normalizedValue = cell.useNormalizedValue();
  const rowHeight = useGridContext().model.useRowHeight();
  const xStep = 5;
  const pointsStr: string[] = [`0,${rowHeight}`];

  normalizedValue.forEach((v, i) => {
    pointsStr.push(`${xStep * i},${(1 - v) * rowHeight}`);
  });

  pointsStr.push(`${xStep * (normalizedValue.length - 1)},${rowHeight}`);
  pointsStr.push(`0,${rowHeight}`);

  const width = normalizedValue.length * xStep;

  return (
    <div className={"uitkGridVuuChartCell"}>
      <svg
        height={rowHeight}
        width={width}
        viewBox={`0 0 ${width} ${rowHeight}`}
      >
        <polyline
          points={pointsStr.join(" ")}
          style={{
            fill: "lightblue",
            stroke: "blue",
            strokeWidth: 1,
          }}
        />
      </svg>
    </div>
  );
};
