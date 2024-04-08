// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CA_SharpProps = CountrySymbolProps;

const CA_Sharp = forwardRef<SVGSVGElement, CA_SharpProps>(function CA_Sharp(
  props: CA_SharpProps,
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
      data-testid="CA_Sharp"
      style={style}
      aria-label="Canada"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-CA-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CA-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M54 50H18V0h36z" />
        <path
          fill="#DD2033"
          d="m40.11 13.591-4.2-5.59-4.198 5.59-3.322-1.014 2.677 11.794-3.328-5.357-1.193 2.28-5.03-.749.742 5.078L20 26.827l8.821 5.583-1.08 3.544 6.613-1.792V42h2.95v-7.9l6.847 1.855-1.066-3.498.007.008L52 26.806l-2.219-1.183.742-5.078-5.03.749-1.172-2.24-3.574 5.732-.163-.535 2.636-11.61-3.11.95Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CA_Sharp;
