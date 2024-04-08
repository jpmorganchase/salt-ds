// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LI_SharpProps = CountrySymbolProps;

const LI_Sharp = forwardRef<SVGSVGElement, LI_SharpProps>(function LI_Sharp(
  props: LI_SharpProps,
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
      data-testid="LI_Sharp"
      style={style}
      aria-label="Liechtenstein"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-LI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-LI-a)`}>
        <path fill="#DD2033" d="M0 50V25h72v25z" />
        <path fill="#004692" d="M0 25V0h72v25z" />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M21.286 5h2.428v1.6h2.429V9h-2.429v2.242a4.878 4.878 0 0 1 2.429-.642c2.682 0 4.857 2.149 4.857 4.8a4.764 4.764 0 0 1-1.619 3.578V21H15.619v-2.022A4.764 4.764 0 0 1 14 15.4c0-2.651 2.175-4.8 4.857-4.8.885 0 1.714.234 2.429.642V9h-2.429V6.6h2.429V5Zm1.214 7.225-.023-.025h.046l-.023.025Zm-.023 6.375.023-.025.023.025h-.046Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default LI_Sharp;
