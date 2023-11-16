import { createContext, useContext } from "react";

const StyleInjectionContext = createContext(true);

export const useStyleInjection = () => useContext(StyleInjectionContext);
export const StyleInjectionProvider = StyleInjectionContext.Provider;
