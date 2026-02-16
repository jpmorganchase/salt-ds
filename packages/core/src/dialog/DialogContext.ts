import { useContext } from "react";
import type { ValidationStatus } from "../status-indicator";
import { createContext } from "../utils";

export interface DialogContextValue {
  status?: ValidationStatus;
  headerId?: string;
  setHeaderId: (id: string) => void;
  contentScrollId?: string;
  setContentScrollId?: (id: string) => void;
}

export const DialogContext = createContext<DialogContextValue>(
  "DialogContext",
  {
    status: undefined,
    headerId: undefined,
    setHeaderId: () => {},
    contentScrollId: undefined,
    setContentScrollId: () => {},
  },
);

export const useDialogContext = () => {
  return useContext(DialogContext);
};
