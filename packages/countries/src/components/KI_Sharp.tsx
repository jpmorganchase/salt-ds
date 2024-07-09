import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type KI_SharpProps = CountrySymbolProps;

const KI_Sharp = forwardRef<SVGSVGElement, KI_SharpProps>(function KI_Sharp(
  props: KI_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="KI_Sharp"
      aria-label="Kiribati"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-KI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-KI-a)`}>
        <path fill="#DD2033" d="M0 0h72v36H0z" />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M32.87 6.147c-.752.63-1.093 1.458-1.177 1.97-.164 1-1.48 1.276-2.018.418-.772-1.232-1.922-1.652-3.191-1.647-1.31.006-2.641.478-3.446.914L22 5.826c1.033-.56 2.716-1.17 4.475-1.177 1.267-.005 2.62.31 3.759 1.211a5.756 5.756 0 0 1 1.232-1.44C32.71 3.377 34.528 2.756 37 3.09l-.291 2.22c-1.94-.263-3.123.236-3.84.836Z"
          clipRule="evenodd"
        />
        <path
          fill="#F1B434"
          d="m51 29-6.334 3.03 3.373 6.24-6.877-1.338L40.29 44l-4.79-5.198L30.71 44l-.872-7.068-6.877 1.338 3.373-6.24L20 29l6.334-3.03-3.373-6.24 6.877 1.338L30.71 14l4.79 5.198L40.29 14l.872 7.068 6.877-1.338-3.372 6.24L51 29Z"
        />
        <path fill="#004692" d="M0 35h72v15H0z" />
        <path
          fill="#F5F7F8"
          d="M73.882 30.003c-1.504.036-2.276.744-3.048 1.453-.792.726-1.584 1.453-3.168 1.453-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.584 0-2.375.727-3.167 1.455-.791.727-1.583 1.454-3.166 1.454-1.584 0-2.375-.727-3.167-1.454C51.042 30.727 50.25 30 48.667 30c-1.584 0-2.375.727-3.167 1.455-.792.727-1.583 1.454-3.167 1.454-1.583 0-2.375-.727-3.167-1.454C38.375 30.727 37.583 30 36 30s-2.375.727-3.166 1.455c-.792.727-1.583 1.454-3.167 1.454-1.583 0-2.374-.727-3.166-1.454C25.71 30.727 24.917 30 23.334 30c-1.584 0-2.376.727-3.167 1.455-.792.727-1.584 1.454-3.167 1.454-1.584 0-2.376-.727-3.167-1.454C13.04 30.727 12.249 30 10.666 30c-1.583 0-2.375.727-3.166 1.455-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.375-.727-3.168-1.453-.772-.709-1.543-1.417-3.047-1.453a38.93 38.93 0 0 0-.061 5.09c1.544.017 2.327.735 3.109 1.453C1.958 37.273 2.75 38 4.333 38c1.584 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.166-1.454s2.375.727 3.167 1.454C14.625 37.273 15.416 38 17 38c1.583 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.455.792.727 1.583 1.454 3.166 1.454 1.584 0 2.375-.727 3.167-1.455.792-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454.792.728 1.584 1.455 3.167 1.455 1.584 0 2.376-.727 3.167-1.455.792-.727 1.584-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454C52.625 37.273 53.417 38 55 38c1.583 0 2.375-.727 3.166-1.455.792-.727 1.584-1.454 3.167-1.454 1.584 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.454.782-.718 1.565-1.436 3.11-1.453a38.85 38.85 0 0 0-.062-5.09Zm0 10c-1.504.036-2.276.744-3.048 1.453-.792.726-1.584 1.453-3.168 1.453-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.584 0-2.375.727-3.167 1.455-.791.727-1.583 1.454-3.166 1.454-1.584 0-2.375-.727-3.167-1.454C51.042 40.727 50.25 40 48.667 40c-1.584 0-2.375.727-3.167 1.455-.792.727-1.583 1.454-3.167 1.454-1.583 0-2.375-.727-3.167-1.454C38.375 40.727 37.583 40 36 40s-2.375.727-3.166 1.455c-.792.727-1.583 1.454-3.167 1.454-1.583 0-2.374-.727-3.166-1.454C25.71 40.727 24.917 40 23.334 40c-1.584 0-2.376.727-3.167 1.455-.792.727-1.584 1.454-3.167 1.454-1.584 0-2.376-.727-3.167-1.454C13.04 40.727 12.249 40 10.666 40c-1.583 0-2.375.727-3.166 1.455-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.375-.727-3.168-1.453-.772-.709-1.543-1.417-3.047-1.453a38.93 38.93 0 0 0-.061 5.09c1.544.017 2.327.735 3.109 1.453C1.958 47.273 2.75 48 4.333 48c1.584 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.166-1.454s2.375.727 3.167 1.454C14.625 47.273 15.416 48 17 48c1.583 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.455.792.727 1.583 1.454 3.166 1.454 1.584 0 2.375-.727 3.167-1.455.792-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454.792.728 1.584 1.455 3.167 1.455 1.584 0 2.376-.727 3.167-1.455.792-.727 1.584-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454C52.625 47.273 53.417 48 55 48c1.583 0 2.375-.727 3.166-1.455.792-.727 1.584-1.454 3.167-1.454 1.584 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.454.782-.718 1.565-1.436 3.11-1.453a38.85 38.85 0 0 0-.062-5.09Zm-3.048 11.453c.772-.709 1.544-1.417 3.048-1.453a38.85 38.85 0 0 1 .062 5.09c-1.545.017-2.328.735-3.11 1.453-.792.727-1.584 1.454-3.168 1.454-1.583 0-2.374-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.167 1.454C57.375 57.273 56.583 58 55 58s-2.375-.727-3.167-1.455c-.791-.727-1.583-1.454-3.166-1.454s-2.375.727-3.167 1.454c-.79.728-1.583 1.455-3.167 1.455-1.583 0-2.375-.727-3.166-1.455-.792-.727-1.584-1.454-3.167-1.454-1.584 0-2.375.727-3.167 1.454-.791.728-1.583 1.455-3.166 1.455-1.584 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.454C19.375 57.273 18.583 58 17 58c-1.584 0-2.375-.727-3.167-1.455-.792-.727-1.584-1.454-3.167-1.454-1.583 0-2.375.727-3.166 1.454C6.708 57.273 5.917 58 4.333 58c-1.583 0-2.375-.727-3.167-1.454-.782-.718-1.565-1.436-3.11-1.453a38.53 38.53 0 0 1 .062-5.09c1.504.036 2.275.744 3.047 1.453.793.726 1.585 1.453 3.168 1.453 1.583 0 2.375-.727 3.167-1.454C8.29 50.727 9.083 50 10.666 50s2.375.727 3.167 1.455c.791.727 1.583 1.454 3.167 1.454 1.583 0 2.375-.727 3.167-1.454.791-.728 1.583-1.455 3.166-1.455 1.584 0 2.376.727 3.167 1.455.792.727 1.583 1.454 3.166 1.454 1.584 0 2.375-.727 3.167-1.454.791-.728 1.583-1.455 3.166-1.455 1.584 0 2.376.727 3.167 1.455.792.727 1.584 1.454 3.167 1.454 1.584 0 2.375-.727 3.167-1.454.792-.728 1.583-1.455 3.167-1.455 1.583 0 2.374.727 3.166 1.455.792.727 1.584 1.454 3.167 1.454 1.583 0 2.374-.727 3.166-1.454.792-.728 1.584-1.455 3.167-1.455 1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.453Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default KI_Sharp;
