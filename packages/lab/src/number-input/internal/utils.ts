// The input should only accept numbers, decimal points, and plus/minus symbols
export const ACCEPTED_INPUT = /^[-+]?[0-9]*\.?[0-9]*$/;

export const toFixedDecimalPlaces = (
  inputNumber: number,
  decimalPlaces: number,
) => inputNumber.toFixed(decimalPlaces);

export const isAllowedNonNumeric = (inputCharacter: number | string) => {
  if (typeof inputCharacter === "number") return;
  return (
    ("-+".includes(inputCharacter) && inputCharacter.length === 1) ||
    inputCharacter === ""
  );
};

export const toFloat = (inputValue: number | string) => {
  // Plus, minus, and empty characters are treated as 0
  if (isAllowedNonNumeric(inputValue)) return 0;
  return Number.parseFloat(inputValue.toString());
};

export const sanitizeInput = (numberString: string | number) => {
  if (typeof numberString === "number") return numberString;
  let sanitizedInput = numberString.replace(/[^0-9.+-]/g, "");
  // Ensure only one decimal point is present
  const parts = sanitizedInput.split(".");
  if (parts.length > 2) {
    // If more than one decimal point is found, join the parts with only the first decimal point
    sanitizedInput = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return sanitizedInput;
};

export const isAtMax = (value: number | string, max: number) => {
  return toFloat(value) >= max;
};

export const isAtMin = (value: number | string, min: number) => {
  return toFloat(value) <= min;
};

export const isOutOfRange = (
  value: number | string | undefined,
  min: number,
  max: number,
) => {
  if (value === undefined) return true;
  const floatValue = toFloat(value);
  return floatValue > max || floatValue < min;
};
