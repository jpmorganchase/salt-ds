import { createContext } from "react";
import { ValidationStatus } from "@jpmorganchase/uitk-core";

export const DialogContext = createContext<{
  status?: ValidationStatus;
  dialogId?: string;
  setContentElement?: (node: HTMLDivElement) => void;
}>({});
