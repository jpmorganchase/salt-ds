import { CellValueProps } from "../../model";
import { memo } from "react";

export const NumericCellValue = memo(function NumericCellValue<T>(
  props: CellValueProps<T, number>
) {
  const { value } = props;
  if (value && !value.toFixed) {
    console.error(`Invalid value: ${JSON.stringify(value)}`);
  }
  return <>{value != null && value.toFixed ? value.toFixed(2) : ""}</>;
});
