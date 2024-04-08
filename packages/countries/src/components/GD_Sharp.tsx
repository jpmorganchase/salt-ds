// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GD_SharpProps = CountrySymbolProps;

const GD_Sharp = forwardRef<SVGSVGElement, GD_SharpProps>(function GD_Sharp(
  props: GD_SharpProps,
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
      data-testid="GD_Sharp"
      style={style}
      aria-label="Grenada"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-GD-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GD-a)`}>
        <path fill="#A00009" d="M0 0h72v50H0z" />
        <path fill="#008259" d="M65 43H7V7h58z" />
        <path fill="#F1B434" d="m7 43 28.194-18L7 7h58L35.194 25 65 43H7Z" />
        <path
          fill="#A00009"
          d="M26 25c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10Z"
        />
        <path
          fill="#F1B434"
          d="m36 15-2.751 6.224-6.48.828 4.78 4.674-1.254 6.736L36 29.614l5.705 3.847-1.253-6.736 4.779-4.674-6.48-.828L36.002 15Z"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M19.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm18-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm16.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 48a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm18-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm16.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default GD_Sharp;
