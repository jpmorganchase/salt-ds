import {
  CalendarDate,
  CalendarDateTime,
  type DateValue,
  type TimeFields,
  ZonedDateTime,
  getLocalTimeZone,
  toZoned,
} from "@internationalized/date";
import {
  type DateRangeSelection,
  type SingleDateSelection,
  getCurrentLocale,
} from "../calendar";

export type RangeTimeFields = {
  startTime?: TimeFields;
  endTime?: TimeFields;
};

export enum DateInputErrorEnum {
  UNSET = "unset",
  NOT_A_DATE = "not-a-date",
  INVALID_DATE = "date",
  INVALID_MONTH = "month",
  INVALID_DAY = "day",
  INVALID_YEAR = "year",
}

/**
 * DateInput parser error
 */
export type DateInputParserError = {
  /**
   * error code
   */
  type: DateInputErrorEnum | string;
  /**
   * error message
   */
  message: string;
};

/**
 * Detail from parsing the entered value
 */
export type DateInputParserDetails<T=DateValue> = {
  /**
   * Parsed date
   */
  date: T | null | undefined;
  /**
   * Original entered value, if applicable
   */
  value?: string;
  /**
   * errors found by parser
   */
  errors?: DateInputParserError[];
};

export function getMonthNames(locale: string): { [key: string]: number } {
  const monthNames: { [key: string]: number } = {};
  const date = new Date(2000, 0, 1);
  for (let i = 0; i < 12; i++) {
    date.setMonth(i);
    const monthName = new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(date);
    monthNames[monthName.toLowerCase()] = i + 1;
  }
  return monthNames;
}

/**
 * Parses a string into a CalendarDate.
 * @param value - The input date string.
 * @param locale - Locale of date
 * @returns An object containing the parsed date and any error encountered.
 */
export function parseCalendarDate(
  value: string,
  locale: string = getCurrentLocale(),
): DateInputParserDetails {
  if (!value?.length) {
    return {
      date: undefined,
      value: value,
      errors: [{ type: DateInputErrorEnum.UNSET, message: "no date value" }],
    };
  }

  const monthNames = getMonthNames(locale);

  // Combined regular expression to match DD MMM YYYY and DD MM YYYY formats. MM can have an optional 0 prefix
  const combinedDateRegex = /^(\d{1,2})[ \/-](\w{3,4}|\d{1,2})[ \/-](\d{4})$/;

  const match = value.match(combinedDateRegex);

  if (!match) {
    return {
      date: null,
      value: value,
      errors: [
        {
          type: DateInputErrorEnum.NOT_A_DATE,
          message: "not a valid date format",
        },
      ],
    };
  }

  const dayStr = match[1];
  const monthStr = match[2];
  const yearStr = match[3];

  const day = Number.parseInt(dayStr, 10);
  const year = Number.parseInt(yearStr, 10);

  if (Number.isNaN(day) || day < 1 || day > 31) {
    return {
      date: null,
      value: value,
      errors: [
        { type: DateInputErrorEnum.INVALID_DAY, message: "not a valid day" },
      ],
    };
  }

  if (Number.isNaN(year)) {
    return {
      date: null,
      value: value,
      errors: [
        { type: DateInputErrorEnum.INVALID_YEAR, message: "not a valid year" },
      ],
    };
  }

  let month: number;
  if (Number.isNaN(Number.parseInt(monthStr, 10))) {
    // Month is a word, in MMM or MMMM format
    month = monthNames[monthStr.toLowerCase()];
    if (!month) {
      return {
        date: null,
        value: value,
        errors: [
          {
            type: DateInputErrorEnum.INVALID_MONTH,
            message: "not a valid month name for locale",
          },
        ],
      };
    }
  } else {
    // Month is numeric, in MM or M format
    month = Number.parseInt(monthStr, 10);
    if (Number.isNaN(month) || month < 1 || month > 12) {
      return {
        date: null,
        value: value,
        errors: [
          {
            type: DateInputErrorEnum.INVALID_MONTH,
            message: "not a valid month value",
          },
        ],
      };
    }
  }

  try {
    const parsedDate = new CalendarDate(year, month, day);
    return {
      date: parsedDate,
      value: value,
      errors: [],
    };
  } catch (err) {
    return {
      date: null,
      value: value,
      errors: [
        {
          type: DateInputErrorEnum.INVALID_DATE,
          message: (err as Error).message,
        },
      ],
    };
  }
}

/**
 * Parses a string into a ZonedDateTime.
 * @param value - The input date string.
 * @param locale - Locale of date.
 * @param timeZone - The time zone to use for parsing. Defaults to the local time zone.
 * @returns An object containing the parsed date and any error encountered.
 */
export function parseZonedDateTime(
  value: string,
  locale: string = getCurrentLocale(),
  timeZone: string = getLocalTimeZone(),
): DateInputParserDetails<ZonedDateTime> {
  const parsedDate = parseCalendarDate(value, locale);
  if (!parsedDate.date || parsedDate.errors) {
    return { ...parsedDate, date: null };
  }
  try {
    const zonedDate = toZoned(parsedDate.date, timeZone, "compatible");
    return {
      date: zonedDate,
      value: value,
      errors: [],
    };
  } catch (err) {
    return {
      date: null,
      value: value,
      errors: [
        {
          type: DateInputErrorEnum.INVALID_DATE,
          message: (err as Error).message,
        },
      ],
    };
  }
}

/**
 * Checks if a date supports time fields.
 * @param date - The date to check.
 * @returns `true` if the date supports time fields, otherwise `false`.
 */
export const dateSupportsTime = (
  date: DateValue,
): date is CalendarDateTime | ZonedDateTime =>
  date instanceof CalendarDateTime || date instanceof ZonedDateTime;

/**
 * Extracts time fields from a date range selection.
 * @param selectedDate - The selected date range.
 * @returns An object containing the start and end time fields.
 */
export function extractTimeFieldsFromDateRange(
  selectedDate: DateRangeSelection | null,
): RangeTimeFields {
  let startTime: TimeFields | undefined;
  let endTime: TimeFields | undefined;
  if (selectedDate) {
    if (selectedDate.startDate && dateSupportsTime(selectedDate.startDate)) {
      const { hour, minute, second, millisecond } = selectedDate.startDate;
      startTime = { hour, minute, second, millisecond };
    }
    if (selectedDate.endDate && dateSupportsTime(selectedDate.endDate)) {
      const { hour, minute, second, millisecond } = selectedDate.endDate;
      endTime = { hour, minute, second, millisecond };
    }
  }
  return { startTime, endTime };
}

/**
 * Extracts time fields from a single date selection.
 * @param selectedDate - The selected date.
 * @returns The time fields of the selected date, if available.
 */
export function extractTimeFieldsFromDate(
  selectedDate: SingleDateSelection | null,
): TimeFields | undefined {
  if (selectedDate && dateSupportsTime(selectedDate)) {
    const { hour, minute, second, millisecond } = selectedDate;
    return { hour, minute, second, millisecond };
  }
}
