// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type RS_SharpProps = CountrySymbolProps;

const RS_Sharp = forwardRef<SVGSVGElement, RS_SharpProps>(function RS_Sharp(
  props: RS_SharpProps,
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
      data-testid="RS_Sharp"
      style={style}
      aria-label="Serbia"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-RS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-RS-a)`}>
        <path fill="#F5F7F8" d="M0 50V34h72v16z" />
        <path fill="#004692" d="M0 34V16h72v18z" />
        <path
          fill="#DD2033"
          d="M0 16V0h72v16zm11 0h25v13.32c0 5.799-3.51 11.02-8.88 13.206a9.597 9.597 0 0 1-7.24 0A14.258 14.258 0 0 1 11 29.321V16Z"
        />
        <path
          fill="#F5F7F8"
          d="M30.574 20.41c-.972-.067-2.399.078-3.508.637-1 .503-1.697 1.29-1.697 2.763v.507l8.847-2.398a2.34 2.34 0 0 1-1.647 2.854l-7.2 1.951v.602l9.036-2.448a2.34 2.34 0 0 1-1.648 2.854l-7.137 1.933.473.474 7.945-2.152a2.34 2.34 0 0 1-1.648 2.854l-4.407 1.194 3.905 3.914-2.395 2.401-4.222-4.233 1.79 4.488L23.675 42l-3.387-3.395 1.786-4.476-4.23 4.24-2.395-2.4 3.848-3.858-4.687-1.27a2.34 2.34 0 0 1-1.648-2.854l8.226 2.228.473-.474-7.418-2.01a2.34 2.34 0 0 1-1.648-2.854l9.374 2.54v-.601l-7.538-2.043a2.34 2.34 0 0 1-1.647-2.854l9.185 2.489v-.578c0-1.474-.697-2.26-1.698-2.764-1.11-.558-2.536-.703-3.508-.636l-.233-3.387c1.367-.095 3.448.076 5.261.989.678.34 1.32.79 1.868 1.36a6.856 6.856 0 0 1 1.887-1.38c1.814-.913 3.895-1.083 5.261-.989l-.233 3.388Z"
        />
        <path
          fill="#DD2033"
          d="M19 24h9v5.628a5.189 5.189 0 0 1-3.081 4.742 3.492 3.492 0 0 1-2.838 0A5.189 5.189 0 0 1 19 29.628V24Z"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M25 .572h-2V2h-2v2h2v1.723a5.143 5.143 0 0 0-6.286 8.11V16h14.572v-2.166A5.143 5.143 0 0 0 25 5.724V4h2V2h-2V.572Zm-1 12.83-.024.027h.048L24 13.402Zm-3.848-.83h-.01A2.571 2.571 0 1 1 22.715 10v2.572h-2.561ZM30.43 10a2.571 2.571 0 0 1-2.572 2.572h-2.572V10a2.571 2.571 0 1 1 5.143 0Z"
          clipRule="evenodd"
        />
        <path fill="#F5F7F8" d="M24.8 24h-2v4H19v2h3.8v5h2v-5H28v-2h-3.2v-4Z" />
      </g>
    </CountrySymbol>
  );
});

export default RS_Sharp;
