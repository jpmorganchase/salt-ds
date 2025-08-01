// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type IQ_SharpProps = CountrySymbolProps;

const IQ_Sharp = forwardRef<SVGSVGElement, IQ_SharpProps>(function IQ_Sharp(
  props: IQ_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="IQ_Sharp"
      aria-label="Iraq"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-IQ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-IQ-a)`}>
        <path fill="#31373d" d="M0 20v-5h29v5z" />
        <path fill="#f5f7f8" d="M0 15V5h29v10z" />
        <path fill="#dd2033" d="M0 5V0h29v5z" />
        <path
          fill="#008259"
          d="M14.109 12.85H4.182c-.02.185-.088.364-.198.524s-.26.299-.438.404a1.6 1.6 0 0 1-.596.205 1.7 1.7 0 0 1-.64-.03c1.39-.683 1.303-1.376.426-2.915.487-.174.564-.22 1.057-.554-.35 1.057.902.929 1.826.929 0-.37.036-.79-.241-.847.359-.128.39-.169.959-.651v1.42h6.848v-.974a.205.205 0 1 0-.41 0v.564a.154.154 0 0 1-.154.154H7.389v-.923l3.929-3.796c-.026.195.38.718.549.805-.128.02-.272-.005-.364.087l-3.217 3.11h3.566c0-.827.769-.827 1.128-1.12.36.293 1.129.293 1.129 1.12zm.743 0V6.36c.365.2.647.43 1.098.544-.02.256-.251.338-.251.518v3.99c.503.114.615-.179.857-.328.061.637.466 1.262.451 1.765zm6.782-4.336.795-.666v3.488h.565V7.37c.277-.23.636-.482.795-.774v6.253h-5.002c-.072-1.293-.072-2.621 1.436-2.334v-.528c0-.123-.184-.026-.184-.139l1.03-.862v2.35h.565zm-.262-1.785c-.097.005-.246-.528-.21-.63.036-.119.17-.119.226-.062.092.087.082.687-.016.692m-.928.724c-.282-.165-.236-.231.01-.16.426.129.642.021.95-.292l.23.118c.303.154.488.087.595-.282.031-.113.123-.082.149.046.097.513-.292.672-.687.529-.216-.072-.252-.072-.36.01-.235.184-.574.215-.887.03m4.089 5.396V6.36c.364.2.646.432 1.097.545-.02.256-.251.338-.251.518v3.99c.503.114.615-.179.857-.328.061.637.466 1.262.451 1.765zm-19.448.718a.303.303 0 1 1 .606 0 .303.303 0 0 1-.606 0m14.677-2.36q.001.072.067.124a.27.27 0 0 0 .164.051c.06 0 .12-.018.163-.051a.16.16 0 0 0 .067-.123.16.16 0 0 0-.067-.124.27.27 0 0 0-.163-.05.27.27 0 0 0-.164.05.16.16 0 0 0-.067.124"
        />
      </g>
    </CountrySymbol>
  );
});

export default IQ_Sharp;
