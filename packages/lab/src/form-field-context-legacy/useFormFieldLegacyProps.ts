import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useContext } from "react";
import {
  FormFieldLegacyContext,
  type FormFieldLegacyContextValue,
} from "./FormFieldLegacyContext";

interface useFormFieldLegacyPropsProps {
  focusVisible?: boolean;
}

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
