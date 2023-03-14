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
            d="m9.99656 3.30278L4.86481 9.20967L2.01196 6.67379L2.67633 5.92638L4.77323 7.79031L9.24166 2.64694L9.99656 3.30278z"
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
