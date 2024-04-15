// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GB_NIRProps = CountrySymbolProps;

const GB_NIR = forwardRef<SVGSVGElement, GB_NIRProps>(function GB_NIR(
  props: GB_NIRProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="GB_NIR"
      aria-label="Northern Ireland"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-GB-NIR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-GB-NIR-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <path
          fill="#DD2033"
          d="M30.4 72h12V42H72V30H42.4V0h-12v30H0v12h30.4v30Z"
        />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M32.623 29.09 36.2 21l3.577 8.09 8.423 1.077-6.213 6.077L43.617 45 36.2 40l-7.416 5 1.629-8.756-6.213-6.077 8.423-1.076ZM38.2 30h-3v2h-2v7h5v-2h2v-3h-2v-4Z"
          clipRule="evenodd"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M34.2 4h3v2h3v3h-3v2.803a6 6 0 0 1 7 9.67V24h-17v-2.528a6 6 0 0 1 7-9.67V9h-3V6h3V4Zm1.5 9.031L35.672 13h.056l-.028.031ZM35.672 21l.028-.031.028.031h-.056Z"
          clipRule="evenodd"
        />
        <path
          fill="#DD2033"
          d="M28.2 17a3 3 0 0 0 3 3h3v-3a3 3 0 0 0-6 0Zm12 3a3 3 0 1 0-3-3v3h3Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GB_NIR;
