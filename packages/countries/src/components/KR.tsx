// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type KRProps = CountrySymbolProps;

const KR = forwardRef<SVGSVGElement, KRProps>(function KR(props: KRProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="KR"
      aria-label="Korea (the Republic of)"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-KR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-KR-a)`}>
        <path fill="#f5f7f8" d="M0 0h20v20H0z" />
        <path
          fill="#dd2033"
          fillRule="evenodd"
          d="M13.611 10.001a3.611 3.611 0 1 1-7.223-.003 3.611 3.611 0 0 1 7.223.003"
          clipRule="evenodd"
        />
        <path
          fill="#004692"
          fillRule="evenodd"
          d="M6.441 9.364c.114.91.281 1.923 1.696 2.027.53.032 1.56-.123 1.914-1.554.467-1.373 1.864-1.766 2.817-1.023.544.349.693.902.728 1.32-.042 1.328-.818 2.484-1.81 3-1.143.672-2.725.686-4.11-.332-.623-.578-1.496-1.647-1.235-3.438"
          clipRule="evenodd"
        />
        <path
          fill="#31373d"
          d="m5.427 2.733-2.75 2.75.59.589 2.75-2.75zm-2.75 11.785 2.75 2.75.59-.59-2.75-2.75zm10.803-1.375 1.178-1.179.59.59-1.179 1.178zm2.16-.197-1.178 1.179.59.59 1.178-1.18zm-.196 2.161 1.179-1.179.589.59-1.179 1.178zm-2.357-1.571-1.178 1.178.589.59 1.178-1.18zm-.197 2.16 1.18-1.178.588.589-1.178 1.178zm2.161-.196-1.178 1.178.59.59 1.178-1.179zm-10.213-.786-1.179-1.178.59-.59 1.178 1.179zm.982-.196-.59.589 1.179 1.178.59-.589zM3.66 6.465l2.749-2.75.59.589-2.75 2.75zm9.23-2.161 2.75 2.75.59-.59-2.75-2.75zM4.641 7.447l2.75-2.75.59.589-2.75 2.75zm0 5.107 2.75 2.75.59-.59-2.75-2.75zM15.051 4.5l-1.178-1.178.59-.59 1.178 1.18zm-3.142.786 1.178 1.179.59-.59-1.18-1.178zm4.714.786-1.179-1.179.59-.59 1.178 1.18zm-3.143.785 1.178 1.179.59-.59-1.179-1.178z"
        />
      </g>
    </CountrySymbol>
  );
});

export default KR;
