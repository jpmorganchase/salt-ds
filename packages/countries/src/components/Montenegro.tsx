import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MontenegroProps = CountrySymbolProps;

const Montenegro = forwardRef<SVGSVGElement, MontenegroProps>(
  function Montenegro(props: MontenegroProps, ref) {
    return (
      <CountrySymbol
        data-testid="Montenegro"
        aria-label="montenegro"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle
            cx="36"
            cy="36"
            r="36"
            fill="#D9D9D9"
            transform="rotate(-90 36 36)"
          />
        </mask>
        <g mask="url(#a)">
          <path fill="#F1B434" d="M72 72H0V0h72z" />
          <circle cx="36" cy="36" r="31" fill="#DD2033" />
          <path
            fill="#F1B434"
            d="M36.7 18a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
          />
          <path
            fill="#F1B434"
            d="M42.401 24.499c1.93-.96 4.412-1.21 6.102-1.094l.405-5.826c-2.377-.163-5.996.13-9.15 1.7-1.19.594-2.32 1.377-3.28 2.373-.953-.98-2.07-1.753-3.248-2.34-3.154-1.57-6.773-1.863-9.15-1.7l.405 5.826c1.69-.116 4.172.133 6.102 1.094 1.739.866 2.951 2.218 2.951 4.753v.995L17.564 26a4 4 0 0 0 2.828 4.899l13.146 3.523v1.035l-16.302-4.369a4 4 0 0 0 2.828 4.9l12.938 3.466-.822.815-14.307-3.833a4 4 0 0 0 2.829 4.899l8.19 2.194-6.692 6.635 4.165 4.13L33.72 47l-3.105 7.7 5.89 5.84 5.89-5.84-3.114-7.718 7.342 7.28 4.165-4.13-6.79-6.733 7.7-2.063a4 4 0 0 0 2.83-4.9L40.71 40.139l-.822-.815 12.449-3.336a4 4 0 0 0 2.828-4.899L39.45 35.3v-1.035L52.008 30.9a4 4 0 0 0 2.829-4.9L39.45 30.123v-.87c0-2.536 1.212-3.888 2.951-4.754Z"
          />
          <path
            fill="#005EB8"
            d="M26 28h20v7.941a14.857 14.857 0 0 1-9.34 13.795L36 50l-.66-.264A14.857 14.857 0 0 1 26 35.94V28Z"
          />
          <mask
            id="b"
            x="26"
            y="28"
            maskUnits="userSpaceOnUse"
            mask-type="alpha"
          >
            <path
              fill="#005EB8"
              d="M26 28h20v7.941a14.857 14.857 0 0 1-9.34 13.795L36 50l-.66-.264A14.857 14.857 0 0 1 26 35.94V28Z"
            />
          </mask>
          <g mask="url(#b)">
            <path fill="#009B77" d="M26 38h20v12H26z" />
          </g>
        </g>
      </CountrySymbol>
    );
  }
);

export default Montenegro;
