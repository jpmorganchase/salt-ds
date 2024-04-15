// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AD_SharpProps = CountrySymbolProps;

const AD_Sharp = forwardRef<SVGSVGElement, AD_SharpProps>(function AD_Sharp(
  props: AD_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="AD_Sharp"
      aria-label="Andorra"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-AD-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-AD-a)`}>
        <path fill="#004692" d="M0 0h22v50H0z" />
        <path fill="#FBD381" d="M22 0h28v50H22z" />
        <path
          fill="#DD2033"
          d="M50 0h22v50H50zM28 17h8v8h-8zm15.835 8H36v9.846A12.859 12.859 0 0 0 43.835 25Z"
        />
        <path
          fill="#FF9E42"
          fillRule="evenodd"
          d="M32 12v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10.941a16.86 16.86 0 0 1-8 14.344V41a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-3.715a16.86 16.86 0 0 1-8-14.344V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Zm-4 5v5.941c0 5.228 3.165 9.932 8 11.905 4.835-1.973 8-6.677 8-11.905V17H28Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default AD_Sharp;
