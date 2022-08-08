import { CellValueProps } from "../../model";
import { memo } from "react";

export const TextCellValue = memo(function TextCellValue<T>(
  props: CellValueProps<T, string>
) {
  // useTraceUpdate(props);
  const { value } = props;
  return <>{value}</>;
});
