import { createContext, useContext } from "react";
import type { ValidationStatus } from "../status-indicator";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  headerId?: string;
  setHeaderId: (id: string) => void;
  contentScrollId?: string;
  setContentScrollId?: (id: string) => void;
}>({
  status: undefined,
  headerId: undefined,
  setHeaderId: () => {},
});

export const useDialogContext = () => {
  return useContext(DialogContext);
};
