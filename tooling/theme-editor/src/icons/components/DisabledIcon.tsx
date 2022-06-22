import { Icon, IconProps } from "@jpmorganchase/uitk-icons";
import { forwardRef, Ref, SVGProps } from "react";

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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4H8V5.03544C8.1633 5.01209 8.33024 5 8.5 5C9.0368 5 9.54537 5.12085 10 5.33682V4V2H8H4H2V4V8V10H4H5.33682C5.12085 9.54537 5 9.0368 5 8.5C5 8.33024 5.01209 8.1633 5.03544 8H4V4Z"
        fill="#4C505B"
        fillOpacity="0.4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 8.5C6 9.88056 7.11944 11 8.5 11C9.88056 11 11 9.88056 11 8.5C11 7.11917 9.88056 6 8.5 6C7.11944 6 6 7.11917 6 8.5ZM7.34056 6.94167C7.66472 6.70028 8.065 6.55556 8.5 6.55556C9.57389 6.55556 10.4444 7.42611 10.4444 8.5C10.4444 8.93528 10.3 9.33556 10.0583 9.65945L7.34056 6.94167ZM6.55556 8.5C6.55556 8.06167 6.7025 7.65861 6.94694 7.33361L9.66639 10.0531C9.34111 10.2978 8.93806 10.4444 8.5 10.4444C7.42611 10.4444 6.55556 9.57389 6.55556 8.5Z"
        fill="#4C505B"
        fillOpacity="0.4"
      />
    </svg>
  );
}

export const DisabledIconSVG = forwardRef(SvgComponent);
export const DisabledIcon = forwardRef<HTMLSpanElement, IconProps>(
  function DisabledIcon(props, ref) {
    return (
      <Icon aria-label="attach" role="img" {...props} ref={ref}>
        <DisabledIconSVG />
      </Icon>
    );
  }
);
