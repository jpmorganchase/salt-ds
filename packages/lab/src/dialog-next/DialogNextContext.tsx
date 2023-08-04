import { createContext, useContext } from "react";
import { ValidationStatus } from "@salt-ds/core";

export const DialogNextContext = createContext<{
  headingId: string;
  status?: ValidationStatus;
}>({
  headingId: "dialog-next-heading",
});

export const useDialogNextContext = () => {
  return useContext(DialogNextContext);
};
