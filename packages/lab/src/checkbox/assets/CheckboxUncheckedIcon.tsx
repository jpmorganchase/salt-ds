export function CheckboxUncheckedIcon({
  className,
}: {
  className: string;
}): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 14 14"
    >
      <g fillRule="evenodd">
        <rect className={`uitkCheckboxIcon-box`} />
      </g>
    </svg>
  );
}
