// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MMProps = CountrySymbolProps;

const MM = forwardRef<SVGSVGElement, MMProps>(function MM(props: MMProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
  };

  return (
    <CountrySymbol
      data-testid="MM"
      style={style}
      aria-label="Myanmar"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-MM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-MM-a)`}>
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#009B77" d="M0 48V24h72v24z" />
        <path fill="#FBD381" d="M0 24V0h72v24z" />
        <path
          fill="#F5F7F8"
          d="m36 18-5.365 12.136L18 31.75l9.32 9.115L24.874 54 36 46.5 47.125 54 44.68 40.866 54 31.751l-12.635-1.615L36 18Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MM;
