export const toFloat = (value: number | string) =>
  typeof value === "string" ? Number.parseFloat(value) : value;

export const calculateMarkerPosition = (
  value: number | string,
  min: number,
  max: number,
) => {
  const clampedValue = Number.isNaN(toFloat(value))
    ? min
    : Math.min(Math.max(toFloat(value), min), max);

  const markerPosition = ((clampedValue - min) / (max - min)) * 100;
  return markerPosition;
};
