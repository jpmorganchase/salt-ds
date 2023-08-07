import { createContext, useContext } from "react";
import { ValidationStatus } from "@salt-ds/core";

export const DialogContext = createContext<{
  dialogId?: string;
  status?: ValidationStatus;
}>({});

export const useDialogContext = () => {
  return useContext(DialogContext);
};
