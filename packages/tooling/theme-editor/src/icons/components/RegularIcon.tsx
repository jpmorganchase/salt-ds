import { SVGProps, Ref, forwardRef } from "react";
import { Icon, IconProps } from "@jpmorganchase/uitk-icons";

function SvgComponent(
  props: SVGProps<SVGSVGElement>,
  svgRef?: Ref<SVGSVGElement>
) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={svgRef}
      {...props}
    >
      <rect x="2" y="2" width="8" height="8" fill="#4C505B" fillOpacity="0.4" />
    </svg>
  );
}

export const RegularIconSVG = forwardRef(SvgComponent);
export const RegularIcon = forwardRef<HTMLSpanElement, IconProps>(
  function RegularIcon(props, ref) {
    return (
      <Icon aria-label="attach" role="img" {...props} ref={ref}>
        <RegularIconSVG />
      </Icon>
    );
  }
);
