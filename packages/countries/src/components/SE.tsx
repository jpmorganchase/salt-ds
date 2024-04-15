// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SEProps = CountrySymbolProps;

const SE = forwardRef<SVGSVGElement, SEProps>(function SE(props: SEProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="SE"
      aria-label="Sweden"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-SE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-SE-a)`}>
        <path fill="#005EB8" d="M0 0h72v72H0z" />
        <path fill="#FBD381" d="M14 72h14V43h44V29H28V0H14v29H0v14h14v29Z" />
      </g>
    </CountrySymbol>
  );
});

export default SE;
