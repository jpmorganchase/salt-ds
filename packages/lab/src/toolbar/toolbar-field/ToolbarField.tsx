import { ForwardedRef, forwardRef } from "react";
import { ToolbarFieldProps } from "./toolbarFieldTypes";
import { useToolbarField } from "./useToolbarField";

import { FormFieldLegacy } from "../../form-field-legacy";

export const ToolbarField = forwardRef(function ToolbarField(
  props: ToolbarFieldProps,
  forwardedRef?: ForwardedRef<HTMLDivElement>
) {
  const toolbarFieldProps = useToolbarField(props);
  return <FormFieldLegacy {...toolbarFieldProps} ref={forwardedRef} />;
});

ToolbarField.displayName = "ToolbarField";
