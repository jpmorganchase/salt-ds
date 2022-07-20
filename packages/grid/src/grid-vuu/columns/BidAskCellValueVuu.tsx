import { CellValueProps } from "../../grid";
import { VuuBidAskCell, VuuRow } from "../model";

export const BidAskCellValueVuu = function BidAskCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuBidAskCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const value = cell.useValue() as [number, number];
  const [bid, ask] = value;

  const text = [
    bid != null ? bid.toFixed(2) : "-",
    ask != null ? ask.toFixed(2) : "-",
  ].join(" / ");
  return <>{text}</>;
};
