import { createContext, useContext } from "react";
import type { ValidationStatus } from "../status-indicator";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  id: string | undefined;
  setId: (id: string) => void;
}>({
  status: undefined,
  id: "",
  setId: () => {},
});

export const useDialogContext = () => {
  return useContext(DialogContext);
};
