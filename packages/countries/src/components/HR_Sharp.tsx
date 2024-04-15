// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type HR_SharpProps = CountrySymbolProps;

const HR_Sharp = forwardRef<SVGSVGElement, HR_SharpProps>(function HR_Sharp(
  props: HR_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="HR_Sharp"
      aria-label="Croatia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-HR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-HR-a)`}>
        <path fill="#004692" d="M0 50V37h72v13z" />
        <path fill="#F5F7F8" d="M0 37V13h72v24z" />
        <path fill="#DD2033" d="M0 13V0h72v13z" />
        <path
          fill="#F5F7F8"
          d="M22 13h28v16c0 7.732-6.268 14-14 14s-14-6.268-14-14V13Z"
        />
        <mask
          id={`${uid}-HR-b`}
          x="22"
          y="13"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#F5F7F8"
            d="M22 13h28v16c0 7.732-6.268 14-14 14s-14-6.268-14-14V13Z"
          />
        </mask>
        <g mask={`url(#${uid}-HR-b)`}>
          <path
            fill="#DD2033"
            fillRule="evenodd"
            d="M29 13h-7v7h7v7h-7v7h7v7h-7v7h7v-7h7v7h7v-7h7v-7h-7v-7h7v-7h-7v-7h-7v7h-7v-7Zm7 14h7v-7h-7v7Zm0 7h-7v-7h7v7Zm0 0h7v7h-7v-7Z"
            clipRule="evenodd"
          />
        </g>
        <path fill="#0091DA" d="m22 6 4.5-3L31 6v7h-9V6Z" />
        <path fill="#004692" d="m31 6 5-3 5 3v7H31V6Z" />
        <path fill="#0091DA" d="m41 6 4.5-3L50 6v7h-9V6Z" />
      </g>
    </CountrySymbol>
  );
});

export default HR_Sharp;
