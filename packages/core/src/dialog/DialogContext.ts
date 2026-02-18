import { useContext } from "react";
import type { ValidationStatus } from "../status-indicator";
import { createContext } from "../utils";

export interface DialogContextValue {
  status?: ValidationStatus;
  id?: string;
  setId: (id: string) => void;
  contentScrollId?: string;
  setContentScrollId?: (id: string) => void;
}

export const DialogContext = createContext<DialogContextValue>(
  "DialogContext",
  {
    status: undefined,
    id: undefined,
    setId: () => {},
    contentScrollId: undefined,
    setContentScrollId: () => {},
  },
);

export const useDialogContext = () => {
  return useContext(DialogContext);
};
