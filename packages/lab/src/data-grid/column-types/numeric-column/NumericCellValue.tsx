import { DataSetRow, NumericField } from "../../model";
import { CellValueProps } from "../../../grid";

export const NumericCellValue = function NumericCellValue<T>(
  props: CellValueProps<DataSetRow<T>, NumericField>
) {
  const field = props.value;
  const value = field.useValue();
  const precision = field.usePrecision();
  return <>{value?.toFixed(precision)}</>;
};
