// The input should only accept numbers, decimal points, and plus/minus symbols
export const ACCEPT_INPUT = /^[-+]?[0-9]*\.?([0-9]+)?/g;

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

export const sanitizedInput = (numberString: string) =>
  (numberString.match(ACCEPT_INPUT) || []).join("");

export const isAtMax = (value: number | string | undefined, max: number) => {
  if (value === undefined) return true;
  return toFloat(value) >= max;
};

export const isAtMin = (value: number | string | undefined, min: number) => {
  if (value === undefined) return true;
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
