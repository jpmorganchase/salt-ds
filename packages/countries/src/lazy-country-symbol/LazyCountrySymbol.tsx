import { Suspense, useEffect, useState, useTransition } from "react";

import { CountrySymbolProps, CountrySymbol } from "../country-symbol";
import { lazyMap } from "./lazyMap";

export type LazyCountrySymbolProps = {
  code: keyof typeof lazyMap;
} & CountrySymbolProps;

export const LazyCountrySymbol = ({
  code: codeProp,
  ...props
}: LazyCountrySymbolProps) => {
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState(codeProp);

  useEffect(() => {
    startTransition(() => {
      setCode(codeProp);
    });
  }, [codeProp]);

  const Component = lazyMap[code];

  if (!Component && process.env.NODE_ENV !== "production") {
    console.warn(
      `Setting country code to ${codeProp} which is invalid for <LazyCountrySymbol />`
    );
  }

  return (
    <Suspense fallback={<CountrySymbol {...props} />}>
      <Component {...props} />
    </Suspense>
  );
};
