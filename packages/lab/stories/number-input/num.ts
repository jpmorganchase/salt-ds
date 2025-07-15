/**
 * Wrapper for various decimal types classes which can allow it to be swapped
 * in and out for different implementations. At a minimum it should support the following methods:
 * * add
 * * subtract
 * * multiply
 * * divide
 * * setScale
 * * getScale
 * * compareTo
 * * equals
 * * greaterThan
 * * greaterThanOrEqualTo
 * * lessThan
 * * lessThanOrEqualTo
 * * floor
 * * ceiling
 * * toString
 */

/**
 * Wrapped type.
 * This is a customized version of "decimal.js-light" and will not work correctly
 * with the standard version.
 */

import Decimal from "./vendor/decimal";

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

/**
 * Note the MAX_PRECISION is different from decimal places. This is the amount of precision we have to play
 * with for the entire number.
 * @type {number}
 */
const MAX_PRECISION = 150;

/**
 * Currently all Nums wrap a DecimalLight with MAX_PRECISION precision. It may be required in the future to
 * provide both a low-precision and high-precision configuration which can be switched between internally.
 */
const DecimalImplementation = Decimal.clone({ precision: MAX_PRECISION });

const getRoundingMode = (roundingMode?: RoundingEnum): RoundingEnum => {
  return typeof roundingMode !== "undefined"
    ? roundingMode
    : RoundingEnum.ROUND_HALF_UP;
};

const createInstance = (
  numericValue: string | number = 0,
  scaleValue?: number | string,
): Decimal => {
  const scale =
    typeof scaleValue !== "undefined"
      ? -scaleValue // Scale is adjusted to ensure compatibility with Java's BigDecimal
      : 0;

  const instance = new DecimalImplementation(numericValue);
  if (scale !== 0) {
    const factor = new Decimal(10).pow(scale);
    return instance.times(factor);
  }

  return instance;
};

export class Num {
  public static ZERO = new Num(0);
  protected instance: any;
  protected scale: number;

  /**
   * Create a instance of the number class
   * @param { number | string | Num } value Number or numeric value to use as the base
   * @param { number } initialScale scale to apply to value on initialization
   * @constructor
   */
  constructor(
    value?: Decimal | Num | number | string,
    initialScale?: number | string,
  ) {
    let instance;
    let scale = 0;

    if (value instanceof Decimal) {
      instance = value;
      scale = value.decimalPlaces();
    } else if (value instanceof Num) {
      instance = value.instance;
      scale = value.scale;
    } else {
      instance = createInstance(value || 0, initialScale);
      scale = instance.decimalPlaces();
    }

    /**
     * These are stored as public vars for performance reasons. Generating the
     * methods on-the-fly using D.Crockford's "privilaged" method style halves
     * the speed of instantiation.
     */
    this.instance = instance;
    this.scale = scale;
  }

  /**
   * Add two Num's together
   * @param value must be a valid Num
   * @returns {Num}
   */
  public add(value: Num): Num {
    return new Num(this.instance.add(value.instance), this.scale);
  }

  /**
   * Subtract one Num from another
   * @param value must be a valid Num
   * @returns {Num}
   */
  public subtract(value: Num): Num {
    return new Num(this.instance.sub(value.instance), this.getScale());
  }

  /**
   * Multiply two Num's
   * @param value must be a valid Num
   * @returns {Num}
   */
  public multiply(value: Num): Num {
    return new Num(
      this.instance.mul(value.instance),
      this.getScale() + value.getScale(),
    );
  }

  /**
   * Divide two Num's
   * @param value Must be a valid Num
   * @param scale Preferred scale after divide and round
   * @param roundingMode to use when applying scale
   * @returns {Num}
   */
  public divide(value: Num, scale?: number, roundingMode?: RoundingEnum): Num {
    const rm = getRoundingMode(roundingMode);
    return new Num(
      this.instance.div(value.instance).toDecimalPlaces(scale, rm),
      0,
    );
  }

  /**
   * Compare this Num to another Num
   * @param value must be a valid Num
   * @returns {number}
   */
  public compareTo(value: Num): -1 | 0 | 1 {
    if (value === this) {
      return 0;
    }
    return this.instance.comparedTo(value.instance);
  }

  /**
   * Proxy to Num.compareTo
   * @param value Must be a valid Num
   * @returns {boolean}
   */
  public equals(value: Num): boolean {
    return this.compareTo(value) === 0;
  }

  /**
   * Check if a Num is greater than this Num
   * @param value must be a valid Num
   * @returns {boolean}
   */
  public isGreaterThan(value: Num): boolean {
    return this.compareTo(value) > 0;
  }

  /**
   * Check if a Num is greater than or equal to this Num
   * @param value must be a valid Num
   * @returns {boolean}
   */
  public isGreaterThanOrEqualTo(value: Num): boolean {
    return this.compareTo(value) >= 0;
  }

  /**
   * Check if a Num is less than this Num
   * @param value must be a valid Num
   * @returns {boolean}
   */
  public isLessThan(value: Num): boolean {
    return this.compareTo(value) < 0;
  }

  /**
   * * Check if a Num is less than or equal to this Num
   * @param value must be a valid Num
   * @returns {boolean}
   */
  public isLessThanOrEqualTo(value: Num): boolean {
    return this.compareTo(value) <= 0;
  }

  /**
   * Round this num to the specified decimals
   * @param decimalPlaces to round to
   * @param roundingMode @see rounding-enum
   * @returns {Num}
   */
  public round(decimalPlaces: number, roundingMode?: RoundingEnum): Num {
    return new Num(
      this.instance.toDecimalPlaces(
        decimalPlaces,
        getRoundingMode(roundingMode),
      ),
      0,
    );
  }

  /**
   * Returns the largest integer less than or equal to this Num
   * @returns {Num}
   */
  public floor(): Num {
    return new Num(this.instance.floor());
  }

  /**
   * Returns the smallest integer greater than or equal to a this number.
   * @returns {Num}
   */
  public ceil(): Num {
    return new Num(this.instance.ceil());
  }

  /**
   * Returns the absolute value of this number
   * @returns {Num}
   */
  public abs(): Num {
    return new Num(this.instance.abs());
  }

  /**
   * Negates this number
   * @returns {Num}
   */
  public negate(): Num {
    return new Num(this.instance.negated());
  }

  /**
   * Returns the numbers scale value
   * @returns {number|*}
   */
  public getScale(): number {
    return this.scale;
  }

  /**
   * Returns a new num with the scale adjusted to newScale.
   * @param newScale value
   * @param roundingMode @see rounding-enum
   * @returns {Num}
   */
  public setScale(newScale: number, roundingMode?: RoundingEnum): Num {
    if (this.scale === newScale) {
      return this;
    }

    if (this.scale < 0) {
      throw new Error("Negative scales are not currently supported");
    }

    return this.round(newScale, roundingMode);
  }

  /**
   * Returns the unscaled number value
   * @returns {string}
   */
  public getUnscaledValue(): string {
    const scale = this.getScale();
    const instance = this.instance;
    if (scale !== 0) {
      const factor = new Decimal(10).pow(scale);
      return instance.times(factor).toString();
    }
    // Original BigDecimal returns a BigInteger here, we will need to return a string
    return instance.toString();
  }

  /**
   * Formats a number using fixed-point notation.
   * @param decimalPlaces to appear after the decimal
   * @param roundingMode @see rounding-enum
   * @returns {string}
   */
  public toFixed(decimalPlaces: number, roundingMode?: RoundingEnum): string {
    return this.instance.toFixed(decimalPlaces, roundingMode);
  }

  /**
   * Convert the Num to a pure Number.
   * @returns {number}
   */
  public toNumber(): number {
    return Number(this.toString());
  }

  /**
   * Return true if the value of this is 0, otherwise return false.
   *
   */
  public isZero(): boolean {
    return this.instance.isZero();
  }

  /**
   * Return true if the value of this is positive, otherwise return false.
   *
   */
  public isPositive(): boolean {
    return this.instance.isPositive();
  }

  /**
   * Return true if the value of this is negative, otherwise return false.
   *
   */
  public isNegative(): boolean {
    return this.instance.isNegative();
  }

  /**
   * Returns a string representation of the number
   * @returns {string}
   */
  public toString(): string {
    return this.instance.toString();
  }
}
