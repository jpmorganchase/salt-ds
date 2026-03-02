import { useContext } from "react";
import type { ValidationStatus } from "../status-indicator";
import { createContext } from "../utils";

export interface DialogContextValue {
  status?: ValidationStatus;
  id?: string;
  setId?: (id: string) => void;
  dialogId?: string;
  setDialogId?: (id: string) => void;
}

export const DialogContext = createContext<DialogContextValue>(
  "DialogContext",
  {
    status: undefined,
    id: undefined,
    setId: () => {},
    dialogId: undefined,
    setDialogId: () => {},
  },
);

export const useDialogContext = () => {
  return useContext(DialogContext);
};
