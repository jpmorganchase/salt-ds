import { useContext } from "react";
import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  FormFieldLegacyContext,
  FormFieldLegacyContextValue,
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
