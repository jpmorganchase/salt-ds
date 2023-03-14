// This icon is used for the high density checkbox
export function CheckboxCheckedIconHD({
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
      viewBox="0 0 12 12"
    >
      <g fillRule="evenodd">
        <rect className={`saltCheckboxIcon-box`} />
        <path
          className={`saltCheckboxIcon-tick`}
          d="m10 3.70547L4.83651 9.27702L2 6.6259L2.70868 5.86766L4.78375 7.8071L9.23877 3L10 3.70547z"
        />
      </g>
    </svg>
  );
}
