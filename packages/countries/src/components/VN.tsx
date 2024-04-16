// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type VNProps = CountrySymbolProps;

const VN = forwardRef<SVGSVGElement, VNProps>(function VN(props: VNProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="VN"
      aria-label="Viet Nam"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": false })}
      {...rest}
    >
      <mask
        id={`${uid}-VN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-VN-a)`}>
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path
          fill="#FBD381"
          d="m36 18-5.365 12.136L18 31.75l9.32 9.115L24.874 54 36 46.5 47.125 54 44.68 40.866 54 31.751l-12.635-1.615L36 18Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default VN;
