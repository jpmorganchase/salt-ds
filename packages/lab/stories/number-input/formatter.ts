import { padEnd, padStart, trim } from "lodash-es";
import { Num } from "./num";

export enum RoundingEnum {
  ROUND_UP = 0,
  ROUND_DOWN = 1,
  ROUND_CEIL = 2,
  ROUND_FLOOR = 3,
  ROUND_HALF_UP = 4,
  ROUND_HALF_DOWN = 5,
  ROUND_HALF_EVEN = 6,
  ROUND_HALF_CEIL = 7,
  ROUND_HALF_FLOOR = 8,
}

export enum QuoteFormat {
  DECIMAL = "decimal",
  FRACTIONAL = "fractional",
  FRACTIONAL_FUTURE = "fractionalFuture",
}

export function isFractional(quoteFormat?: QuoteFormat) {
  return (
    quoteFormat &&
    (quoteFormat === QuoteFormat.FRACTIONAL ||
      quoteFormat === QuoteFormat.FRACTIONAL_FUTURE)
  );
}

export function isFractionalFuture(quoteFormat?: QuoteFormat) {
  return quoteFormat && quoteFormat === QuoteFormat.FRACTIONAL_FUTURE;
}

const FUTURES_LAST_DIGIT_LOOKUP: Record<number, number> = {
  0: 0,
  1: 0.125,
  2: 0.25,
  3: 0.375,
  4: 0.5,
  5: 0.625,
  6: 0.75,
  7: 0.875,
  8: Number.NaN,
};
const CME_CONVENTION_FUTURES_LAST_DIGIT_LOOKUP: Record<number, number> = {
  0: 0,
  1: 0.125,
  2: 0.25,
  3: 0.375,
  4: Number.NaN,
  5: 0.5,
  6: 0.625,
  7: 0.75,
  8: 0.875,
};

const FUTURES_LAST_DIGIT_DISPLAY_LOOKUP: Record<number, string> = {
  // Below are the correct futures last digits per CME convention
  // however, sales are having hard time, so we are requested to show as cash fractional
  // 0 : '0',
  // 1 : '1',
  // 2 : '2',
  // 3 : '3',
  // 5 : '5',
  // 6 : '6',
  // 7 : '7'
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  5: "+",
  6: "5",
  7: "6",
  8: "7",
};

export class Fraction32ndParser {
  public static to32nd(
    value: string,
    roundingMode?: RoundingEnum.ROUND_UP | RoundingEnum.ROUND_DOWN,
  ): string {
    if (value === undefined || value === null) {
      return "";
    }
    const numericValue: number = Number(value);
    if (Number.isNaN(numericValue)) {
      return Fraction32ndParser.isValidFraction(value) ? value : "";
    }

    let points: number = Math.floor(numericValue);
    const fraction: number = (numericValue - points) * Fraction32ndParser.BASE;
    let ticksNum: number = Math.floor(fraction);
    const fractionRemainder: number = fraction % 1;
    let halfTicks: number = fractionRemainder * Fraction32ndParser.TICK;
    if (roundingMode !== undefined) {
      const roundingFun: (x: number) => number =
        roundingMode === RoundingEnum.ROUND_UP ? Math.ceil : Math.floor;
      halfTicks = roundingFun(halfTicks);
    } else {
      halfTicks = Math.round(halfTicks);
    }

    if (halfTicks >= Fraction32ndParser.TICK) {
      halfTicks = 0;
      ticksNum += 1;
    }
    if (ticksNum >= Fraction32ndParser.BASE) {
      ticksNum = 0;
      points += 1;
    }

    const ticks: string = ticksNum < 10 ? `0${ticksNum}` : `${ticksNum}`;
    let halfTicksStr: string = halfTicks.toString();
    if (halfTicks === Fraction32ndParser.HALF_TICK) {
      halfTicksStr = Fraction32ndParser.HALF_TICK_SIGN;
    }

    return `${points}${Fraction32ndParser.FRACTION_SIGN}${ticks}${halfTicksStr}`;
  }

  public static from32nd(value: string): number {
    if (!value || !Fraction32ndParser.isValidPartialFraction(value)) {
      console.log("not a valid fraction");
      return Number.NaN;
    }

    const parts: string[] = value.split(Fraction32ndParser.FRACTION_SIGN);
    const fractions: string = parts[1];
    let decimals = 0;

    if (fractions && fractions.length > 0 && fractions.length <= 3) {
      const _32ndFraction: number = Number.parseInt(
        fractions.substring(0, Math.min(fractions.length, 2)),
        10,
      );
      decimals = _32ndFraction / Fraction32ndParser.BASE;
      if (fractions.length === 3) {
        const halfTicks = fractions.substring(2);
        const halfTicksNum =
          halfTicks === Fraction32ndParser.HALF_TICK_SIGN
            ? Fraction32ndParser.HALF_TICK
            : Number.parseInt(halfTicks, 10);
        decimals +=
          halfTicksNum / Fraction32ndParser.TICK / Fraction32ndParser.BASE;
      }
    }

    return Number.parseInt(parts[0], 10) + decimals;
  }

  public static from32ndDecimal(value: string): number {
    if (!value || !Fraction32ndParser.isValidPartialFractionDecimal(value)) {
      return Number.NaN;
    }

    const parts: string[] = value.split(Fraction32ndParser.FRACTION_SIGN);
    const fractions: string = parts[1];
    let decimals = 0;

    if (fractions && fractions.length > 0) {
      const _32ndFraction: number = Number.parseInt(
        fractions.substring(0, Math.min(fractions.length, 2)),
        10,
      );
      decimals = _32ndFraction / Fraction32ndParser.BASE;
      if (fractions.length >= 3) {
        const decimalTicks = fractions.substring(2, fractions.length);
        const convertedDecimalTicks = decimalTicks.replace(
          "+",
          Fraction32ndParser.HALF_TICK.toString(),
        );
        const decimalTicksNum = Number.parseFloat(convertedDecimalTicks);

        decimals +=
          decimalTicksNum / Fraction32ndParser.TICK / Fraction32ndParser.BASE;
      }
    }
    return Number.parseInt(parts[0], 10) + decimals;
  }

  public static from32ndFuture(
    value: string,
    useCMEConvention?: boolean,
  ): number {
    if (!value || !Fraction32ndParser.isValidPartialFractionFuture(value)) {
      return Number.NaN;
    }

    const parts: string[] = value.split(Fraction32ndParser.FRACTION_SIGN);
    const fractions: string = parts[1];
    let decimals = 0;

    if (fractions && fractions.length > 0) {
      const _32ndFractionString = padEnd(
        fractions.substring(0, Math.min(fractions.length, 2)),
        2,
        "0",
      );
      const _32ndFraction: number = Number.parseInt(_32ndFractionString, 10);
      decimals = _32ndFraction / Fraction32ndParser.BASE;
      if (fractions.length >= 3) {
        const lastDigit = fractions.substring(2, fractions.length);
        const lastDigitWithPlusConverted =
          lastDigit === "+" ? 4 : Number(lastDigit);
        let lastDigitValue = useCMEConvention
          ? CME_CONVENTION_FUTURES_LAST_DIGIT_LOOKUP[lastDigitWithPlusConverted]
          : FUTURES_LAST_DIGIT_LOOKUP[lastDigitWithPlusConverted];
        if (lastDigitValue === undefined) {
          lastDigitValue = 0;
        }
        decimals += lastDigitValue / Fraction32ndParser.BASE;
      }
    }
    return Number.parseInt(parts[0], 10) + decimals;
  }

  public static to32ndDecimal(
    value: string,
    roundingMode?: RoundingEnum.ROUND_UP | RoundingEnum.ROUND_DOWN,
  ): string {
    if (value === undefined || value === null) {
      return "";
    }
    const numericValue: number = Number(value);
    if (Number.isNaN(numericValue)) {
      return Fraction32ndParser.isValidPartialFractionDecimal(value)
        ? value
        : "";
    }

    const points: number = Math.floor(numericValue);
    const fraction: number = (numericValue - points) * Fraction32ndParser.BASE;

    const base32 = Math.floor(fraction);
    const base32Str =
      base32.toString().length < 2 ? `0${base32}` : base32.toString();

    const base256 = new Num(fraction - Math.floor(fraction)).multiply(
      new Num(Fraction32ndParser.TICK),
    );
    const roundedTick: Num = Fraction32ndParser.roundTick(
      base256,
      new Num(0.25),
      roundingMode,
    );

    let base256Str = roundedTick.toString();
    base256Str = base256Str.match(/\./)
      ? padEnd(base256Str, 4, "0")
      : base256Str;

    if (
      Number.parseInt(base256Str.substring(0, 1), 10) ===
      Fraction32ndParser.HALF_TICK
    ) {
      base256Str = `${Fraction32ndParser.HALF_TICK_SIGN}${base256Str.substring(1)}`;
    }

    return `${points}${Fraction32ndParser.FRACTION_SIGN}${base32Str}${base256Str}`;
  }

  public static to32ndFuture(
    value: string | undefined,
    useCMEConvention?: boolean,
    minimalTickSize?: number,
  ): string {
    if (
      value === undefined ||
      value === null ||
      minimalTickSize === undefined ||
      minimalTickSize === 0
    ) {
      return "";
    }
    const numericValue: number = Number(value);
    if (Number.isNaN(numericValue)) {
      return Fraction32ndParser.isValidPartialFractionFuture(value)
        ? value
        : "";
    }

    const points: number = Math.floor(numericValue);
    const fraction: number = (numericValue - points) * Fraction32ndParser.BASE;

    const base32 = Math.floor(fraction);
    const lastDigitValue: number = fraction - Math.floor(fraction);
    const minimum32ndsTick = minimalTickSize * 32;
    const lastDigitValueRoundedForTicks: number =
      Math.round(lastDigitValue / minimum32ndsTick) * minimum32ndsTick;
    const roundedLastDigit: number = Math.floor(
      lastDigitValueRoundedForTicks * 10,
    );
    const lastDigitString = useCMEConvention
      ? roundedLastDigit.toString()
      : FUTURES_LAST_DIGIT_DISPLAY_LOOKUP[roundedLastDigit];
    const fractionalString = padStart(base32.toString(), 2, "0");
    return `${points}${Fraction32ndParser.FRACTION_SIGN}${fractionalString}${lastDigitString}`;
  }

  public static isValidPriceTickForQuoteFormat(
    price: Num,
    quoteFormat: QuoteFormat,
    minimalTickSize?: number,
  ): boolean {
    return isFractionalFuture(quoteFormat)
      ? Fraction32ndParser.isValidPriceTickForFuture(price, minimalTickSize)
      : Fraction32ndParser.isValidPriceTick(price);
  }

  public static isValidPriceTick(price: Num): boolean {
    return price.divide(Fraction32ndParser.ROUNDING_STEP).getScale() === 0;
  }

  public static isValidPriceTickForFuture(
    price: Num,
    minimalTickSize?: number,
  ): boolean {
    return minimalTickSize
      ? price.divide(new Num(minimalTickSize)).getScale() === 0
      : false;
  }

  public static roundTick(
    tick: Num,
    tickSize: Num,
    rounding:
      | RoundingEnum.ROUND_UP
      | RoundingEnum.ROUND_DOWN = RoundingEnum.ROUND_UP,
  ): Num {
    const step = tick.divide(tickSize);
    const rounded =
      rounding === RoundingEnum.ROUND_UP ? step.ceil() : step.floor();
    return rounded.multiply(tickSize);
  }

  /**
   * Returns true if the (trimmed) value is a partial fraction, or empty string.
   * @param {string} value
   * @returns {boolean}
   */
  public static isValidPartialFraction(value: string): boolean {
    const trimmedValue: string = trim(value);
    return (
      trimmedValue === "" ||
      Fraction32ndParser.VALID_PARTIAL_FRACTION_REGEX.test(trimmedValue)
    );
  }
  public static isValidFraction(value: string): boolean {
    const trimmedValue: string = trim(value);
    return (
      trimmedValue === "" ||
      Fraction32ndParser.VALID_FRACTION_REGEX.test(trimmedValue)
    );
  }

  public isValidPartialFraction(
    value: string,
    quoteFormat: QuoteFormat,
  ): boolean {
    return quoteFormat === QuoteFormat.FRACTIONAL_FUTURE
      ? Fraction32ndParser.isValidPartialFractionFuture(value)
      : Fraction32ndParser.isValidPartialFractionDecimal(value);
  }

  public static isValidPartialFractionDecimal(value: string): boolean {
    const trimmedValue: string = trim(value);
    return (
      trimmedValue === "" ||
      Fraction32ndParser.VALID_PARTIAL_FRACTION_REGEX_DECIMAL.test(trimmedValue)
    );
  }

  public static isValidPartialFractionFuture(value: string): boolean {
    const trimmedValue: string = trim(value);
    return (
      trimmedValue === "" ||
      Fraction32ndParser.VALID_PARTIAL_FRACTION_REGEX_FUTURE.test(trimmedValue)
    );
  }

  /**
   * Will return true for partial fraction future strings, and if the last digit is present,
   * it will validate the entire value, taking the minimal tick size into account.
   * @param {string} value
   * @param {QuoteFormat} quoteFormat
   * @param {boolean} useCMEConvention
   * @param {number} minimalTickSize
   * @returns {boolean}
   */
  public static isValidPartialFractionFutureForQuoteFormat(
    value: string,
    useCMEConvention?: boolean,
    minimalTickSize?: number,
  ): boolean {
    const trimmedValue: string = trim(value);
    if (trimmedValue === "") {
      return true;
    }
    const matches = trimmedValue.match(
      Fraction32ndParser.VALID_PARTIAL_FRACTION_REGEX_FUTURE,
    );
    if (!matches) {
      return false;
    }
    const lastDigit: string | undefined = matches[2];
    if (lastDigit) {
      const price = Fraction32ndParser.from32ndFuture(value, useCMEConvention);
      return (
        !Number.isNaN(price) &&
        Fraction32ndParser.isValidPriceTickForFuture(
          new Num(price),
          minimalTickSize,
        )
      );
    }
    return true;
  }
  //eslint-disable-next-line no-useless-escape
  private static VALID_PARTIAL_FRACTION_REGEX: RegExp =
    /^\d+\-?(\d{0,1}|\d{2}(\d|\+)?)?$/;
  //eslint-disable-next-line no-useless-escape
  private static VALID_PARTIAL_FRACTION_REGEX_DECIMAL: RegExp =
    /^\d+\-?(\d{0,2}|\d{2}(\d|\+)|\d{2}(\d|\+)\.\d{0,2})$/;
  //eslint-disable-next-line no-useless-escape
  private static VALID_PARTIAL_FRACTION_REGEX_FUTURE: RegExp =
    /^\d+\-?(\d{0,1}|\d{2}([0-8\+ ])?)?$/;
  //eslint-disable-next-line no-useless-escape
  private static VALID_FRACTION_REGEX: RegExp = /^\d+\-\d{2}(\d|\+)?$/;

  private static ROUNDING_STEP = new Num(1 / 1024);
  private static HALF_TICK_SIGN = "+";
  private static FRACTION_SIGN = "-";
  private static BASE = 32;
  private static TICK = 8;
  private static HALF_TICK = 4;
}
