import { ForwardedRef, forwardRef } from "react";
import { ToolbarFieldProps } from "./toolbarFieldTypes";
import { useToolbarField } from "./useToolbarField";

import { FormField } from "@jpmorganchase/uitk-core";
import "./ToolbarField.css";

export const ToolbarField = forwardRef(function ToolbarField(
  props: ToolbarFieldProps,
  forwardedRef?: ForwardedRef<HTMLDivElement>
) {
  const toolbarFieldProps = useToolbarField(props);
  return <FormField {...toolbarFieldProps} ref={forwardedRef} />;
});

ToolbarField.displayName = "ToolbarField";
