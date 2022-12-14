export function CheckboxCheckedIcon({
  className,
}: {
  className: string;
}): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      shapeRendering="geometricPrecision"
      viewBox="0 0 14 14"
    >
      <g fillRule="evenodd">
        <rect className={`uitkCheckboxIcon-box`} />
        <polygon
          className={`uitkCheckboxIcon-tick`}
          fillRule="nonzero"
          points="12 4.22226066 10.6259221 3 5.58277771 8.37894955 3.3179086 6.13993399 2 7.40754746 5.63993779 11"
        />
      </g>
    </svg>
  );
}
