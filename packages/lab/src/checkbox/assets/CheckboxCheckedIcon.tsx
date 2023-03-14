import { useDensity } from "@salt-ds/core";

export function CheckboxCheckedIcon({
  className,
}: {
  className: string;
}): JSX.Element {
  const density = useDensity();

  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      shapeRendering="geometricPrecision"
      viewBox="0 0 14 14"
    >
      <g fillRule="evenodd">
        <rect className={`saltCheckboxIcon-box`} />
        {density === "high" ? (
          <path
            className={`saltCheckboxIcon-tick`}
            d="m10 3.70547L4.83651 9.27702L2 6.6259L2.70868 5.86766L4.78375 7.8071L9.23877 3L10 3.70547z"
          />
        ) : (
          <polygon
            className={`saltCheckboxIcon-tick`}
            fillRule="nonzero"
            points="12 4.22226066 10.6259221 3 5.58277771 8.37894955 3.3179086 6.13993399 2 7.40754746 5.63993779 11"
          />
        )}
      </g>
    </svg>
  );
}
