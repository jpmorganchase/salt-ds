// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CMProps = CountrySymbolProps;

const CM = forwardRef<SVGSVGElement, CMProps>(function CM(props: CMProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1",
  };

  return (
    <CountrySymbol
      data-testid="CM"
      style={style}
      aria-label="Cameroon"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-CM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(90 36 36)"
        />
      </mask>
      <g mask={`url(#${uid}-CM-a)`}>
        <path fill="#FBD381" d="M0 0h72v72H0z" />
        <path fill="#005B33" d="M0 0h23v72H0z" />
        <path
          fill="#DD2033"
          fillRule="evenodd"
          d="M49 0H23v72h26V0ZM33.317 33.068 36 27l2.683 6.068 6.317.807-4.66 4.558L41.563 45 36 41.25 30.438 45l1.222-6.567L27 33.875l6.317-.807Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default CM;
