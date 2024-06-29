import { createContext, useContext } from "react";
import type { ValidationStatus } from "../status-indicator";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  id: string | undefined;
}>({
  status: undefined,
  id: "",
});

export const useDialogContext = () => {
  return useContext(DialogContext);
};
