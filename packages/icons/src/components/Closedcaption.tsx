import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ClosedcaptionIconProps = IconProps;

export const ClosedcaptionIcon = forwardRef<
  SVGSVGElement,
  ClosedcaptionIconProps
>(function ClosedcaptionIcon(props: ClosedcaptionIconProps, ref) {
  return (
    <Icon
      data-testid="ClosedcaptionIcon"
      aria-label="closedcaption"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M4.306 8c-.37 0-.69-.07-.961-.213a1.433 1.433 0 0 1-.626-.651C2.573 6.843 2.5 6.472 2.5 6.02c0-.47.08-.853.24-1.15.16-.297.382-.517.665-.658A2.17 2.17 0 0 1 4.383 4c.234 0 .444.023.633.07.19.044.352.098.484.163l-.247.655a3.638 3.638 0 0 0-.442-.146c-.15-.04-.296-.06-.435-.06-.228 0-.419.05-.572.15a.9.9 0 0 0-.34.447 2.158 2.158 0 0 0-.109.735 2 2 0 0 0 .113.718.91.91 0 0 0 .336.439.976.976 0 0 0 .548.146c.214 0 .406-.025.576-.077.17-.05.33-.117.48-.198v.71a1.796 1.796 0 0 1-.477.185c-.17.042-.378.063-.625.063Zm4 0c-.37 0-.69-.07-.961-.213a1.433 1.433 0 0 1-.626-.651C6.573 6.843 6.5 6.472 6.5 6.02c0-.47.08-.853.24-1.15.16-.297.382-.517.665-.658A2.17 2.17 0 0 1 8.383 4c.234 0 .444.023.633.07.19.044.352.098.484.163l-.247.655a3.638 3.638 0 0 0-.442-.146c-.15-.04-.296-.06-.435-.06-.228 0-.419.05-.572.15a.9.9 0 0 0-.34.447 2.158 2.158 0 0 0-.109.735 2 2 0 0 0 .113.718.91.91 0 0 0 .336.439.976.976 0 0 0 .548.146c.214 0 .406-.025.576-.077.17-.05.33-.117.48-.198v.71a1.796 1.796 0 0 1-.477.185c-.17.042-.378.063-.625.063Z" />
      <path
        fillRule="evenodd"
        d="M0 11V1h12v10H0Zm1-9h10v8H1V2Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
