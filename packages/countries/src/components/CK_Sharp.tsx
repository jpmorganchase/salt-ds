// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CK_SharpProps = CountrySymbolProps;

const CK_Sharp = forwardRef<SVGSVGElement, CK_SharpProps>(function CK_Sharp(
  props: CK_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="CK_Sharp"
      aria-label="Cook Islands (the)"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-CK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CK-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <mask
          id={`${uid}-CK-b`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
        </mask>
        <g mask={`url(#${uid}-CK-b)`}>
          <path
            fill="#F5F7F8"
            d="m12.79 1.005-2.12 2.12 26.197 26.198 2.12-2.121L12.792 1.005ZM7.134 6.661l-3.536 3.536 26.197 26.197 3.536-3.536L7.134 6.661Z"
          />
          <path
            fill="#DD2033"
            d="m7.134 6.661 3.535-3.535 26.198 26.197-3.536 3.535L7.134 6.661Z"
          />
          <path fill="#F5F7F8" d="M6 35h4.002V9H36V5H6v30Z" />
          <path fill="#DD2033" d="M0 35h6.002V5h30V0H0v35Z" />
        </g>
        <path
          fill="#F5F7F8"
          d="m43.058 28.942-.911 2.062-2.147.274 1.583 1.549-.415 2.231 1.89-1.274 1.89 1.274-.415-2.231 1.584-1.549-2.147-.274-.912-2.062Zm2.293-5.675.912-2.062.912 2.062 2.146.274-1.583 1.549.415 2.231-1.89-1.274-1.89 1.274.415-2.231-1.583-1.549 2.146-.274Zm7.738-3.205L54 18l.912 2.062 2.146.274-1.583 1.549.415 2.231L54 22.842l-1.89 1.274.415-2.231-1.583-1.549 2.147-.274ZM45.351 38.74l.912-2.061.911 2.062 2.147.274-1.583 1.549.415 2.231-1.89-1.274-1.89 1.274.415-2.231-1.583-1.549 2.146-.274ZM54 39.883l-.911 2.062-2.147.275 1.583 1.549L52.11 46 54 44.726 55.89 46l-.415-2.231 1.583-1.55-2.146-.274L54 39.883Zm6.825-1.143.912-2.061.911 2.062 2.147.274-1.583 1.549.415 2.231-1.89-1.274-1.89 1.274.415-2.231-1.583-1.549 2.146-.274Zm4.117-9.798-.912 2.062-2.147.274 1.584 1.549-.415 2.231 1.89-1.274 1.89 1.274-.415-2.231L68 31.278l-2.147-.274-.911-2.062Zm-4.117-5.675.912-2.062.911 2.062 2.147.274-1.583 1.549.415 2.231-1.89-1.274-1.89 1.274.415-2.231-1.583-1.549 2.146-.274Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CK_Sharp;
