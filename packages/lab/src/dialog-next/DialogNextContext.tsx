import { createContext, useContext } from "react";
import { ValidationStatus } from "@salt-ds/core";

export const DialogNextContext = createContext<{
  dialogId?: string;
  status?: ValidationStatus;
}>({});

export const useDialogNextContext = () => {
  return useContext(DialogNextContext);
};
