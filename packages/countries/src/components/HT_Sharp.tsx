// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type HT_SharpProps = CountrySymbolProps;

const HT_Sharp = forwardRef<SVGSVGElement, HT_SharpProps>(function HT_Sharp(
  props: HT_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="HT_Sharp"
      aria-label="Haiti"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-HT-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-HT-a)`}>
        <path fill="#004692" d="M29 0v10H0V0z" />
        <path fill="#dd2033" d="M29 10v10H0V10z" />
        <path fill="#f5f7f8" d="M8.056 4h12.889v12H8.056z" />
        <path
          fill="#004692"
          d="M13.939 15.877a3.8 3.8 0 0 1-.899-.191 3.8 3.8 0 0 1-1.57-.495A3.786 3.786 0 0 1 10.07 10l.582.334c.187-.443.461-.858.825-1.219l.555.551a3.8 3.8 0 0 1 .944-.761l1.58 2.717 1.64-2.822c.332.19.625.423.875.687l.4-.398c.375.373.66.8.856 1.257L18.93 10a3.985 3.985 0 0 1-1.474 5.464 4.03 4.03 0 0 1-2.323.525 3.9 3.9 0 0 1-1.194-.113"
        />
        <path fill="#008259" d="m8 16 1.622-1.248a8 8 0 0 1 9.756 0L21 16z" />
        <path fill="#936846" d="M14.258 7.6h.806v5.6h-.806z" />
        <path
          fill="#009b77"
          d="m14.863 4.8.644 1.373 1.455-.343-.652 1.369 1.17.945-1.456.335.004 1.521-1.165-.952-1.166.952.004-1.521-1.457-.335 1.17-.945-.651-1.369 1.455.343z"
        />
      </g>
    </CountrySymbol>
  );
});

export default HT_Sharp;
