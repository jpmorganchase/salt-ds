// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FK_SharpProps = CountrySymbolProps;

const FK_Sharp = forwardRef<SVGSVGElement, FK_SharpProps>(function FK_Sharp(
  props: FK_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="FK_Sharp"
      aria-label="Falkland Islands (the) [Malvinas]"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-FK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-FK-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <mask
          id={`${uid}-FK-b`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
        </mask>
        <g mask={`url(#${uid}-FK-b)`}>
          <path
            fill="#F5F7F8"
            d="m12.79 1.005-2.12 2.12 26.197 26.198 2.12-2.121L12.792 1.005ZM7.134 6.661l-3.536 3.536 26.197 26.197 3.536-3.535L7.134 6.66Z"
          />
          <path
            fill="#DD2033"
            d="m7.134 6.661 3.535-3.535 26.198 26.197-3.536 3.535L7.134 6.662Z"
          />
          <path fill="#F5F7F8" d="M6 35h4.002V9H36V5H6v30Z" />
          <path fill="#DD2033" d="M0 35h6.002V5h30V0H0v35Z" />
        </g>
        <path fill="#FBD381" d="M64.6 37h-21v5h3v3h15v-3h3v-5Z" />
        <path
          fill="#0091DA"
          d="M43.6 19h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.1 42l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V19Z"
        />
        <mask
          id={`${uid}-FK-c`}
          x="43"
          y="19"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#0091DA"
            d="M43.6 19h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.1 42l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V19Z"
          />
        </mask>
        <g fill="#F5F7F8" mask={`url(#${uid}-FK-c)`}>
          <path d="M54.1 32c-2.625 0-2.625 2.182-5.25 2.182S46.225 32 43.6 32v3.818c2.625 0 2.625 2.182 5.25 2.182s2.625-2.182 5.25-2.182c2.624 0 2.624 2.182 5.25 2.182 2.625 0 2.625-2.182 5.25-2.182V32c-2.625 0-2.625 2.182-5.25 2.182-2.626 0-2.626-2.182-5.25-2.182Zm0-7c-2.625 0-2.625 2.182-5.25 2.182S46.225 25 43.6 25v3.818c2.625 0 2.625 2.182 5.25 2.182s2.625-2.182 5.25-2.182c2.624 0 2.624 2.182 5.25 2.182 2.625 0 2.625-2.182 5.25-2.182V25c-2.625 0-2.625 2.182-5.25 2.182-2.626 0-2.626-2.182-5.25-2.182Z" />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default FK_Sharp;
