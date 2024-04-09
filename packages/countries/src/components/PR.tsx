// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PRProps = CountrySymbolProps;

const PR = forwardRef<SVGSVGElement, PRProps>(function PR(props: PRProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1",
  };

  return (
    <CountrySymbol
      data-testid="PR"
      style={style}
      aria-label="Puerto Rico"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-PR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-PR-a)`}>
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M0 14v14h72V14H0Zm0 30v14h72V44H0Z" />
        <path fill="#005EB8" d="M48 36 0 0v72l48-36Z" />
        <path
          fill="#F5F7F8"
          d="m21 27-2.683 6.068-6.317.807 4.66 4.558L15.438 45 21 41.25 26.562 45l-1.222-6.567L30 33.875l-6.317-.807L21 27Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default PR;
