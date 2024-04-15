// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type HKProps = CountrySymbolProps;

const HK = forwardRef<SVGSVGElement, HKProps>(function HK(props: HKProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="HK"
      aria-label="Hong Kong"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-HK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask={`url(#${uid}-HK-a)`}>
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M39.274 26.845c-.472 1.964-1.133 2.718-1.77 3.447-.597.681-1.173 1.34-1.557 2.94-4.683-1.129-7.567-5.845-6.441-10.536 1.125-4.691 5.835-7.58 10.518-6.452-.926 3.86-.75 5.668-.605 7.176.105 1.08.195 2.007-.145 3.424ZM37.2 22a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-10.078 7.659c1.72 1.056 2.232 1.919 2.727 2.752.462.778.909 1.53 2.309 2.39-2.518 4.113-7.888 5.403-11.994 2.88-4.107-2.521-5.394-7.9-2.876-12.012 3.38 2.075 5.15 2.466 6.627 2.793 1.058.234 1.966.435 3.207 1.197ZM23.2 32a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm2.839 10.105c1.534-1.312 2.512-1.533 3.456-1.747.881-.2 1.734-.393 2.983-1.461 3.128 3.67 2.693 9.183-.97 12.315a8.712 8.712 0 0 1-12.296-.973c3.014-2.577 3.933-4.143 4.7-5.449.548-.936 1.02-1.738 2.127-2.685ZM27.2 49a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10.322-2.018c-.772-1.866-.68-2.866-.592-3.832.083-.901.163-1.773-.465-3.293 4.45-1.845 9.552.273 11.394 4.731 1.842 4.458-.273 9.567-4.724 11.412-1.515-3.669-2.718-5.027-3.721-6.161-.719-.813-1.336-1.51-1.892-2.857ZM46.2 49a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-.497-11.45c-2.011.159-2.932-.237-3.822-.62-.83-.358-1.634-.703-3.27-.575-.377-4.809 3.21-9.014 8.012-9.391 4.802-.377 9 3.216 9.377 8.026-3.952.31-5.614 1.036-7 1.641-.994.434-1.846.806-3.297.92ZM52.2 32a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default HK;
