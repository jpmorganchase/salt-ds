import { CellValueProps } from "../../../grid";
import { DataSetRow, TextField } from "../../model";

export const TextCellValue = function TextCellValue<T>(
  props: CellValueProps<DataSetRow<T>, TextField>
) {
  const field = props.value;
  const text = field.useValue();
  return <>{text}</>;
};
