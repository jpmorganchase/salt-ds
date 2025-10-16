import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { describe, expect, it } from "vitest";
import { AdapterDayjs } from "../dayjs-adapter";
import { DateDetailError } from "../index";

// Extend dayjs with necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

describe("GIVEN a AdapterDayjs", () => {
  const adapter = new AdapterDayjs({ locale: "en" });

  it("SHOULD create a Dayjs date in the system timezone", () => {
    const date = adapter.date("2023-11-01", "system");
    expect(date.isValid()).toBe(true);
    expect(date.format("YYYY-MM-DD")).toBe("2023-11-01");
  });

  it("SHOULD create a Dayjs date in UTC", () => {
    const date = adapter.date("2023-11-01", "UTC");
    expect(date.isValid()).toBe(true);
    expect(date.format("YYYY-MM-DD")).toBe("2023-11-01");
    expect(date.utcOffset()).toBe(0); // UTC offset should be 0
  });

  it("SHOULD create a Dayjs date in a specific timezone", () => {
    const timezone = "America/New_York";
    const date = adapter.date("2023-11-01", timezone);
    expect(date.isValid()).toBe(true);
    expect(date.format("YYYY-MM-DD")).toBe("2023-11-01");
    expect(date.tz(timezone).format("Z")).toBe(date.format("Z")); // Check if the timezone is applied
  });

  it("SHOULD handle invalid date strings", () => {
    const date = adapter.date("invalid-date", "system");
    expect(date.isValid()).toBe(false);
  });

  it("SHOULD handle empty date strings", () => {
    const date = adapter.date("", "system");
    expect(date.isValid()).toBe(false);
  });

  it("SHOULD handle default timezone when no timezone is specified", () => {
    const date = adapter.date("2023-11-01");
    expect(date.isValid()).toBe(true);
    expect(date.format("YYYY-MM-DD")).toBe("2023-11-01");
  });

  it("SHOULD format a Dayjs date correctly", () => {
    const date = dayjs("2023-11-01");
    const formattedDate = adapter.format(date, "DD MMM YYYY");
    expect(formattedDate).toBe("01 Nov 2023");
  });

  it("SHOULD parse a date string correctly", () => {
    const result = adapter.parse("01 Nov 2023", "DD MMM YYYY");
    expect(adapter.isValid(result.date)).toBe(true);
    expect(result.date.year()).toBe(2023);
    expect(result.date.month()).toBe(10); // Months are 0-indexed
    expect(result.date.date()).toBe(1);
  });

  it("SHOULD return an error for invalid date parsing", () => {
    const result = adapter.parse("invalid date", "DD MMM YYYY");
    expect(adapter.isValid(result.date)).toBe(false);
    expect(result.errors).toEqual([
      {
        message: "not a valid date",
        type: DateDetailError.INVALID_DATE,
      },
    ]);
  });

  it("SHOULD compare two Dayjs dates correctly", () => {
    const dateA = dayjs("2023-11-01");
    const dateB = dayjs("2023-11-02");
    expect(adapter.compare(dateA, dateB)).toBe(-1);
    expect(adapter.compare(dateB, dateA)).toBe(1);
    expect(adapter.compare(dateA, dateA)).toBe(0);
  });

  it("SHOULD add time to a Dayjs date correctly", () => {
    const date = dayjs("2023-11-01");
    const newDate = adapter.add(date, { days: 5, months: 1 });
    expect(newDate.date()).toBe(6);
    expect(newDate.month()).toBe(11); // December
  });

  it("SHOULD subtract time from a Dayjs date correctly", () => {
    const date = dayjs("2023-11-06");
    const newDate = adapter.subtract(date, { days: 5, months: 1 });
    expect(newDate.date()).toBe(1);
    expect(newDate.month()).toBe(9); // October
  });

  it("SHOULD set specific components of a Dayjs date", () => {
    const date = dayjs("2023-11-01");
    const newDate = adapter.set(date, { day: 15, month: 12, year: 2025 });
    expect(newDate.date()).toBe(15);
    expect(newDate.month()).toBe(11); // December
    expect(newDate.year()).toBe(2025);
  });

  it("SHOULD check if two Dayjs dates are the same day", () => {
    const dateA = dayjs("2023-11-01");
    const dateB = dayjs("2023-11-01T12:00:00"); // Same day, different time
    expect(adapter.isSame(dateA, dateB, "day")).toBe(true);
  });

  it("SHOULD get the start of a day", () => {
    const date = dayjs("2023-11-01T12:30:00");
    const startOfDay = adapter.startOf(date, "day");
    expect(startOfDay.hour()).toBe(0);
    expect(startOfDay.minute()).toBe(0);
  });

  it("SHOULD get the end of a day", () => {
    const date = dayjs("2023-11-01T12:30:00");
    const endOfDay = adapter.endOf(date, "day");
    expect(endOfDay.hour()).toBe(23);
    expect(endOfDay.minute()).toBe(59);
  });

  it("SHOULD return today's date at the start of the day", () => {
    const today = adapter.today();
    const now = dayjs();
    expect(today.year()).toBe(now.year());
    expect(today.month()).toBe(now.month());
    expect(today.date()).toBe(now.date());
    expect(today.hour()).toBe(0);
    expect(today.minute()).toBe(0);
  });

  it("SHOULD return the current date and time", () => {
    const now = adapter.now();
    const current = dayjs();
    expect(now.year()).toBe(current.year());
    expect(now.month()).toBe(current.month());
    expect(now.date()).toBe(current.date());
  });

  it("SHOULD get the day of the week", () => {
    const date = dayjs("2023-11-01"); // November 1, 2023 is a Wednesday
    expect(adapter.getDayOfWeek(date)).toBe(3); // 0 = Sunday, 3 = Wednesday
  });

  it("SHOULD get the name of the day of the week", () => {
    const dayName = adapter.getDayOfWeekName(3, "long");
    expect(dayName).toBe("Wednesday");
  });

  it("SHOULD get the day of the month", () => {
    const date = dayjs("2023-11-15");
    expect(adapter.getDay(date)).toBe(15);
  });

  it("SHOULD get the month of the year", () => {
    const date = dayjs("2023-11-15");
    expect(adapter.getMonth(date)).toBe(11); // November
  });

  it("SHOULD get the year", () => {
    const date = dayjs("2023-11-15");
    expect(adapter.getYear(date)).toBe(2023);
  });

  it("SHOULD get the time components of a Dayjs date", () => {
    const date = dayjs("2023-11-15T14:30:45.123");
    const timeFields = adapter.getTime(date);
    expect(timeFields.hour).toBe(14);
    expect(timeFields.minute).toBe(30);
    expect(timeFields.second).toBe(45);
    expect(timeFields.millisecond).toBe(123);
  });

  it("SHOULD clone a Dayjs date", () => {
    const date = dayjs("2023-11-15");
    const clonedDate = adapter.clone(date);
    expect(clonedDate.isSame(date)).toBe(true);
    expect(clonedDate).not.toBe(date); // Ensure it's a different instance
  });

  const TIMEZONES = ["America/New_York", "Europe/London"];
  const ISO_UTC = "2025-10-13T03:30:00.000Z";
  const ISO_LOCAL = "2025-10-13T03:30:00";

  describe("GIVEN isSame is passed dates with timezones, London and New York", () => {
    ["day", "month", "year"].forEach((granularity) => {
      TIMEZONES.forEach((tz) => {
        it(`SHOULD isSame: ${ISO_UTC} (${tz}) vs ${ISO_UTC} (${tz}) [granularity: ${granularity}]`, () => {
          const dateA = adapter.date(ISO_UTC, tz);
          const dateB = adapter.date(ISO_UTC, tz);
          let expected;
          switch (granularity) {
            case "year":
              expected = dateA.year() === dateB.year();
              break;
            case "month":
              expected =
                dateA.year() === dateB.year() &&
                dateA.month() === dateB.month();
              break;
            case "day":
              expected =
                dateA.year() === dateB.year() &&
                dateA.month() === dateB.month() &&
                dateA.date() === dateB.date();
              break;
          }
          const validGranularity: "month" | "day" | "year" | undefined =
            granularity as "month" | "day" | "year" | undefined;
          expect(adapter.isSame(dateA, dateB, validGranularity)).toBe(expected);
        });

        it(`SHOULD isSame: ${ISO_LOCAL} (${tz}) vs ${ISO_LOCAL} (${tz}) [granularity: ${granularity}]`, () => {
          const dateA = adapter.date(ISO_LOCAL, tz);
          const dateB = adapter.date(ISO_LOCAL, tz);
          let expected;
          switch (granularity) {
            case "year":
              expected = dateA.year() === dateB.year();
              break;
            case "month":
              expected =
                dateA.year() === dateB.year() &&
                dateA.month() === dateB.month();
              break;
            case "day":
              expected =
                dateA.year() === dateB.year() &&
                dateA.month() === dateB.month() &&
                dateA.date() === dateB.date();
              break;
          }
          const validGranularity: "month" | "day" | "year" | undefined =
            granularity as "month" | "day" | "year" | undefined;
          expect(adapter.isSame(dateA, dateB, validGranularity)).toBe(expected);
        });

        it(`SHOULD isSame: ${ISO_UTC} (${tz}) vs ${ISO_LOCAL} (${tz}) [granularity: ${granularity}]`, () => {
          const dateA = adapter.date(ISO_UTC, tz);
          const dateB = adapter.date(ISO_LOCAL, tz);
          // This will only be true if the UTC time and the local time represent the same calendar day in the given timezone.
          let expected =
            dateA.year() === dateB.year() &&
            (granularity === "year" || dateA.month() === dateB.month()) &&
            (granularity !== "day" || dateA.date() === dateB.date());
          const validGranularity: "month" | "day" | "year" | undefined =
            granularity as "month" | "day" | "year" | undefined;
          expect(adapter.isSame(dateA, dateB, validGranularity)).toBe(expected);
        });
      });
    });

    it("SHOULD isSame: different days, same timezone", () => {
      const dateA = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      const dateB = adapter.date("2025-10-12T03:30:00.000Z", "UTC");
      expect(adapter.isSame(dateA, dateB, "day")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "month")).toBe(true);
      expect(adapter.isSame(dateA, dateB, "year")).toBe(true);
    });

    it("SHOULD isSame: different days, different timezones", () => {
      const dateA = adapter.date(
        "2025-10-13T00:00:00.000Z",
        "America/New_York",
      );
      const dateB = adapter.date("2025-10-13T00:00:00.000Z", "Europe/London");
      expect(adapter.isSame(dateA, dateB, "day")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "month")).toBe(true);
      expect(adapter.isSame(dateA, dateB, "year")).toBe(true);
    });

    describe("GIVEN DST edge case for 2025", () => {
      // DST ends in NY: Nov 2, 2025, at 2:00 AM (clocks go back to 1:00 AM)
      // 1:30 AM EDT (before fallback) is 2025-11-02T05:30:00.000Z
      // 1:30 AM EST (after fallback) is 2025-11-02T06:30:00.000Z
      const utcBeforeFallback = "2025-11-02T05:30:00.000Z";
      const utcAfterFallback = "2025-11-02T06:30:00.000Z";

      it("SHOULD isSame: 1:30 AM before and after DST fallback in NY (should NOT be same hour)", () => {
        const dateBefore = adapter.date(utcBeforeFallback, "America/New_York");
        const dateAfter = adapter.date(utcAfterFallback, "America/New_York");

        // Both are 1:30 AM local, but one is EDT, one is EST
        expect(dateBefore.format("YYYY-MM-DD HH:mm a Z")).toBe(
          "2025-11-02 01:30 am -04:00",
        );
        expect(dateAfter.format("YYYY-MM-DD HH:mm a Z")).toBe(
          "2025-11-02 01:30 am -05:00",
        );

        expect(adapter.isSame(dateBefore, dateAfter, "day")).toBe(true);
        expect(adapter.isSame(dateBefore, dateAfter, "month")).toBe(true);
        expect(adapter.isSame(dateBefore, dateAfter, "year")).toBe(true);
      });

      it("SHOULD isSame: UTC vs NY time during DST transition", () => {
        // 2025-11-02T05:30:00.000Z is 1:30 AM EDT in NY
        const dateUTC = adapter.date(utcBeforeFallback, "UTC");
        const dateNY = adapter.date(utcBeforeFallback, "America/New_York");

        expect(adapter.isSame(dateUTC, dateNY, "day")).toBe(true);
      });
    });
  });

  describe("GIVEN isSame is passed an invalid date", () => {
    it("SHOULD return false if dateA is invalid", () => {
      const dateA = adapter.date("invalid-date", "UTC");
      const dateB = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      expect(adapter.isSame(dateA, dateB, "day")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "month")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "year")).toBe(false);
    });

    it("SHOULD return false if dateB is invalid", () => {
      const dateA = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      const dateB = adapter.date("invalid-date", "UTC");
      expect(adapter.isSame(dateA, dateB, "day")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "month")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "year")).toBe(false);
    });

    it("SHOULD return false if both dates are invalid", () => {
      const dateA = adapter.date("invalid-date", "UTC");
      const dateB = adapter.date("invalid-date", "UTC");
      expect(adapter.isSame(dateA, dateB, "day")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "month")).toBe(false);
      expect(adapter.isSame(dateA, dateB, "year")).toBe(false);
    });
  });

  describe("GIVEN compare is passed dates with timezones", () => {
    // Basic comparisons
    it("SHOULD compare: same UTC date/time returns 0", () => {
      const dateA = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      const dateB = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      expect(adapter.compare(dateA, dateB)).toBe(0);
    });

    it("SHOULD compare: dateA before dateB returns -1", () => {
      const dateA = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      const dateB = adapter.date("2025-10-14T03:30:00.000Z", "UTC");
      expect(adapter.compare(dateA, dateB)).toBe(-1);
    });

    it("SHOULD compare: dateA after dateB returns 1", () => {
      const dateA = adapter.date("2025-10-15T03:30:00.000Z", "UTC");
      const dateB = adapter.date("2025-10-14T03:30:00.000Z", "UTC");
      expect(adapter.compare(dateA, dateB)).toBe(1);
    });

    it("SHOULD compare: same moment, different timezones returns 0", () => {
      const iso = "2025-10-13T03:30:00.000Z";
      const dateUTC = adapter.date(iso, "UTC");
      const dateNY = adapter.date(iso, "America/New_York");
      const dateLondon = adapter.date(iso, "Europe/London");
      expect(adapter.compare(dateUTC, dateNY)).toBe(0);
      expect(adapter.compare(dateUTC, dateLondon)).toBe(0);
      expect(adapter.compare(dateNY, dateLondon)).toBe(0);
    });

    it("SHOULD compare: local time string, different timezones", () => {
      const local = "2025-10-13T03:30:00";
      const dateNY = adapter.date(local, "America/New_York");
      const dateLondon = adapter.date(local, "Europe/London");
      // These represent different moments in time
      if (dateNY.utc().valueOf() < dateLondon.utc().valueOf()) {
        expect(adapter.compare(dateNY, dateLondon)).toBe(-1);
      } else if (dateNY.utc().valueOf() > dateLondon.utc().valueOf()) {
        expect(adapter.compare(dateNY, dateLondon)).toBe(1);
      } else {
        expect(adapter.compare(dateNY, dateLondon)).toBe(0);
      }
    });

    // DST edge case (2025, New York)
    describe("GIVEN compare and DST edge case (2025, NY)", () => {
      // DST ends in NY: Nov 2, 2025, at 2:00 AM (clocks go back to 1:00 AM)
      // 1:30 AM EDT (before fallback) is 2025-11-02T05:30:00.000Z
      // 1:30 AM EST (after fallback) is 2025-11-02T06:30:00.000Z
      const utcBeforeFallback = "2025-11-02T05:30:00.000Z";
      const utcAfterFallback = "2025-11-02T06:30:00.000Z";

      it("compare: 1:30 AM EDT vs 1:30 AM EST (should be -1)", () => {
        const dateBefore = adapter.date(utcBeforeFallback, "America/New_York");
        const dateAfter = adapter.date(utcAfterFallback, "America/New_York");
        expect(adapter.compare(dateBefore, dateAfter)).toBe(-1);
        expect(adapter.compare(dateAfter, dateBefore)).toBe(1);
      });

      it("compare: UTC vs NY time during DST transition", () => {
        const dateUTC = adapter.date(utcBeforeFallback, "UTC");
        const dateNY = adapter.date(utcBeforeFallback, "America/New_York");
        expect(adapter.compare(dateUTC, dateNY)).toBe(0);
      });
    });

    // Invalid dates
    it("compare: invalid date returns -1 if dateA is invalid", () => {
      const dateA = adapter.date("invalid-date", "UTC");
      const dateB = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      // Your implementation may vary; adjust expectation if needed
      expect(adapter.compare(dateA, dateB)).toBe(-1);
    });

    it("compare: invalid date returns 1 if dateB is invalid", () => {
      const dateA = adapter.date("2025-10-13T03:30:00.000Z", "UTC");
      const dateB = adapter.date("invalid-date", "UTC");
      // Your implementation may vary; adjust expectation if needed
      expect(adapter.compare(dateA, dateB)).toBe(1);
    });

    it("compare: both dates invalid returns 0", () => {
      const dateA = adapter.date("invalid-date", "UTC");
      const dateB = adapter.date("invalid-date", "UTC");
      // Your implementation may vary; adjust expectation if needed
      expect(adapter.compare(dateA, dateB)).toBe(0);
    });
  });
});
