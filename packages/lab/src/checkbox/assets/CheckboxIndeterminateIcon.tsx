export function CheckboxIndeterminateIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 14 14"
    >
      <g fillRule="evenodd" strokeWidth="1">
        <rect height="13" width="13" x="0.5" y="0.5" />
        <rect
          className={`uitkCheckboxIcon-tick`}
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
