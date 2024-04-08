// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NR_SharpProps = CountrySymbolProps;

const NR_Sharp = forwardRef<SVGSVGElement, NR_SharpProps>(function NR_Sharp(
  props: NR_SharpProps,
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
      data-testid="NR_Sharp"
      style={style}
      aria-label="Nauru"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-NR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-NR-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <path fill="#F1B434" d="M0 28V18h72v10z" />
        <path
          fill="#F5F7F8"
          d="m28 39-2.86 1.414 1.523 2.912-3.106-.624L23.163 46 21 43.574 18.837 46l-.394-3.298-3.106.624 1.523-2.912L14 39l2.86-1.414-1.523-2.912 3.106.624.394-3.298L21 34.426 23.163 32l.394 3.298 3.106-.624-1.523 2.912L28 39Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default NR_Sharp;
