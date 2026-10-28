import { useEffect, useRef } from "react";
import { useFormFieldProps } from "./useFormFieldProps";

/**
 * Warns in development when a form control's `aria-label` is ignored because
 * a rendered `FormFieldLabel` names the control through `aria-labelledby`.
 *
 * @param componentName - Name of the form control, used in the warning.
 * @param ariaLabel - The `aria-label` passed to the form control.
 * @param formFieldLabelledBy - The `FormField` label id applied to the control.
 */
export function useFormFieldAriaLabelWarning(
  componentName: string,
  ariaLabel: string | undefined,
  formFieldLabelledBy: string | undefined,
) {
  const { formFieldRef } = useFormFieldProps();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (warnedRef.current || !ariaLabel || !formFieldLabelledBy) {
        return;
      }

      const label =
        formFieldRef?.current?.ownerDocument.getElementById(
          formFieldLabelledBy,
        );
      if (!label) {
        return;
      }

      warnedRef.current = true;
      console.warn(
        `Salt: ${componentName} \`aria-label\` "${ariaLabel}" is ignored because FormFieldLabel "${label.textContent?.trim()}" provides the accessible name. Use \`aria-labelledby\` to add to the name, or \`aria-describedby\` to add a description.`,
      );
    }
  }, [componentName, ariaLabel, formFieldLabelledBy, formFieldRef]);
}
