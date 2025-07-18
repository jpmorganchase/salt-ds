// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type PF_SharpProps = CountrySymbolProps;

const PF_Sharp = forwardRef<SVGSVGElement, PF_SharpProps>(function PF_Sharp(
  props: PF_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="PF_Sharp"
      aria-label="French Polynesia"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-PF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-PF-a)`}>
        <path fill="#dd2033" d="M0 0h29v20H0z" />
        <path fill="#f5f7f8" d="M0 16.8V3.2h29v13.6z" />
        <mask
          id={`${uid}-PF-b`}
          x="8"
          y="4"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <ellipse cx="14.5" cy="10" fill="#d9d9d9" rx="6.042" ry="6" />
        </mask>
        <g mask={`url(#${uid}-PF-b)`}>
          <path
            fill="#005eb8"
            d="M12.99 10.655c.377-.328.755-.655 1.51-.655s1.133.327 1.51.655c.378.327.755.654 1.51.654.756 0 1.134-.327 1.511-.654.378-.328.755-.655 1.51-.655v2.29c-.755 0-1.132.328-1.51.655-.377.328-.755.655-1.51.655-.756 0-1.133-.327-1.51-.655-.378-.327-.756-.654-1.511-.654s-1.133.327-1.51.654c-.378.328-.756.655-1.511.655s-1.133-.327-1.51-.655c-.378-.327-.755-.654-1.51-.654V10c.755 0 1.132.327 1.51.655.377.327.755.654 1.51.654s1.133-.327 1.51-.654m.001 4c.377-.328.755-.655 1.51-.655s1.133.327 1.51.655c.378.327.755.654 1.51.654.756 0 1.134-.327 1.511-.654.378-.328.755-.655 1.51-.655v2.29c-.755 0-1.132.328-1.51.655-.377.328-.755.655-1.51.655-.756 0-1.133-.327-1.51-.655-.378-.327-.756-.654-1.511-.654s-1.133.327-1.51.654c-.378.328-.756.655-1.511.655s-1.133-.327-1.51-.655c-.378-.327-.755-.654-1.51-.654V14c.755 0 1.132.327 1.51.655.377.327.755.654 1.51.654s1.133-.327 1.51-.654"
          />
          <path fill="#f1b434" d="M6.847 4h15.306v5.6H6.847z" />
        </g>
        <path fill="#dd2033" d="M15.386 5.2h-1.61V10h1.61z" />
        <path
          fill="#dd2033"
          d="M12.486 10V7.6h-1.611V10a2.81 2.81 0 0 0 2.82 2.8h1.61a2.81 2.81 0 0 0 2.82-2.8V7.6h-1.611V10c0 .663-.541 1.2-1.208 1.2h-1.612a1.204 1.204 0 0 1-1.208-1.2"
        />
      </g>
    </CountrySymbol>
  );
});

export default PF_Sharp;
