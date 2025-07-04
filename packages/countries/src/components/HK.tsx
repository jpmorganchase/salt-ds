// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type HKProps = CountrySymbolProps;

const HK = forwardRef<SVGSVGElement, HKProps>(function HK(props: HKProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="HK"
      aria-label="Hong Kong"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-HK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="10"
          cy="10"
          r="10"
          fill="#d9d9d9"
          transform="rotate(-90 10 10)"
        />
      </mask>
      <g mask={`url(#${uid}-HK-a)`}>
        <path fill="#dd2033" d="M0 0h20v20H0z" />
        <path
          fill="#f5f7f8"
          fillRule="evenodd"
          d="M10.91 7.457c-.132.545-.315.755-.492.958a1.65 1.65 0 0 0-.433.816 2.427 2.427 0 0 1 1.133-4.719c-.258 1.073-.209 1.575-.168 1.994.029.3.054.557-.04.95m-.577-1.346a.556.556 0 1 1-1.11 0 .556.556 0 0 1 1.11 0M7.534 8.239c.477.293.62.533.757.764.129.216.253.425.642.664a2.42 2.42 0 0 1-3.332.8 2.43 2.43 0 0 1-.799-3.337c.939.577 1.43.685 1.841.776.294.065.546.12.89.333m-1.09.65a.556.556 0 1 1-1.11 0 .556.556 0 0 1 1.11 0m.79 2.807c.426-.364.698-.426.96-.486.245-.055.482-.109.829-.405a2.43 2.43 0 0 1-.27 3.42 2.42 2.42 0 0 1-3.415-.27c.837-.716 1.092-1.15 1.305-1.513.153-.26.283-.483.591-.746m.323 1.915a.556.556 0 1 1-1.112 0 .556.556 0 0 1 1.112 0m2.867-.561c-.215-.518-.19-.796-.165-1.064a1.65 1.65 0 0 0-.129-.915 2.42 2.42 0 0 1 3.165 1.315 2.43 2.43 0 0 1-1.312 3.17c-.421-1.02-.755-1.397-1.034-1.712-.2-.226-.37-.42-.525-.793m2.41.561a.556.556 0 1 1-1.11 0 .556.556 0 0 1 1.11 0m-.138-3.182c-.558.045-.814-.065-1.061-.172-.231-.099-.454-.195-.909-.16a2.426 2.426 0 0 1 2.226-2.608 2.424 2.424 0 0 1 2.605 2.23c-1.098.086-1.56.287-1.945.455-.276.12-.513.224-.916.256M14.5 8.89a.556.556 0 1 1-1.111 0 .556.556 0 0 1 1.111 0"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default HK;
