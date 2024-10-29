/**
 * Determines the return type for a date builder function.
 *
 * @template T - The type of the input value, which can be a string, null, or undefined.
 * @template TDate - The type of the date object to return.
 *
 * If the input type T is null, the return type is null; otherwise, it is TDate.
 */
export type DateBuilderReturnType<
  T extends string | null | undefined,
  TDate,
> = [T] extends [null] ? null : TDate;

/**
 * Represents the type of a date framework.
 *
 * If the DateFrameworkTypeMap is empty, it defaults to any; otherwise, it is a union of all types in the map.
 */
export type DateFrameworkType = keyof DateFrameworkTypeMap extends never
  ? any
  : DateFrameworkTypeMap[keyof DateFrameworkTypeMap];

/**
 * Determines the return type for a function that creates a date.
 *
 * @template T - The type of the input value, which can be a string, null, or undefined.
 * @template TDate - The type of the date object to return.
 *
 * If the input type T is null, the return type is null; otherwise, it is TDate.
 */
export type CreateDateReturnType<T extends string | null | undefined, TDate> = [
  T,
] extends [null]
  ? null
  : TDate;

/**
 * Enum representing possible date detail error types.
 */
export enum DateDetailErrorEnum {
  /** Error type for unset values */
  UNSET = "unset",
  /** Error type for values that are not a date */
  NOT_A_DATE = "not-a-date",
  /** Error type for invalid date values */
  INVALID_DATE = "date",
  /** Error type for invalid month values */
  INVALID_MONTH = "month",
  /** Error type for invalid day values */
  INVALID_DAY = "day",
  /** Error type for invalid year values */
  INVALID_YEAR = "year",
}

/**
 * Represents an error detail for a date.
 */
export type DateDetailError = {
  /** The error code */
  type: DateDetailErrorEnum | string;
  /** The error message */
  message: string;
};

/**
 * Provides a way to return date errors in a uniform way.
 *
 * @template TDate - The type of the date object.
 */
export type DateDetail<TDate extends DateFrameworkType> = {
  /** The parsed date */
  date: TDate | null | undefined;
  /** The original entered value, if applicable */
  value?: string;
  /** The errors found by the parser */
  errors?: DateDetailError[];
};

/**
 * Represents the time components of a date.
 */
export type TimeFields = {
  /** The hour component */
  hour: number;
  /** The minute component */
  minute: number;
  /** The second component */
  second: number;
  /** The millisecond component */
  millisecond: number;
};
