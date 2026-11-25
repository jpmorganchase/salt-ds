import { type ForwardedRef, forwardRef } from "react";
import { FormFieldLegacy as FormField } from "../../form-field-legacy";
import type { ToolbarFieldProps } from "./toolbarFieldTypes";
import { useToolbarField } from "./useToolbarField";

/**
 * @deprecated since 1.0.0-alpha.110. Use `Toolbar` from `@salt-ds/core` instead.
 */
export const ToolbarField = forwardRef(function ToolbarField(
  props: ToolbarFieldProps,
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const toolbarFieldProps = useToolbarField(props);
  return <FormField {...toolbarFieldProps} ref={forwardedRef} />;
});

ToolbarField.displayName = "ToolbarField";
