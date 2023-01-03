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
      <path
        fillRule="evenodd"
        d="M1 0v6h1V1h5v3h3v2h1V2L9 0H1Zm9 3v-.586L8.586 1H8v2h2Z"
        clipRule="evenodd"
      />
      <path d="M4.842 11.997H1.25v-.564l2.543-3.736H1.329V7h3.445v.56L2.23 11.3h2.611v.697ZM5.75 7v4.997h.82V7h-.82Z" />
      <path
        fillRule="evenodd"
        d="M10.364 7.396C10.068 7.132 9.597 7 8.953 7H7.5v4.997h.82v-1.873h.534c.364 0 .67-.043.919-.13a1.61 1.61 0 0 0 .605-.352c.153-.15.262-.322.328-.516.068-.196.103-.402.103-.619 0-.476-.148-.846-.445-1.11ZM8.32 7.68h.578c.37 0 .64.07.813.212.176.141.264.357.264.646 0 .217-.047.39-.14.523a.8.8 0 0 1-.41.29c-.18.06-.4.09-.657.09H8.32V7.68Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
