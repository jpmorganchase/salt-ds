import type { CustomCellRendererProps } from "ag-grid-react";
import { countryMetaMap } from "@salt-ds/countries";

export const FlagRenderer = (props: CustomCellRendererProps) => {
  const isoCode = props.value as keyof typeof countryMetaMap;
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "row",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        alignItems: "center",
      }}
    >
      <span
        className={`saltCountrySharp-${isoCode}`}
        aria-label={countryMetaMap[isoCode]?.countryName}
      />
    </div>
  );
};
