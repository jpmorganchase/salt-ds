import { createContext } from "@salt-ds/core";

export const CompactStepperContext = createContext<boolean>(
  "CompactStepperContext",
  false,
);
