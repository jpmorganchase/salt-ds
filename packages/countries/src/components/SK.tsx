// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SKProps = CountrySymbolProps;

const SK = forwardRef<SVGSVGElement, SKProps>(function SK(props: SKProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="SK"
      aria-label="Slovakia"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-SK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-SK-a)`}>
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#005EB8" d="M0 48V24h72v24z" />
        <path fill="#F5F7F8" d="M0 24V0h72v24z" />
        <path fill="#DD2033" d="M11.8 19h33v29.455L28.3 55l-16.5-6.545V19Z" />
        <mask
          id={`${uid}-SK-b`}
          x="11"
          y="19"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#DD2033" d="M11.8 19h33v29.455L28.3 55l-16.5-6.545V19Z" />
        </mask>
        <g mask={`url(#${uid}-SK-b)`}>
          <path
            fill="#F5F7F8"
            d="M27 22h3v3h4v3h-4v3h7v3h-7v6h-3v-6h-7v-3h7v-3h-4v-3h4v-3Z"
          />
          <path
            fill="#005EB8"
            d="M33.933 63.484C32.433 65.672 30.461 67 28.3 67c-2.16 0-4.133-1.328-5.633-3.516C21.407 65.661 19.69 67 17.8 67c-3.866 0-7-5.596-7-12.5s3.134-12.5 7-12.5c1.452 0 2.8.79 3.918 2.14C23.278 41.003 25.647 39 28.3 39s5.023 2.003 6.582 5.14C36 42.79 37.348 42 38.8 42c3.866 0 7 5.596 7 12.5S42.666 67 38.8 67c-1.891 0-3.607-1.34-4.867-3.516Z"
          />
        </g>
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M8.8 16h39v22.365c0 7.32-4.468 13.9-11.272 16.599L28.3 58.227l-8.227-3.263A17.857 17.857 0 0 1 8.8 38.364V16Zm3 3v19.365c0 6.09 3.717 11.564 9.379 13.81L28.3 55l7.121-2.825a14.857 14.857 0 0 0 9.379-13.81V19h-33Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default SK;
