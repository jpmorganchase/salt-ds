import { FlexLayout } from "@salt-ds/core";
import { LazyCountrySymbol } from "@salt-ds/countries";
import { Suspense } from "react";

const code = "AD" as const;

export const LazyLoading = () => (
  <Suspense fallback="Loading...">
    <FlexLayout>
      <LazyCountrySymbol code={code} />
      <LazyCountrySymbol code={code} sharp />
    </FlexLayout>
  </Suspense>
);
