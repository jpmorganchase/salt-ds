// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CX_SharpProps = CountrySymbolProps;

const CX_Sharp = forwardRef<SVGSVGElement, CX_SharpProps>(function CX_Sharp(
  props: CX_SharpProps,
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
      data-testid="CX_Sharp"
      style={style}
      aria-label="Christmas Island"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-CX-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CX-a)`}>
        <path fill="#004692" d="M0 50h72V0H0z" />
        <path fill="#008259" d="M72-11v72L0-11h72Z" />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M62.208 14.436c-1.139.676-1.767 1.702-1.986 2.363-.432 1.306-2.247 1.39-2.798.13-.785-1.791-2.244-2.587-3.951-2.845-1.763-.267-3.648.08-4.82.489l-.989-2.833c1.504-.524 3.892-.98 6.258-.623 1.704.258 3.458.957 4.803 2.39a7.746 7.746 0 0 1 1.952-1.65c1.887-1.12 4.458-1.563 7.712-.603l-.848 2.877c-2.553-.752-4.247-.34-5.333.305Z"
          clipRule="evenodd"
        />
        <path
          fill="#F5F7F8"
          d="M9.866 12.184 8.53 10.372l-.47 2.202-2.145-.062 1.344 1.805-1.34 1.735 2.145.05.474 2.225 1.332-1.744 1.931 1.04-.485-2.223 1.934-.929-1.936-1.029.48-2.198-1.93.94ZM5.634 23.76l1.335 1.813 1.93-.94-.481 2.198 1.936 1.029-1.934.929.485 2.223-1.931-1.04-1.332 1.744-.474-2.226-2.145-.049 1.34-1.735L3.02 25.9l2.145.061.47-2.201Zm5.502 14.957 1.335 1.812 1.93-.94-.481 2.198 1.937 1.029-1.935.929.486 2.223-1.932-1.04-1.331 1.744-.474-2.226-2.146-.049 1.34-1.735-1.344-1.805 2.146.062.47-2.202Zm7.038-20.844 1.335 1.812 1.93-.94-.481 2.198 1.937 1.029-1.935.929.486 2.223-1.932-1.04-1.331 1.744-.474-2.226-2.146-.049 1.34-1.735-1.344-1.805 2.146.061.47-2.201Zm-1.08 14.555c1.012-.218 1.65-1.246 1.423-2.296-.226-1.05-1.23-1.724-2.243-1.505-1.012.218-1.65 1.246-1.423 2.296.227 1.05 1.23 1.723 2.243 1.505Z"
        />
        <circle cx="36.1" cy="24.5" r="8.5" fill="#F1B434" />
      </g>
    </CountrySymbol>
  );
});

export default CX_Sharp;
