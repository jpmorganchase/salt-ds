import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MoldovaTheRepublicOfProps = CountrySymbolProps;

const MoldovaTheRepublicOf = forwardRef<
  SVGSVGElement,
  MoldovaTheRepublicOfProps
>(function MoldovaTheRepublicOf(props: MoldovaTheRepublicOfProps, ref) {
  return (
    <CountrySymbol
      data-testid="MoldovaTheRepublicOf"
      aria-label="moldova (the republic of)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M72 72H56V0h16z" />
        <path fill="#F1B434" d="M56 72H16V0h40z" />
        <path fill="#004692" d="M16 72H0V0h16z" />
        <path
          fill="#936846"
          d="M24.685 23.261c1.69-.115 4.172.134 6.102 1.094 1.739.866 2.951 2.218 2.951 4.753v9.637L22.4 49.987l4.165 4.13 7.355-7.293-3.106 7.698 5.89 5.84 5.89-5.84-3.113-7.718 7.342 7.28 4.165-4.13-11.339-11.242v-9.637h-.02c-.013-5.121-2.862-8.278-6.2-9.94-3.154-1.57-6.772-1.863-9.15-1.7l.406 5.826Z"
        />
        <path
          fill="#936846"
          d="M21.4 26v20l7-5V30a4 4 0 0 0-4-4h-3Zm30 20V26h-3a4 4 0 0 0-4 4v11l7 5Z"
        />
        <path
          fill="#DD2033"
          d="M26.2 27.823h20v7.942a14.857 14.857 0 0 1-9.34 13.794l-.66.264-.66-.264a14.857 14.857 0 0 1-9.34-13.794v-7.942Z"
        />
        <mask id="b" x="26" y="27" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path
            fill="#005EB8"
            d="M26.2 27.823h20v7.942a14.857 14.857 0 0 1-9.34 13.794l-.66.264-.66-.264a14.857 14.857 0 0 1-9.34-13.794v-7.942Z"
          />
        </mask>
        <g mask="url(#b)">
          <path fill="#0091DA" d="M26.2 38h20v12h-20V38Z" />
          <path
            fill="#F1B434"
            d="M38.4 37.465a3.998 3.998 0 0 0 .828-6.293l-.808.808c.517.517.837 1.231.837 2.02 0 .8-.328 1.522-.857 2.04V35h-4v1.04a2.849 2.849 0 0 1-.857-2.04c0-.789.32-1.503.837-2.02l-.809-.808a3.998 3.998 0 0 0 .828 6.293V43a2 2 0 0 0 4.001 0v-5.535ZM36.4 30h.016-.032.016Z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default MoldovaTheRepublicOf;
