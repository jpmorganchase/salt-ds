// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GB_WLS_SharpProps = CountrySymbolProps;

const GB_WLS_Sharp = forwardRef<SVGSVGElement, GB_WLS_SharpProps>(
  function GB_WLS_Sharp(props: GB_WLS_SharpProps, ref) {
    const uid = useId(props.id);

    const { style: styleProp, ...rest } = props;

    const style = {
      ...styleProp,
      borderRadius: "0",
    };

    return (
      <CountrySymbol
        data-testid="GB_WLS_Sharp"
        style={style}
        aria-label="Wales"
        viewBox="0 0 72 50"
        ref={ref}
        {...rest}
      >
        <mask
          id={`${uid}-GB-WLS-a`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#D9D9D9" d="M0 0h72v50H0z" />
        </mask>
        <g mask={`url(#${uid}-GB-WLS-a)`}>
          <path fill="#F5F7F8" d="M0 0h72v25H0z" />
          <path fill="#009B77" d="M0 25h72v25H0z" />
          <path
            fill="#DD2033"
            d="M44.7 9 31.35 19.45l-1.516 4.094-1.62-7.526a4.796 4.796 0 0 0-.628-2.374c.93-.856 1.619-1.951 1.906-3.018-1.177 0-2.48.609-3.546 1.309a4.818 4.818 0 0 0-7.368 4.09h4.047l-.938 3.228a10.46 10.46 0 0 0 .853 7.97l-2.513 2.5-3.069-3.052v-4.274l-2.356-2.344-1.801 1.811 1.603 1.595v3.212L12.8 28.266l1.801 1.81 1.08-1.073 4.345 4.323 4.017-3.997c.278.303.573.59.885.86l-4.271 6.98h-3.929v2.554h7.895v-2.554h-.972l2.885-4.715-.064.173 1.247-.702a10.52 10.52 0 0 0 4.094.818l-.005-.021 3.334 1.851-1.723 2.815h-3.928v2.554h7.895v-2.554h-.972l3.57-5.836-.003-.002 1.527-1.012 7.368 1.95-3.033 4.958h-3.929V40h7.895v-2.554h-.972l3.441-5.624.027-.007-.014-.014.117-.19-.856-.524-2.672-2.581c1.787-.822 4.931-2.931 6.496-5.97l2.872 1.658V16.4l-6.751 3.898 2.42 1.397c-1.715 1.346-4.254 2.64-7.627 2.958l2.939-2.3V9L44.7 12.544V9Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default GB_WLS_Sharp;
