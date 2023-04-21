import { StatusIndicator } from "@salt-ds/core";
import { createContext, useContext } from "react";
import { CellValidationState, GridColumn, GridColumnProps } from "./GridColumn";

export const RowValidationStatusContext = createContext<{
  status?: CellValidationState;
}>({});

export type RowValidationStatusColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowValidationStatusColumn<T>(
  props: RowValidationStatusColumnProps<T>
) {
  return (
    <GridColumn
      aria-label="Row status"
      defaultWidth={30}
      cellValueComponent={RowValidationCell}
      {...props}
    />
  );
}

const knownStatus = new Set(["error", "warning", "success"]);

function RowValidationCell() {
  const rowValidationContext = useContext(RowValidationStatusContext);
  if (
    !rowValidationContext?.status ||
    !knownStatus.has(rowValidationContext.status)
  )
    return null;

  const validationStatus = rowValidationContext.status;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <StatusIndicator
        aria-label={`Row ${validationStatus}`}
        status={validationStatus}
      />
    </div>
  );
}
