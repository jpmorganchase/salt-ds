import { createContext } from "react";
import { ValidationStatus } from "@salt-ds/core";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  dialogId?: string;
  setContentElement?: (node: HTMLDivElement) => void;
}>({});
