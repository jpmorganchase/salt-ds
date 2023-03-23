import { CountrySymbolProps } from "../country-symbol";
import { lazyMap } from "./lazyMap";

export type LazyCountrySymbolProps = {
  code: keyof typeof lazyMap;
} & CountrySymbolProps;

export const LazyCountrySymbol = ({
  code,
  ...props
}: LazyCountrySymbolProps) => {
  const Component = lazyMap[code];

  if (!Component && process.env.NODE_ENV !== "production") {
    console.warn(
      `Setting country code to ${code} which is invalid for <LazyCountrySymbol />`
    );
  }

  return <Component {...props} />;
};
