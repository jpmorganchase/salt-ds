import { TZDate } from "@date-fns/tz";
import { enUS as dateFnsEnUs } from "date-fns/locale/en-US";
import { AdapterDateFns } from "../date-fns-adapter";
import type { Timezone } from "../types";

/**
 * Adapter for date-fns library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using date-fns, without timezone support.
 */
export class AdapterDateFnsTZ extends AdapterDateFns {
  constructor({ locale = dateFnsEnUs }) {
    super({
      locale,
    });
  }

  /**
   * Creates a Date object from a string or returns an invalid date.
   * @param value - The date string to parse.
   * @returns The parsed Date object or an invalid date object.
   */
  public date = <T extends string | undefined>(value?: T): Date => {
    if (!value || !super.isValidDateString(value)) {
      return new TZDate(Number.NaN);
    }
    return new TZDate(value);
  };

  /**
   * Gets the current date with the time set to the start of the day.
   * @returns The current date at the start of the day.
   */
  public today(): TZDate {
    let now: TZDate = new TZDate();
    now = this.set(now, {
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }) as TZDate;
    return now;
  }

  /**
   * Gets the current date and time.
   * @returns The current date and time.
   */
  public now(): TZDate {
    return new TZDate();
  }

  /**
   * Get the timezone from the Date object
   * @returns timezone
   */
  public getTimezone = (date: Date): string => {
    return (
      (date as TZDate).timeZone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  };

  /**
   * Set the timezone for the Date object
   * @param date - A Date object
   * @param _timezone - Timezone to set date object to (un-used)
   * @returns  date object set to the timezone
   */
  public setTimezone = (date: Date, timezone: Timezone = "default"): Date => {
    const newTimezone =
      timezone === "system" || timezone === "default"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : timezone;
    let tzdate: Date = new TZDate(date, newTimezone);
    tzdate = this.set(tzdate, {
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    return tzdate;
  };

  /**
   * Clone the date object
   * @param date
   */
  public clone(date: TZDate): TZDate {
    return new TZDate(date.getTime());
  }
}
