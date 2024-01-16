// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CFProps = CountrySymbolProps;

const CF = forwardRef<SVGSVGElement, CFProps>(function CF(props: CFProps, ref) {
  const [uid] = useState(useId(props.id));

  return (
    <CountrySymbol
      data-testid="CF"
      aria-label="Central African Republic (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-CF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-CF-a)`}>
        <path fill="#FBD381" d="M0 72V56h72v16z" />
        <path fill="#F5F7F8" d="M0 38V20h72v18z" />
        <path fill="#004692" d="M0 20V0h72v20z" />
        <path fill="#008259" d="M0 56V38h72v18z" />
        <path fill="#DD2033" d="M49 72H31V0h18z" />
        <path
          fill="#FBD381"
          d="m21 4-2.087 4.72L14 9.347l3.624 3.545-.95 5.108L21 15.083 25.326 18l-.95-5.108L28 9.347l-4.913-.627L21 4Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CF;
