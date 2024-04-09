// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MZ_SharpProps = CountrySymbolProps;

const MZ_Sharp = forwardRef<SVGSVGElement, MZ_SharpProps>(function MZ_Sharp(
  props: MZ_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1.44",
  };

  return (
    <CountrySymbol
      data-testid="MZ_Sharp"
      style={style}
      aria-label="Mozambique"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-MZ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-MZ-a)`}>
        <path fill="#F5F7F8" d="M0 41V9h72v32z" />
        <path fill="#31373D" d="M0 35V15h72v20z" />
        <path fill="#009B77" d="M0 9V0h72v9z" />
        <path fill="#FBD381" d="M0 50v-9h72v9z" />
        <path fill="#DD2033" d="M45 25 0-11v72l45-36Z" />
        <path
          fill="#FBD381"
          d="m19 15-2.683 6.068-6.317.807 4.66 4.558L13.438 33 19 29.25 24.562 33l-1.222-6.567L28 21.875l-6.317-.807L19 15Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MZ_Sharp;
