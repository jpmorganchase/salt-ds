import { createContext, useContext } from "react";
const defaultState = { focused: false };

export const FormControlContext = createContext(defaultState);
FormControlContext.displayName = "FormControlContext";

export const useFormControl = () => {
  const { focused } = useContext(FormControlContext) || {};
  return { focused };
};
