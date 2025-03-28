// The input should only accept numbers, decimal points, and plus/minus symbols
const VALID_FULL_INPUT = /^([-+.]?)[0-9]+(\.[0-9]*)?/;
const VALID_INITIAL_INPUT = /^([+\-.]|)$/;

export function isNumberString(value: unknown) {
  return (
    typeof value === "string" && value !== "" && !Number.isNaN(Number(value))
  );
}

export function canIncrement(value: number | string) {
  if (typeof value === "number") {
    return value < Number.MAX_SAFE_INTEGER;
  }
  return (
    value === "" ||
    (isNumberString(value) && Number(value) < Number.MAX_SAFE_INTEGER)
  );
}

export function canDecrement(value: number | string) {
  if (typeof value === "number") {
    return value > Number.MIN_SAFE_INTEGER;
  }
  return (
    value === "" ||
    (isNumberString(value) && Number(value) > Number.MIN_SAFE_INTEGER)
  );
}

/**
 * Gets the number of decimal places in the input value.
 * @param inputValue
 */
export const getDecimalPlaces = (inputValue: number | string): number => {
  const match = String(inputValue).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    return 0;
  }
  return Math.max(
    0,
    (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0),
  );
};

/**
 * Check whether the values are valid
 * @param floatValue - floating point representation of the value
 * @param value - string representation of the value
 */
export function isValidNumber(
  floatValue: number | undefined,
  value: string,
): floatValue is number {
  return (
    typeof floatValue === "number" &&
    floatValue < Number.MAX_SAFE_INTEGER &&
    floatValue > Number.MIN_SAFE_INTEGER &&
    !Number.isNaN(floatValue) &&
    getDecimalPlaces(value) < 14 &&
    value !== ""
  );
}

export function isInRange(
  value: number | undefined,
  min: number | undefined,
  max: number | undefined,
) {
  if (value === undefined) {
    return true;
  }

  const minValid = min === undefined || value >= min;
  const maxValid = max === undefined || value <= max;

  return minValid && maxValid;
}

/**
 * Checks if the value is invalid or out of the specified range.
 * @param value - The value to check.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns True if the value is invalid or out of range, false otherwise.
 */
export const isInvalid = (value: number, min: number, max: number) => {
  if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) {
    return true;
  }
  return value > max || value < min;
};
