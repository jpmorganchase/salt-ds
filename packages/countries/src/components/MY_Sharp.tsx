// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MY_SharpProps = CountrySymbolProps;

const MY_Sharp = forwardRef<SVGSVGElement, MY_SharpProps>(function MY_Sharp(
  props: MY_SharpProps,
  ref
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MY_Sharp"
      aria-label="Malaysia"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-MY-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-MY-a)`}>
        <path fill="#F5F7F8" d="M0 59V-4h72v63z" />
        <path fill="#DD2033" d="M36 9V0h36v9zm0 18v-9h36v9zM0 45v-9h72v9z" />
        <path fill="#004692" d="M0 32V0h36v32z" />
        <path
          fill="#FBD381"
          d="M17 9a6.97 6.97 0 0 1 3.832 1.141 9 9 0 1 0 0 11.718A7 7 0 1 1 17 9Z"
        />
        <path
          fill="#FBD381"
          d="M26.477 13.167 25 10l-1.477 3.167-3.335-.79 1.494 3.159L19 17.717l3.339.772-.01 3.511L25 19.804 27.67 22l-.009-3.51L31 17.716l-2.682-2.181 1.493-3.159-3.334.79Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MY_Sharp;
