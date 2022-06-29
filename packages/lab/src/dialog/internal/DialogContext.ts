import { createContext } from "react";
import { ValidationState } from "@jpmorganchase/uitk-core";

export const DialogContext = createContext<{
  state?: ValidationState;
  dialogId?: string;
  setContentElement?: (node: HTMLDivElement) => void;
}>({});
