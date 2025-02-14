import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OverlayClassNameContextValue {
  className: string | undefined;
}

const OverlayClassNameContext = createContext<OverlayClassNameContextValue | undefined>(undefined);

export const OverlayClassNameProvider: React.FC<{ className: string, children: ReactNode }> = ({ className, children }) => {
  return (
    <OverlayClassNameContext.Provider value={{ className }}>
      {children}
    </OverlayClassNameContext.Provider>
  );
};

export const useOverlayClassName = (): OverlayClassNameContextValue => {
  const context = useContext(OverlayClassNameContext);
  return context ?? { className: undefined };
};
