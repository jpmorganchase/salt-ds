import { type ForwardedRef, forwardRef } from "react";
import { FormFieldLegacy as FormField } from "../../form-field-legacy";
import type { ToolbarFieldProps } from "./toolbarFieldTypes";
import { useToolbarField } from "./useToolbarField";

export const ToolbarField = forwardRef(function ToolbarField(
  props: ToolbarFieldProps,
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const toolbarFieldProps = useToolbarField(props);
  return <FormField {...toolbarFieldProps} ref={forwardedRef} />;
});

ToolbarField.displayName = "ToolbarField";
