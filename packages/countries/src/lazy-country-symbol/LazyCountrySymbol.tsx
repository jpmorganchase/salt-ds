import type { CountrySymbolProps } from "../country-symbol";
import type { CountryCode } from "../countryMetaMap";
import { lazyMap } from "./lazyMap";

export type LazyCountrySymbolProps = {
  /**
   * The code of the country whose symbol is shown, for example `"GB"`. The symbol is loaded lazily, and nothing is rendered when the code isn't valid.
   */
  code: CountryCode;
} & CountrySymbolProps;

export const LazyCountrySymbol = ({
  code,
  sharp,
  ...props
}: LazyCountrySymbolProps) => {
  const mapCode = sharp ? (`${code}_Sharp` as const) : code;
  const Component = lazyMap[mapCode];

  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Setting country code to ${code} which is invalid for <LazyCountrySymbol />`,
      );
    }
    return null;
  }

  return <Component {...props} />;
};
