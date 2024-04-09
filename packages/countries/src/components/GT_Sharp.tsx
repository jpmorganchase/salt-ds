// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GT_SharpProps = CountrySymbolProps;

const GT_Sharp = forwardRef<SVGSVGElement, GT_SharpProps>(function GT_Sharp(
  props: GT_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1.44",
  };

  return (
    <CountrySymbol
      data-testid="GT_Sharp"
      style={style}
      aria-label="Guatemala"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-GT-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GT-a)`}>
        <path fill="#0091DA" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M16 0h40v50H16z" />
        <path
          fill="#009B77"
          d="M18.406 22.435a18.074 18.074 0 0 0-.406 3.82c0 9.94 8.059 18 18 18s18-8.06 18-18c0-1.339-.146-2.643-.423-3.899l-5.664 2.45c.058.474.087.958.087 1.449 0 6.627-5.373 12-12 12s-12-5.373-12-12c0-.463.026-.919.077-1.367l-5.671-2.453Z"
        />
        <path
          fill="#FBD381"
          d="M28 14h14a2 2 0 0 1 0 4h-.294L44 31H29a2 2 0 1 1 0-4h1.294L28 14Z"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M42.871 22.93c.032-4.14-1.316-8.278-2.571-10.806l1.791-.89c1.356 2.731 2.815 7.18 2.78 11.71-.035 4.561-1.598 9.316-6.415 12.348l-1.065-1.693c4.068-2.56 5.448-6.56 5.48-10.67Z"
          clipRule="evenodd"
        />
        <path
          fill="#008259"
          d="M39.914 8.001a1.5 1.5 0 1 0-2.026.869 3 3 0 0 0 3.15 4.946c1.196 2.239 2.317 5.108 2.721 8.081.553 4.073-.244 8.228-3.907 11.341l1.296 1.524c4.337-3.686 5.206-8.615 4.593-13.134-.464-3.417-1.778-6.664-3.143-9.127A3 3 0 0 0 39.914 8Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GT_Sharp;
