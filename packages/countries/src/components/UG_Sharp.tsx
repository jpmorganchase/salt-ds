// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type UG_SharpProps = CountrySymbolProps;

const UG_Sharp = forwardRef<SVGSVGElement, UG_SharpProps>(function UG_Sharp(
  props: UG_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="UG_Sharp"
      aria-label="Uganda"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-UG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-UG-a)`}>
        <path fill="#31373d" d="M0 3.6V0h29v3.6zm0 10V10h29v3.6z" />
        <path fill="#f1b434" d="M0 6.8V3.6h29v3.2z" />
        <path fill="#dd2033" d="M0 20v-3.2h29V20zm0-10V6.8h29V10z" />
        <path fill="#f1b434" d="M0 16.8v-3.2h29v3.2z" />
        <ellipse cx="14.097" cy="10" fill="#f5f7f8" rx="8.056" ry="8" />
        <path
          fill="#31373d"
          fillRule="evenodd"
          d="m14.829 11.863-1.084-1.21.301-.267 1.084 1.211a.6.6 0 0 1-.394.996l-2.854.27a.2.2 0 0 0-.161.289l.14.278-.36.179-.14-.278a.6.6 0 0 1 .482-.866l2.855-.27a.2.2 0 0 0 .131-.332"
          clipRule="evenodd"
        />
        <path
          fill="#31373d"
          d="M12.184 12.651a.43.43 0 0 1 .292.013.77.77 0 0 1 .39.366l-.357.18a.38.38 0 0 0-.176-.172l-.009-.004a.17.17 0 0 0 .008.135l.131.26-.179.09-.178.09-.131-.26a.57.57 0 0 1-.023-.464.39.39 0 0 1 .232-.234"
        />
        <mask id={`${uid}-UG-b`} fill="#fff">
          <path
            fillRule="evenodd"
            d="M16.273 13.02a2.4 2.4 0 0 0 1.248-2.1c0-1.326-1.082-2.4-2.417-2.4-.719 0-1.364.311-1.807.806a3.21 3.21 0 0 1 2.976 3.694"
            clipRule="evenodd"
          />
        </mask>
        <path
          fill="#31373d"
          fillRule="evenodd"
          d="M16.273 13.02a2.4 2.4 0 0 0 1.248-2.1c0-1.326-1.082-2.4-2.417-2.4-.719 0-1.364.311-1.807.806a3.21 3.21 0 0 1 2.976 3.694"
          clipRule="evenodd"
        />
        <path
          fill="#31373d"
          d="m16.273 13.02-.987-.156-.32 2.016 1.79-.984zm-2.976-3.694-.745-.667-1.374 1.535 2.056.13zm3.224 1.593c0 .523-.29.983-.73 1.225l.964 1.752a3.4 3.4 0 0 0 1.766-2.977zm-1.417-1.4c.79 0 1.417.634 1.417 1.4h2c0-1.884-1.536-3.4-3.417-3.4zm-1.062.474c.26-.291.638-.474 1.062-.474v-2a3.42 3.42 0 0 0-2.552 1.14zm-.808.33a2.21 2.21 0 0 1 2.079 2.196h2c0-2.235-1.752-4.053-3.953-4.191zm2.079 2.196q0 .177-.027.345l1.975.313a4 4 0 0 0 .052-.658z"
          mask={`url(#${uid}-UG-b)`}
        />
        <path
          fill="#31373d"
          fillRule="evenodd"
          d="M13.87 6.68a2.41 2.41 0 0 0-1.95 1.988 2.4 2.4 0 0 0 2.011 2.744 2.42 2.42 0 0 0 2.334-.962 3.2 3.2 0 0 1-2.394-3.77"
          clipRule="evenodd"
        />
        <path
          fill="#dd2033"
          d="M14.821 5.375a1.41 1.41 0 0 0-1.65-1.111l.266 1.375z"
        />
        <path
          fill="#31373d"
          stroke="#31373d"
          d="M13.292 5.42c.283 0 .506.226.506.5 0 .272-.223.5-.507.5a.503.503 0 0 1-.506-.5c0-.274.223-.5.506-.5Z"
        />
        <path fill="#31373d" d="m11.48 6.52 1.207-.8.403.6z" />
        <path
          fill="#dd2033"
          fillRule="evenodd"
          d="M15.86 10.881a3.17 3.17 0 0 1 .413 2.14 2.4 2.4 0 0 0 1.248-2.102c0-.707-.308-1.343-.799-1.782a2.4 2.4 0 0 1-.863 1.745"
          clipRule="evenodd"
        />
        <path
          fill="#31373d"
          d="M14.096 10.52v4.243l.654.162-.05.194-.047.194-.678-.169-.524.696-.32-.242.363-.48h-1.008v-.399h1.21v-4.2z"
        />
      </g>
    </CountrySymbol>
  );
});

export default UG_Sharp;
