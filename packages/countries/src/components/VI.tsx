// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type VIProps = CountrySymbolProps;

const VI = forwardRef<SVGSVGElement, VIProps>(function VI(props: VIProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
  };

  return (
    <CountrySymbol
      data-testid="VI"
      style={style}
      aria-label="Virgin Islands (U.S.)"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-VI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-VI-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <path
          fill="#F1B434"
          d="M24.285 23.438c1.69-.115 4.172.133 6.102 1.094 1.739.866 2.951 2.218 2.951 4.753v.995L17.363 26a4 4 0 0 0 2.829 4.899l13.146 3.523v1.035l-16.303-4.369a4 4 0 0 0 2.829 4.9L32.8 39.453l-.822.815-14.306-3.833a4 4 0 0 0 2.828 4.899l8.19 2.194L22 50.164l4.165 4.13L33.52 47l-3.106 7.7 5.89 5.84 5.89-5.84-3.113-7.718 7.342 7.28 4.165-4.13-6.79-6.733 7.7-2.063a4 4 0 0 0 2.83-4.9l-13.819 3.703-.822-.815 12.45-3.336a4 4 0 0 0 2.828-4.899L39.249 35.3v-1.035L51.81 30.9a4 4 0 0 0 2.826-4.9l-15.388 4.123v-.87h-.02c-.013-5.122-2.862-8.279-6.2-9.94-3.154-1.57-6.772-1.864-9.15-1.701l.406 5.826Z"
        />
        <path
          fill="#005EB8"
          d="M25.8 28h20v7.941a14.857 14.857 0 0 1-9.34 13.795L35.8 50l-.66-.264A14.857 14.857 0 0 1 25.8 35.94V28Z"
        />
        <mask
          id={`${uid}-VI-b`}
          x="25"
          y="28"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#005EB8"
            d="M25.8 28h20v7.941a14.857 14.857 0 0 1-9.34 13.795L35.8 50l-.66-.264A14.857 14.857 0 0 1 25.8 35.94V28Z"
          />
        </mask>
        <g mask={`url(#${uid}-VI-b)`}>
          <path fill="#F5F7F8" d="M25.8 35h20v15h-20V35Z" />
          <path
            fill="#DD2033"
            d="M31.8 35h-4v15h4V35Zm4 0h4v15h-4V35Zm8 0H46v15h-2.2V35Z"
          />
        </g>
        <path
          fill="#005EB8"
          d="M61 30h2v11h-2V30ZM7.932 30 6 30.518l2.842 10.608 2.09.043 2.842-10.608-1.931-.517-1.95 7.275L7.932 30Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default VI;
