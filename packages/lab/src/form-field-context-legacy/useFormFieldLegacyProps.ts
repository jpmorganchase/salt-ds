import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useContext } from "react";
import {
  FormFieldLegacyContext,
  type FormFieldLegacyContextValue,
} from "./FormFieldLegacyContext";

interface useFormFieldLegacyPropsProps {
  focusVisible?: boolean;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `useFormFieldProps` from `@salt-ds/core` instead.
 */
export function useFormFieldLegacyProps({
  focusVisible,
}: useFormFieldLegacyPropsProps = {}): Partial<FormFieldLegacyContextValue> {
  // TODO should this be a separate value for FocusVisible
  const { setFocused, ...formFieldProps } =
    useContext(FormFieldLegacyContext) || {};

  useIsomorphicLayoutEffect(() => {
    if (focusVisible !== undefined && setFocused) {
      setFocused(focusVisible);
    }
  }, [focusVisible, setFocused]);

  return {
    setFocused,
    ...formFieldProps,
  };
}
