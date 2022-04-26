import { useContext } from "react";
import { FormFieldContext, FormFieldContextValue } from "./FormFieldContext";
import { useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";

interface useFormFieldPropsProps {
  focusVisible?: boolean;
}

export function useFormFieldProps({
  focusVisible,
}: useFormFieldPropsProps = {}): Partial<FormFieldContextValue> {
  // TODO shouel this be a separate value for FocusVisible
  const { setFocused, ...formFieldProps } = useContext(FormFieldContext) || {};

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
