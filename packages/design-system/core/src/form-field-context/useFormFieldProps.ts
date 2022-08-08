import { useContext } from "react";
import { useIsomorphicLayoutEffect } from "../utils";
import { FormFieldContext, FormFieldContextValue } from "./FormFieldContext";

interface useFormFieldPropsProps {
  focusVisible?: boolean;
}

export function useFormFieldProps({
  focusVisible,
}: useFormFieldPropsProps = {}): Partial<FormFieldContextValue> {
  // TODO should this be a separate value for FocusVisible
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
