export function CheckboxIndeterminateIcon({
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
      <g fillRule="evenodd" strokeWidth="1">
        <rect className={`saltCheckboxIcon-box`} />
        <rect
          className={`saltCheckboxIcon-tick`}
          height="2"
          strokeWidth="0"
          width="8"
          x="3"
          y="6"
        />
      </g>
    </svg>
  );
}
