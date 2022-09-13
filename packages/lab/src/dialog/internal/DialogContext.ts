import { createContext } from "react";
import { ValidationStatus } from "@jpmorganchase/uitk-core";

export const DialogContext = createContext<{
  state?: ValidationStatus;
  dialogId?: string;
  setContentElement?: (node: HTMLDivElement) => void;
}>({});
