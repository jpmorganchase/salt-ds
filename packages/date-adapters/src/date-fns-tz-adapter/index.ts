import { TZDate } from "@date-fns/tz";
import { AdapterDateFns } from "../date-fns-adapter";
import type { Timezone } from "../types";

/**
 * Adapter for date-fns library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using date-fns, without timezone support.
 */
export class AdapterDateFnsTZ extends AdapterDateFns {
  /**
   * Creates a Date object from a string or returns an invalid date.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use (default is "default").
   * @returns The parsed Date object or an invalid date object.
   */
  public date = <T extends string | undefined>(
    value?: T,
    timezone: Timezone = "default",
  ): TZDate => {
    const newTimezone =
      timezone === "system" || timezone === "default"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : timezone;
    if (!value || !super.isValidDateString(value)) {
      return new TZDate(Number.NaN);
    }
    return new TZDate(value, newTimezone);
  };

  /**
   * Gets the current date with the time set to the start of the day.
   * @param timezone - The timezone to use (default is "default").
   * @returns The current date at the start of the day.
   */
  public today(timezone: Timezone = "default"): TZDate {
    let now: TZDate = this.now(timezone);
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
   * @param timezone - The timezone to use (default is "default").
   * @returns The current date and time.
   */
  public now(timezone: Timezone = "default"): TZDate {
    const newTimezone =
      timezone === "system" || timezone === "default"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : timezone;
    return new TZDate(Date.now(), newTimezone);
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
   * @param timezone - Timezone to set date object to
   * @returns  date object set to the timezone
   */
  public setTimezone = (date: Date, timezone: Timezone = "default"): TZDate => {
    const newTimezone =
      timezone === "system" || timezone === "default"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : timezone;
    // Construct TZDate preserving the wall-clock (local) time in the target timezone.
    // We extract the local date/time components from the source date and recreate them
    // in the target timezone so that "Jan 5 midnight" stays "Jan 5 midnight" regardless
    // of which timezone is selected.
    return new TZDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
      newTimezone,
    );
  };

  /**
   * Clone the date object
   * @param date
   */
  public clone(date: TZDate): TZDate {
    return new TZDate(date.getTime(), this.getTimezone(date));
  }

  /**
   * Convert a TZDate to a plain JS Date.
   * TZDate extends Date but overrides toISOString() to return offset-aware
   * strings (e.g. "+01:00"). Returning a plain Date ensures toISOString()
   * produces standard UTC "Z" strings, consistent with all other adapters.
   * @param value - A TZDate or Date object
   * @returns A plain Date representing the same instant
   */
  public toJSDate = (value: Date): Date => {
    return new Date(value.getTime());
  };
}
