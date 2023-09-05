import { Suspense } from "react";
import { LazyCountrySymbol } from "@salt-ds/countries";

const code = "AD" as const;

export const LazyLoading = () => (
  <Suspense fallback="Loading...">
    <LazyCountrySymbol code={code} />
  </Suspense>
);
