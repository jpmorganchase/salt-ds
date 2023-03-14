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
            transform={"translate(1,1)"}
            d="m8 0.705475L2.83651 6.27702L0 3.6259L0.708682 2.86766L2.78375 4.8071L7.23877 0L8 0.705475z"
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
