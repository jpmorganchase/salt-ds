import {
  StatusIndicator,
  VALIDATION_NAMED_STATUS,
  type ValidationStatus,
} from "@salt-ds/core";
import type { CustomCellRendererProps } from "ag-grid-react";

export const StatusRenderer = (props: CustomCellRendererProps) => {
  const { value } = props;
  if (!VALIDATION_NAMED_STATUS.includes(value)) {
    return null;
  }
  const status = value as ValidationStatus;
  return <StatusIndicator status={status} />;
};
