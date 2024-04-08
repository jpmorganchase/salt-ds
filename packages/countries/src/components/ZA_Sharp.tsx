// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ZA_SharpProps = CountrySymbolProps;

const ZA_Sharp = forwardRef<SVGSVGElement, ZA_SharpProps>(function ZA_Sharp(
  props: ZA_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
  };

  return (
    <CountrySymbol
      data-testid="ZA_Sharp"
      style={style}
      aria-label="South Africa"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-ZA-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-ZA-a)`}>
        <path fill="#DD2033" d="M0 0v19h72V0z" />
        <path fill="#005EB8" d="M0 31v19h72V31z" />
        <path fill="#F5F7F8" d="M72 14H43.8l-32-25v72l32-25H72V14Z" />
        <path fill="#008259" d="M72 31H42.133L-1 64.8v-79.6L42.133 19H72v12Z" />
        <path fill="#F1B434" d="M-3.6-2v54l36-27-36-27Z" />
        <path fill="#31373D" d="m24.4 25-48-36v72l48-36Z" />
      </g>
    </CountrySymbol>
  );
});

export default ZA_Sharp;
