import React, { forwardRef } from "react";

const filledPath =
  "M6,0,4.21,4.05,0,4.58l3.11,3L2.29,12,6,9.5,9.71,12,8.89,7.62l3.11-3L7.79,4.05,6,0Z";

const hollowPath =
  "M6,2.47l.87,2L7.1,5,7.66,5l2.16.27L8.19,6.91l-.38.37.1.53.38,2L6.56,8.67,6,8.29l-.56.38L3.71,9.84l.38-2,.1-.53-.38-.37L2.18,5.31,4.34,5,4.9,5l.23-.52.87-2M6,0,4.21,4.05,0,4.58l3.11,3L2.29,12,6,9.5,9.71,12,8.89,7.62l3.11-3L7.79,4.05,6,0Z";

export interface StarIconProps {
  className?: string;
  selected?: boolean;
  highlighted?: boolean;
}

export const StarIcon = forwardRef<SVGSVGElement, StarIconProps>(
  function StarIcon({ className, selected, highlighted }, ref) {
    const path = !selected && !highlighted ? hollowPath : filledPath;

    return (
      <svg
        aria-hidden="true"
        className={className}
        ref={ref}
        viewBox="0 0 12 12"
      >
        <g fillRule="evenodd">
          <path d={path} />
        </g>
      </svg>
    );
  }
);
