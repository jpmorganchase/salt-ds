// The input should only accept numbers, decimal points, and plus/minus symbols
export const isAllowedNonNumeric = (inputCharacter: number | string) => {
  if (typeof inputCharacter === "number") return;
  return (
    ("-+.".includes(inputCharacter) && inputCharacter.length === 1) ||
    inputCharacter === ""
  );
};

export const toFloat = (inputValue?: number | string): number => {
  // Plus, minus, and empty characters are treated as 0
  if (!inputValue || isAllowedNonNumeric(inputValue)) return 0;
  return Number.parseFloat(inputValue.toString());
};

export const isValidNumber = (num: string | number) => {
  if (typeof num === "number") {
    return !Number.isNaN(num);
  }

  // Empty
  if (!num) {
    return false;
  }

  return (
    // Normal type: 11.28
    /^\s*-?\d+(\.\d+)?\s*$/.test(num) ||
    // Pre-number: 1.
    /^\s*-?\d+\.\s*$/.test(num) ||
    // Post-number: .1
    /^\s*-?\.\d+\s*$/.test(num)
  );
};

export const sanitizeInput = (value: string | number) => {
  if (typeof value === "number") return value;
  let sanitizedInput = value.replace(/[^0-9.,+-]/g, "");
  sanitizedInput = sanitizedInput.replace(
    /^([+-]?)(.*)$/,
    (match, sign, rest) => {
      return sign + rest.replace(/[+-]/g, "");
    },
  );
  const parts = sanitizedInput.split(".");
  if (parts.length > 2) {
    sanitizedInput = `${parts[0]}.${parts.slice(1).join("")}`;
  }

  return sanitizedInput;
};

export const isAllowed = (value: string) => {
  const validPatternRegex = /^-?\d*(\.\d*)?$/;
  return validPatternRegex.test(value);
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

export const clampToRange = (min: number, max: number, value: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const isExponential = (number: string | number) => {
  const str = String(number);

  return !Number.isNaN(Number(str)) && str.includes("e");
};

export const getNumberPrecision = (number?: string | number) => {
  if (!number) {
    return 0;
  }
  const numStr: string = String(sanitizeInput(number));

  if (isExponential(number)) {
    let precision = Number(numStr.slice(numStr.indexOf("e-") + 2));

    const decimalMatch = numStr.match(/\.(\d+)/);
    if (decimalMatch?.[1]) {
      precision += decimalMatch[1].length;
    }
    return precision;
  }

  return numStr.includes(".") && isValidNumber(numStr)
    ? numStr.length - numStr.indexOf(".") - 1
    : 0;
};

export const isEmpty = (value: number | string) => {
  return value === "";
};
