"use client";

import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { LocalizationProvider } from "@salt-ds/date-components";

// The date adapter is a class, which Server Components can't pass to Client
// Components, so the provider is set up in a Client Component.
export function DateProvider({ children }) {
  return (
    <LocalizationProvider DateAdapter={AdapterDateFns}>
      {children}
    </LocalizationProvider>
  );
}
