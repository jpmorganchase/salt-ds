import { CellValueProps } from "../../../grid";
import { DataSetRow, PriceField } from "../../model";

export const PriceCellValue = function PriceCellValue<T>(
  props: CellValueProps<DataSetRow<T>, PriceField>
) {
  const field = props.value;
  const value = field.useValue();
  if (!value) {
    return null;
  }
  const { currency, amount, precision } = value;
  return (
    <>
      {amount.toFixed(precision)}
      {currency}
    </>
  );
};
