import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ZipIconProps = IconProps;

export const ZipIcon = forwardRef<SVGSVGElement, ZipIconProps>(function ZipIcon(
  props: ZipIconProps,
  ref
) {
  return (
    <Icon
      data-testid="ZipIcon"
      aria-label="zip"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M8.707 0H1v6h1V1h5v3h3v2h1V2.293L8.707 0zM8 1h.293L10 2.707V3H8V1z" />
        <path d="M4.842 11.997H1.25v-.564l2.543-3.736H1.329V7h3.445v.561L2.231 11.3h2.611v.697z" />
        <path d="M5.75 7v4.997h.82V7h-.82z" />
        <path d="M10.364 7.396C10.068 7.132 9.597 7 8.952 7H7.499v4.997h.82v-1.873h.533c.365 0 .671-.043.919-.13.251-.087.452-.204.605-.352.153-.15.262-.322.328-.516.068-.196.103-.402.103-.619 0-.476-.148-.847-.444-1.111zM8.32 7.68h.578c.369 0 .64.071.813.212.175.141.263.357.263.646 0 .216-.047.391-.14.523s-.23.229-.41.291c-.18.059-.399.089-.656.089H8.32v-1.76z" />
      </>
    </Icon>
  );
});
