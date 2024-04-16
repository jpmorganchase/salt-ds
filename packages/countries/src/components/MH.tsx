// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MHProps = CountrySymbolProps;

const MH = forwardRef<SVGSVGElement, MHProps>(function MH(props: MHProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="MH"
      aria-label="Marshall Islands (the)"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": false })}
      {...rest}
    >
      <mask
        id={`${uid}-MH-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-MH-a)`}>
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path
          fill="#F1B434"
          d="m14.071 64.983-1.97-1.971L57.91 7l7.072 7.071L14.07 64.983Z"
        />
        <path
          fill="#F5F7F8"
          d="m16.088 67-2.017-2.017L64.983 14.07l7.07 7.071L16.089 67ZM33 26l-4.903 2.425 2.61 4.991-5.324-1.07L24.71 38 21 33.842 17.292 38l-.674-5.654-5.325 1.07 2.611-4.992L9 26l4.903-2.425-2.61-4.991 5.323 1.07.676-5.654L21 18.159 24.709 14l.674 5.654 5.325-1.07-2.611 4.992L33 26Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MH;
