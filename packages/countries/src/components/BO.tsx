// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type BOProps = CountrySymbolProps;

const BO = forwardRef<SVGSVGElement, BOProps>(function BO(props: BOProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BO"
      aria-label="Bolivia (Plurinational State of)"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-BO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-BO-a)`}>
        <path fill="#009b77" d="M0 20v-6.11h20V20z" />
        <path fill="#fbd381" d="M0 13.889V6.11h20v7.778z" />
        <path fill="#dd2033" d="M0 6.111V.001h20v6.11z" />
        <path
          fill="#936846"
          d="m10 10.694-.722-.416-1.667 2.887.722.416zm.111 0 .722-.416 1.666 2.887-.721.416z"
        />
        <path
          fill="#dd2033"
          d="m8.333 9.167-3.61-.834v3.15c0 .68.606 1.201 1.28 1.098l2.33-.359zm3.334 0 3.61-.834v3.15c0 .68-.606 1.201-1.28 1.098l-2.33-.359z"
        />
        <path
          fill="#a00009"
          d="m5.556 7.778 3.61.833v3.056l-2.33.358a1.11 1.11 0 0 1-1.28-1.098zm8.888 0-3.61.833v3.056l2.33.358a1.11 1.11 0 0 0 1.28-1.098z"
        />
        <path
          fill="#dd2033"
          d="M6.389 7.222 10 8.056l3.611-.834v3.15c0 .68-.607 1.201-1.28 1.098L10 11.11l-2.331.359a1.11 1.11 0 0 1-1.28-1.099z"
        />
        <path
          fill="#f1b434"
          d="M8.269 11.423 10 11.111l1.731.312a1.11 1.11 0 0 0 1.308-1.13l-.095-2.917-2.944.68-2.944-.68-.095 2.918a1.11 1.11 0 0 0 1.308 1.13"
        />
        <mask
          id={`${uid}-BO-b`}
          x="8"
          y="7"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <ellipse cx="10" cy="10" fill="#d9d9d9" rx="1.944" ry="2.778" />
        </mask>
        <g mask={`url(#${uid}-BO-b)`}>
          <path
            fill="#fbd381"
            d="M11.83 12.283c-.424.605-1.062 1.05-1.83 1.05s-1.406-.445-1.83-1.05c-.425-.607-.67-1.416-.67-2.283s.245-1.676.67-2.283c.424-.605 1.062-1.05 1.83-1.05s1.406.445 1.83 1.05c.425.607.67 1.416.67 2.283s-.245 1.676-.67 2.283"
          />
          <path
            fill="#008259"
            d="M9.097 10.035a1.65 1.65 0 0 1 1.806 0c1.372.898.736 3.03-.903 3.03s-2.275-2.132-.903-3.03"
          />
        </g>
        <path
          fill="#005eb8"
          fillRule="evenodd"
          d="M11.83 12.283c-.424.605-1.062 1.05-1.83 1.05s-1.406-.445-1.83-1.05c-.425-.607-.67-1.416-.67-2.283s.245-1.676.67-2.283c.424-.605 1.062-1.05 1.83-1.05s1.406.445 1.83 1.05c.425.607.67 1.416.67 2.283s-.245 1.676-.67 2.283m-1.83.495c1.074 0 1.944-1.244 1.944-2.778S11.074 7.222 10 7.222 8.056 8.466 8.056 10s.87 2.778 1.944 2.778"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default BO;
