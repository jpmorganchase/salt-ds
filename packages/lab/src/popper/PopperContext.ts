import { createContext, useContext } from "react";
import { Popper as ToolkitPopper } from "./Popper";

export type popperType = typeof ToolkitPopper;

export const PopperContext = createContext<popperType>(ToolkitPopper);

export const usePopper = () => useContext(PopperContext);
