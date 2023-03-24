import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AlbaniaProps = CountrySymbolProps;

const Albania = forwardRef<SVGSVGElement, AlbaniaProps>(function Albania(
  props: AlbaniaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Albania"
      aria-label="albania"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path
          fill="#31373D"
          d="M48.303 22.405c-1.69-.115-4.172.133-6.102 1.094-1.74.866-2.952 2.219-2.952 4.753v.871L54.637 25a4 4 0 0 1-2.829 4.899L39.25 33.264V34.3l15.716-4.21a4 4 0 0 1-2.829 4.898l-12.449 3.336.822.815 13.818-3.702a4 4 0 0 1-2.828 4.899l-7.702 2.063 6.79 6.733-4.164 4.13-7.342-7.28 3.113 7.718-5.89 5.84-5.89-5.84 3.106-7.698-7.355 7.293L22 49.164l6.692-6.635-8.19-2.194a4 4 0 0 1-2.829-4.9L31.98 39.27l.821-.815-12.937-3.467a4 4 0 0 1-2.829-4.899l16.303 4.369v-1.035L20.192 29.9a4 4 0 0 1-2.829-4.9l15.975 4.28v-.995c0-2.535-1.212-3.887-2.951-4.753-1.93-.96-4.412-1.21-6.102-1.094l-.405-5.826c2.377-.163 5.995.13 9.15 1.7 1.178.587 2.295 1.36 3.248 2.34.96-.996 2.09-1.78 3.28-2.372 3.154-1.57 6.773-1.864 9.15-1.701l-.405 5.826Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Albania;
