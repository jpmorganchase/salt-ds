import { createContext } from "react";
import { State } from "../State";

export const DialogContext = createContext<{
  state?: State;
  dialogId?: string;
  setContentElement?: (node: HTMLDivElement) => void;
}>({});
