import { createContext, useContext } from "react";

import { BpType, BreakpointsContextType } from "./types";

export const createBreakpointsContext = <BP extends BpType>() => {
  const BreakpointsContext = createContext<BreakpointsContextType<BP>>(
    {} as BreakpointsContextType<BP>
  );

  const useBreakpointsContext = () => useContext(BreakpointsContext);

  return {
    BreakpointsContext,
    useBreakpointsContext,
  };
};
