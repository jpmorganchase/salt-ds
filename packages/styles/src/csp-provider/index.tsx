import { createContext, type ReactNode, useContext } from "react";

export interface CSPContextType {
  nonce?: string;
}

const CSPContext = createContext<string | undefined>(undefined);

if (process.env.NODE_ENV !== "production") {
  CSPContext.displayName = "CSPContext";
}

export function useCSPNonce(nonce?: string): string | undefined {
  const nonceFromContext = useContext(CSPContext);
  return nonce ?? nonceFromContext;
}

export interface CSPProviderProps extends CSPContextType {
  children: ReactNode;
}

export function CSPProvider(props: CSPProviderProps) {
  const { children, nonce: nonceProp } = props;
  const nonce = useCSPNonce(nonceProp);

  return <CSPContext.Provider value={nonce}>{children}</CSPContext.Provider>;
}
