// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LS_SharpProps = CountrySymbolProps;

const LS_Sharp = forwardRef<SVGSVGElement, LS_SharpProps>(function LS_Sharp(
  props: LS_SharpProps,
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
      data-testid="LS_Sharp"
      style={style}
      aria-label="Lesotho"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-LS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-LS-a)`}>
        <path fill="#F5F7F8" d="M0 50V0h72v50z" />
        <path fill="#009B77" d="M0 50V39h72v11z" />
        <path fill="#004692" d="M0 11V0h72v11z" />
        <mask
          id={`${uid}-LS-b`}
          x="28"
          y="21"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#D9D9D9"
            d="m35.767 37.158-7.693-7.693 7.693-7.692 7.692 7.692z"
          />
        </mask>
        <g fill="#31373D" mask={`url(#${uid}-LS-b)`}>
          <circle
            cx="35.767"
            cy="21.773"
            r="10.879"
            transform="rotate(-135 35.767 21.773)"
          />
          <circle
            cx="35.767"
            cy="21.773"
            r="10.879"
            transform="rotate(-135 35.767 21.773)"
          />
        </g>
        <mask
          id={`${uid}-LS-c`}
          x="23"
          y="19"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#D9D9D9"
            d="m23.8 31.96 12.04-12.04 12.04 12.04L35.84 44 23.8 31.96Z"
          />
        </mask>
        <g mask={`url(#${uid}-LS-c)`}>
          <path
            fill="#31373D"
            fillRule="evenodd"
            d="M43.442 29.396c4.248-4.249 4.248-11.137 0-15.386-4.249-4.248-11.137-4.248-15.386 0-4.248 4.249-4.248 11.137 0 15.386 4.249 4.248 11.137 4.248 15.386 0Zm2.564 2.564c5.665-5.665 5.665-14.85 0-20.514-5.665-5.665-14.85-5.665-20.514 0-5.665 5.665-5.665 14.85 0 20.514 5.665 5.665 14.85 5.665 20.514 0Z"
            clipRule="evenodd"
          />
        </g>
        <path fill="#31373D" d="M33.8 13h4v11h-4z" />
      </g>
    </CountrySymbol>
  );
});

export default LS_Sharp;
