import { createContext, useContext } from "react";
import type { ValidationStatus } from "../status-indicator";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  headerId: string | undefined;
  setHeaderId: (id: string | undefined) => void;
  contentScrollId?: string;
  setContentScrollId?: (id: string | undefined) => void;
}>({
  status: undefined,
  headerId: undefined,
  setHeaderId: () => {},
});

export const useDialogContext = () => {
  return useContext(DialogContext);
};
