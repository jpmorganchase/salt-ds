// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CN_SharpProps = CountrySymbolProps;

const CN_Sharp = forwardRef<SVGSVGElement, CN_SharpProps>(function CN_Sharp(
  props: CN_SharpProps,
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
      data-testid="CN_Sharp"
      style={style}
      aria-label="China"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-CN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CN-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path
          fill="#F1B434"
          d="m34.203 3-2.288 2.778-3.471-.46 1.826 3.016-1.583 3.241 3.488-1.173 2.421 2.721.286-3.58 3.124-1.72-3.241-1.298L34.203 3ZM18.074 14.934l-2.705 5.982L9 21.712l4.698 4.493-1.232 6.474 5.608-3.697 5.608 3.697-1.232-6.474 4.698-4.493-6.37-.796-2.704-5.982Zm19.606 3.69.56-3.525 2.29 2.778 3.47-.46-1.826 3.016 1.583 3.24L40.27 22.5l-2.421 2.722-.286-3.58-3.124-1.72 3.241-1.298Zm.192 8.409-1.475 3.262-3.475.435 2.563 2.45-.672 3.532 3.059-2.017 3.059 2.017-.672-3.532 2.562-2.45-3.474-.434-1.475-3.263Zm-9.257 12.622 2.289-2.778.561 3.525 3.24 1.298-3.123 1.72-.286 3.58-2.42-2.722-3.49 1.174 1.585-3.241-1.827-3.016 3.471.46Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CN_Sharp;
