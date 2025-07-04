// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SM_SharpProps = CountrySymbolProps;

const SM_Sharp = forwardRef<SVGSVGElement, SM_SharpProps>(function SM_Sharp(
  props: SM_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SM_Sharp"
      aria-label="San Marino"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-SM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-SM-a)`}>
        <path fill="#f5f7f8" d="M29 0v10H0V0z" />
        <path fill="#86c5fa" d="M29 10v10H0V10z" />
        <path
          fill="#009b77"
          d="M10.336 8.516a4.57 4.57 0 0 0-.905 2.729c0 2.327 1.758 4.263 4.079 4.67a.804.804 0 0 0-.14 1.254l1.1-1.092 1.102 1.093a.804.804 0 0 0-.164-1.268c2.284-.436 4.004-2.356 4.004-4.657a4.58 4.58 0 0 0-.905-2.73l-1.09.89c.36.53.57 1.161.57 1.84 0 1.874-1.597 3.393-3.566 3.393s-3.564-1.52-3.564-3.393c0-.679.209-1.31.569-1.84z"
        />
        <path
          fill="#86c5fa"
          d="M11.058 8.52c0-.928.752-1.68 1.681-1.68h3.416a1.68 1.68 0 0 1 1.682 1.68v.63a5.32 5.32 0 0 1-3.39 4.96 5.32 5.32 0 0 1-3.39-4.96z"
        />
        <path
          fill="#008259"
          d="M13.227 13.302c.256 0 .492-.088.678-.236a1.085 1.085 0 0 0 1.22.092c.16.092.345.144.542.144a1.08 1.08 0 0 0 1.085-1.077 1.08 1.08 0 0 0-1.085-1.077 1.1 1.1 0 0 0-.542.144 1.085 1.085 0 0 0-1.22.092 1.1 1.1 0 0 0-.678-.236 1.08 1.08 0 0 0-1.085 1.077 1.08 1.08 0 0 0 1.085 1.077"
        />
        <path
          fill="#f1b434"
          fillRule="evenodd"
          d="M16.752 7.647h-4.61a.27.27 0 0 0-.27.27v2.144c0 1.313.808 2.492 2.039 2.972l.536.21.536-.21a3.19 3.19 0 0 0 2.04-2.972V7.917a.27.27 0 0 0-.271-.27m-2.305 6.463.834-.325a4 4 0 0 0 2.556-3.724V7.917a1.08 1.08 0 0 0-1.085-1.078h-4.61a1.08 1.08 0 0 0-1.084 1.077v2.145a4 4 0 0 0 2.556 3.724z"
          clipRule="evenodd"
        />
        <path
          fill="#f5f7f8"
          d="M10.787 15.187h7.592v.539h.542v1.615H16.21v-.538h-3.254v.538h-2.712v-1.615h.543z"
        />
        <path
          fill="#f1b434"
          fillRule="evenodd"
          d="M14.583 2.8h-.543v.385h-.542v.538h.542v.464a1.4 1.4 0 0 0-.774-.233c-.77 0-1.395.62-1.395 1.385 0 .41.18.779.465 1.032v.584h3.951V6.37c.285-.253.465-.622.465-1.032a1.39 1.39 0 0 0-1.395-1.385c-.286 0-.553.086-.774.233v-.464h.542v-.538h-.542zm-.271 3.455-.007.007h.013zm-1.044-.224h-.002a.695.695 0 0 1-.698-.692c0-.382.313-.692.698-.692s.697.31.697.692v.693zm2.787-.692a.695.695 0 0 1-.697.692h-.698V5.34c0-.382.312-.692.697-.692.386 0 .698.31.698.692"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default SM_Sharp;
