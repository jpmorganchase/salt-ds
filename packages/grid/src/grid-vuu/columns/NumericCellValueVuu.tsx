import { CellValueProps } from "../../grid";
import { VuuNumericCell, VuuRow } from "../model";
import { ReactNode, useEffect, useRef } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@jpmorganchase/uitk-icons";
import "./NumericCellValueVuu.css";

export const NumericCellValueVuu = function NumericCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuNumericCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const value = cell.useValue();
  const change = cell.useLastChange();
  const precision = 2; // TODO

  const valueText =
    value !== undefined && value.toFixed ? value.toFixed(precision) : "";

  const changeStyle = [
    "uitkGridVuuNumericCell",
    change > 0 ? "changeUp" : "changeDown",
  ].join("-");

  const changeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (change !== 0) {
      const el = changeRef.current;
      if (el) {
        el.classList.remove("uitkGridVuuNumericCell-runAnimation");
        el.offsetWidth;
        el.classList.add("uitkGridVuuNumericCell-runAnimation");
      }
    }
  }, [value, change]);

  let icon: ReactNode = null;
  let changeText: string = "";

  if (change > 0) {
    icon = <ArrowUpIcon />;
    changeText = ["+", change.toFixed(precision)].join("");
  } else if (change < 0) {
    changeText = change.toFixed(precision);
    icon = <ArrowDownIcon />;
  }

  return (
    <div className={"uitkGridVuuNumericCell"}>
      <span ref={changeRef} className={changeStyle}>
        {icon}
        {changeText}
      </span>
      <span style={{}} className={"uitkGridVuuNumericCell-value"}>
        {valueText}
      </span>
    </div>
  );
};
