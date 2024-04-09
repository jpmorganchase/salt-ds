// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SBProps = CountrySymbolProps;

const SB = forwardRef<SVGSVGElement, SBProps>(function SB(props: SBProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1",
  };

  return (
    <CountrySymbol
      data-testid="SB"
      style={style}
      aria-label="Solomon Islands"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-SB-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-SB-a)`}>
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path fill="#009B77" d="M72 72V20L20 72h52Z" />
        <path
          fill="#FBD381"
          d="m71.85 20.939-4.242-4.243-50.912 50.912 4.243 4.242z"
        />
        <path
          fill="#F5F7F8"
          d="m34.4 4-1.788 4.045-4.212.539 3.106 3.038L30.692 16l3.708-2.5 3.708 2.5-.814-4.378L40.4 8.584l-4.212-.539L34.4 4Zm0 24-1.788 4.045-4.212.539 3.106 3.038L30.692 40l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L34.4 28Zm-12.789-7.955L23.4 16l1.788 4.045 4.212.539-3.106 3.038.814 4.378-3.708-2.5-3.708 2.5.814-4.378-3.106-3.038 4.212-.539ZM11.4 28l-1.79 4.045-4.211.539 3.106 3.038L7.692 40l3.708-2.5 3.708 2.5-.815-4.378 3.107-3.038-4.212-.539L11.4 28ZM9.611 8.045 11.4 4l1.788 4.045 4.212.539-3.106 3.038.814 4.378-3.708-2.5L7.692 16l.814-4.378L5.4 8.584l4.211-.539Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default SB;
