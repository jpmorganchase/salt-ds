import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type WSProps = CountrySymbolProps;

const WS = forwardRef<SVGSVGElement, WSProps>(function WS(props: WSProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="WS"
      aria-label="Samoa"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-WS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-WS-a)`}>
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path fill="#004692" d="M0 44V0h44v44z" />
        <path
          fill="#F5F7F8"
          d="m12.2 17-1.788 4.045-4.212.539 3.107 3.038L8.492 29l3.708-2.5 3.71 2.5-.815-4.378 3.106-3.038-4.211-.539L12.2 17Zm14 9-1.49 3.371-3.51.449 2.589 2.532L23.11 36l3.09-2.083L29.29 36l-.678-3.648L31.2 29.82l-3.51-.449L26.2 26Zm4-18-1.788 4.045-4.212.539 3.107 3.038L26.492 20l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.211-.539L30.2 8Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default WS;
