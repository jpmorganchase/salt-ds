import { createContext, useContext } from "react";
import { ValidationStatus } from "@salt-ds/core";

export const DialogContext = createContext<{
  status?: ValidationStatus;
}>({
  status: undefined,
});

export const useDialogContext = () => {
  return useContext(DialogContext);
};
