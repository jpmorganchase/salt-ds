import { CellValueProps } from "../../grid";
import { VuuCell, VuuRow } from "../model";

export const TextCellValueVuu = function TextCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const text = cell.useValue() as string;
  return <>{text}</>;
};
