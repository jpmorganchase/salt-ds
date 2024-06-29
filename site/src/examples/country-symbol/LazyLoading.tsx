import { LazyCountrySymbol } from "@salt-ds/countries";
import { Suspense } from "react";

const code = "AD" as const;

export const LazyLoading = () => (
  <Suspense fallback="Loading...">
    <LazyCountrySymbol code={code} />
  </Suspense>
);
