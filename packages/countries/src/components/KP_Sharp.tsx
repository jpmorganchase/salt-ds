// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KP_SharpProps = CountrySymbolProps;

const KP_Sharp = forwardRef<SVGSVGElement, KP_SharpProps>(function KP_Sharp(
  props: KP_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="KP_Sharp"
      aria-label="Korea (the Democratic People&#39;s Republic of)"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-KP-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-KP-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M0 45V5h72v40z" />
        <path fill="#DD2033" d="M0 40V10h72v30z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M22 13c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12Zm-2.751 8.993L22 15.769l2.752 6.224 6.479.828-4.78 4.674 1.254 6.736L22 30.385l-5.705 3.846 1.253-6.736-4.779-4.674 6.48-.828Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default KP_Sharp;
