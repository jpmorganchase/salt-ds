import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type EthiopiaProps = CountrySymbolProps;

const Ethiopia = forwardRef<SVGSVGElement, EthiopiaProps>(function Ethiopia(
  props: EthiopiaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Ethiopia"
      aria-label="ethiopia"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#FBD381" d="M0 48V24h72v24z" />
        <path fill="#009B77" d="M0 24V0h72v24z" />
        <circle cx="36" cy="36" r="20" fill="#004692" />
        <path
          fill="#FBD381"
          d="M32.721 32.416 36.001 25l3.278 7.416 7.721.987-5.695 5.57L42.798 47 36 42.417 29.201 47l1.494-8.026L25 33.404l7.721-.988Z"
        />
        <path
          fill="#FBD381"
          d="m29.071 26.063 2.048 2.56-.457 1.032-2.322.297-1.611-2.015 2.342-1.874Zm-5.796 15.073 3.637-1.666.54.529-.512 2.758-2.415 1.107-1.25-2.728ZM34.4 50v-2.886l1.6-1.08 1.4.944V50h-3Zm12.875-6.136-2.196-1.007L44.547 40l.478-.467 3.5 1.604-1.25 2.728ZM45.093 27.41 43.2 29.892l-1.862-.238-.634-1.435 2.002-2.63 2.387 1.82Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Ethiopia;
