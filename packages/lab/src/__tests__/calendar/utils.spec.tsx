import { describe, expect, it } from "vitest";
import { parseCalendarDate } from "../../date-input";

describe("parseCalendarDate", () => {
  it("should return null date and false error for empty input", () => {
    const result = parseCalendarDate("", "en-GB");
    expect(result).toEqual({ date: null, error: false });
  });

  it("should parse date with space separator", () => {
    const result = parseCalendarDate("12 Jan 2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 1, day: 12 },
      error: false,
    });
  });

  it("should parse date with slash separator", () => {
    const result = parseCalendarDate("12/Jan/2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 1, day: 12 },
      error: false,
    });
  });

  it("should parse date with hyphen separator", () => {
    const result = parseCalendarDate("12-Jan-2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 1, day: 12 },
      error: false,
    });
  });

  it("should parse numeric month with space separator", () => {
    const result = parseCalendarDate("12 01 2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 1, day: 12 },
      error: false,
    });
  });

  it("should parse numeric month with slash separator", () => {
    const result = parseCalendarDate("12/01/2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 1, day: 12 },
      error: false,
    });
  });

  it("should parse numeric month with hyphen separator", () => {
    const result = parseCalendarDate("12-01-2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 1, day: 12 },
      error: false,
    });
  });

  it("should parse numeric date with no 0 prefix", () => {
    const result = parseCalendarDate("1/2/2023", "en-GB");
    expect(result).toMatchObject({
      date: { year: 2023, month: 2, day: 1 },
      error: false,
    });
  });

  it("should return error for invalid date format", () => {
    const result = parseCalendarDate("invalid-date", "en-GB");
    expect(result).toEqual({ date: null, error: "not a valid date format" });
  });

  it("should return error for invalid month name", () => {
    const result = parseCalendarDate("12 Foo 2023", "en-GB");
    expect(result).toEqual({
      date: null,
      error: "not a valid month name for locale",
    });
  });

  it("should return error for invalid month value", () => {
    const result = parseCalendarDate("12 13 2023", "en-GB");
    expect(result).toEqual({ date: null, error: "not a valid month value" });
  });

  it("should return error for invalid year", () => {
    const result = parseCalendarDate("12 Jan abcd", "en-GB");
    expect(result).toEqual({ date: null, error: "not a valid date format" });
  });

  it("should return error for invalid day", () => {
    const result = parseCalendarDate("ab Jan 2023", "en-GB");
    expect(result).toEqual({ date: null, error: "not a valid date format" });
  });

  it("should return error for incomplete date", () => {
    const invalidDateTestCases = [
      "2",
      "02",
      "02 J",
      "02 Ja",
      "02 Jan",
      "02 Jan 2",
      "02 Jan 21",
      "02 Jan 212",
      "02 Jan 21234",
    ];
    invalidDateTestCases.forEach((inputDate) => {
      const result = parseCalendarDate(inputDate, "en-GB");
      expect(result).toEqual({ date: null, error: "not a valid date format" });
    });
  });
});
