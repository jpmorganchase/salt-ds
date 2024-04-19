export const roundValue = (v: number, step: number) =>
  Math.round(v / step) * step;

export const clampValue = (v: number, min: number, max: number) => {
  if (v < min) {
    return min;
  }
  if (v > max) {
    return max;
  }
  return v;
};
