// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PF_SharpProps = CountrySymbolProps;

const PF_Sharp = forwardRef<SVGSVGElement, PF_SharpProps>(function PF_Sharp(
  props: PF_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="PF_Sharp"
      aria-label="French Polynesia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-PF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-PF-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M0 42V8h72v34z" />
        <mask
          id={`${uid}-PF-b`}
          x="21"
          y="10"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <circle cx="36" cy="25" r="15" fill="#D9D9D9" />
        </mask>
        <g mask={`url(#${uid}-PF-b)`}>
          <path
            fill="#005EB8"
            d="M32.25 26.636c.937-.818 1.874-1.636 3.749-1.636s2.813.818 3.75 1.636c.938.819 1.875 1.637 3.75 1.637 1.876 0 2.813-.818 3.75-1.637C48.188 25.818 49.126 25 51 25v5.727c-1.875 0-2.813.818-3.75 1.637-.938.818-1.875 1.636-3.75 1.636-1.876 0-2.813-.818-3.75-1.636-.938-.819-1.876-1.637-3.751-1.637s-2.812.818-3.75 1.637C31.312 33.182 30.374 34 28.5 34s-2.812-.818-3.75-1.636c-.937-.819-1.874-1.637-3.749-1.637V25c1.875 0 2.812.818 3.75 1.636.937.819 1.875 1.637 3.75 1.637 1.874 0 2.812-.818 3.75-1.637Zm0 10c.937-.818 1.874-1.636 3.749-1.636s2.813.818 3.75 1.636c.938.819 1.875 1.637 3.75 1.637 1.876 0 2.813-.818 3.75-1.637C48.188 35.818 49.126 35 51 35v5.727c-1.875 0-2.813.818-3.75 1.637-.938.818-1.875 1.636-3.75 1.636-1.876 0-2.813-.818-3.75-1.636-.938-.819-1.876-1.637-3.751-1.637s-2.812.818-3.75 1.637C31.312 43.182 30.374 44 28.5 44s-2.812-.818-3.75-1.636c-.937-.819-1.874-1.637-3.749-1.637V35c1.875 0 2.812.818 3.75 1.636.937.819 1.875 1.637 3.75 1.637 1.874 0 2.812-.818 3.75-1.637Z"
          />
          <path fill="#F1B434" d="M17 10h38v14H17z" />
        </g>
        <path fill="#DD2033" d="M38.2 13h-4v12h4V13Z" />
        <path
          fill="#DD2033"
          d="M31 25v-6h-4v6a7 7 0 0 0 7 7h4a7 7 0 0 0 7-7v-6h-4v6a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default PF_Sharp;
