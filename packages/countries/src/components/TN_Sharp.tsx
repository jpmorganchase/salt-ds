// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type TN_SharpProps = CountrySymbolProps;

const TN_Sharp = forwardRef<SVGSVGElement, TN_SharpProps>(function TN_Sharp(
  props: TN_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TN_Sharp"
      aria-label="Tunisia"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-TN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-TN-a)`}>
        <path fill="#dd2033" d="M0 0h29v20H0z" />
        <path
          fill="#f5f7f8"
          fillRule="evenodd"
          d="M14.5 18.4c4.671 0 8.458-3.76 8.458-8.4S19.171 1.6 14.5 1.6 6.042 5.36 6.042 10s3.787 8.4 8.458 8.4m1.538-13.207c1.455 0 2.762.64 3.663 1.66-1.09-1.749-3.012-2.91-5.201-2.91-3.397 0-6.152 2.797-6.152 6.248s2.755 6.248 6.152 6.248c2.189 0 4.11-1.161 5.201-2.91a4.88 4.88 0 0 1-3.663 1.66c-2.718 0-4.921-2.238-4.921-4.998s2.203-4.998 4.92-4.998m1.16 3.344 2.326-.914-.9 2.362 1.465 1.924-2.45-.028-1.42 2.103-.483-2.514-2.475-.49 2.07-1.443-.027-2.488z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default TN_Sharp;
