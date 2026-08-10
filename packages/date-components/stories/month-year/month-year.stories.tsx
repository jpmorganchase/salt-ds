import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
import type { DateFrameworkType, ParserResult } from "@salt-ds/date-adapters";
import {
  type DateInputRangeDetails,
  type DateInputSingleDetails,
  DateParserField,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerRangeInput,
  type DatePickerRangeProps,
  DatePickerSingleInput,
  type DatePickerSingleProps,
  DatePickerTrigger,
  type DateRangeSelection,
  MonthYearRangePanel,
  MonthYearSinglePanel,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/date-components";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type SyntheticEvent, useCallback, useState } from "react";
import { withDateMock } from "~storybook-decorators/withDateMock";

export default {
  title: "Date Components/Month Year Picker",
  component: DatePicker,
  decorators: [withDateMock],
} as Meta;

const MONTH_YEAR_FORMATS = [
  "MMMM YYYY",
  "MMM YYYY",
  "MM/YYYY",
  "MM YYYY",
  "M/YYYY",
  "M YYYY",
];

/**
 * MonthYearPanel – date picker that only lets the user pick a month
 * and a year.
 *
 * - The input displays and parses values as "MMMM YYYY" (e.g. "January 2026").
 *   The custom parser also accepts "MMM YYYY", "MM/YYYY" and "MM YYYY" so that
 *   the user can type a month + year in the input and have it flow through the
 *   normal DatePicker APIs.
 * - The overlay shows a custom panel with a 12-month grid, plus previous/next
 *   year navigation. Clicking a month calls `helpers.select` with the first day
 *   of that month.
 * - Accessibility: the grid uses roving tabindex (only one month is in the tab
 *   order at a time), arrow keys / Home / End move between months, PageUp and
 *   PageDown change year (Shift+PageUp/Down jumps by 10 years). When the
 *   overlay opens the currently-selected month button receives focus via
 *   `useDatePickerOverlay().state.initialFocusRef`, and Escape / apply /
 *   outside-press returns focus to the triggering input (handled by
 *   `DatePickerOverlayProvider`). Selections are announced through the Salt
 *   aria-live announcer.
 */
export const MonthYearPanel: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText = "Select a month and year (e.g. January 2026)";
  const errorHelperText =
    "Please enter a valid month and year (e.g. January 2026)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected month: ${dateAdapter.isValid(date) ? dateAdapter.format(date, format) : date}`,
      );
      if (errors?.length) {
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      }
      if (errors?.length && details?.value?.length) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const parseMonthYear = useCallback(
    (inputDate: string, inputFormat: string): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          return {
            ...result,
            date: dateAdapter.startOf(result.date, "month"),
            value,
          };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const labelId = useId();

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYear}
            placeholder="Month Year"
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearSinglePanel />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
MonthYearPanel.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

/**
 * RangeMonthYearPanel – range date picker restricted to month/year
 * selection. The start input parses to the first of the month and the end
 * input parses to the last day of the month, so the selected range covers the
 * full inclusive months.
 *
 * Accessibility mirrors the single-selection variant: roving tabindex within
 * each grid, arrow keys navigate between months, and ArrowRight on the last
 * month of the start grid crosses into the first month of the end grid (and
 * ArrowLeft crosses back). PageUp/PageDown change year on the active grid.
 * The overlay's `initialFocusRef` is wired to the currently-active month
 * button so it receives focus on open, and focus returns to the input on
 * Escape / apply / outside-press.
 */
export const RangeMonthYearPanel: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month range (e.g. January 2026 - March 2026)";
  const errorHelperText =
    "Please enter valid months and years (e.g. January 2026)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection | null,
      details: DateInputRangeDetails | undefined,
    ) => {
      const { startDate, endDate } = date ?? {};
      const {
        startDate: {
          value: startDateOriginalValue = undefined,
          errors: startDateErrors = undefined,
        } = {},
        endDate: {
          value: endDateOriginalValue = undefined,
          errors: endDateErrors = undefined,
        } = {},
      } = details || {};
      console.log(
        `StartMonth: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, format) : startDate}, EndMonth: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, format) : endDate}`,
      );
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start month, ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end month, ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const parseMonthYearRange = useCallback(
    (
      inputDate: string,
      field: DateParserField,
      inputFormat: string,
    ): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          const normalised =
            field === DateParserField.END
              ? dateAdapter.endOf(result.date, "month")
              : dateAdapter.startOf(result.date, "month");
          return { ...result, date: normalised, value };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const labelId = useId();

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYearRange}
            startInputProps={{ placeholder: "Month Year" }}
            endInputProps={{ placeholder: "Month Year" }}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearRangePanel />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
RangeMonthYearPanel.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

/**
 * MonthYearPanelMinMaxDate – restricts month selection to a
 * `[minDate, maxDate]` window supplied by the parent `DatePicker`. Months whose
 * full span lies outside the window are rendered `aria-disabled` and skipped
 * by keyboard navigation. `defaultVisibleYear` opens the panel on the year
 * containing the minimum date.
 */
export const MonthYearPanelMinMaxDate: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month between April 2026 and October 2028";
  const errorHelperText =
    "Please enter a month within the allowed range (e.g. June 2026)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { errors } = details || {};
      if (errors?.length && details?.value?.length) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange],
  );

  const parseMonthYear = useCallback(
    (inputDate: string, inputFormat: string): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          return {
            ...result,
            date: dateAdapter.startOf(result.date, "month"),
            value,
          };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const minDate =
    dateAdapter.parse("01/04/2026", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("31/10/2028", "DD/MM/YYYY").date ?? undefined;

  const labelId = useId();

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month</FormLabel>
      <DatePicker
        selectionVariant="single"
        minDate={minDate}
        maxDate={maxDate}
        {...args}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYear}
            placeholder="Month Year"
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearSinglePanel defaultVisibleYear={2026} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
MonthYearPanelMinMaxDate.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

/**
 * RangeMonthYearPanelMinMaxDate – enforces a `[minDate, maxDate]` window on
 * both start and end grids. Each grid opens on the year containing the min/max
 * boundary respectively via `defaultStartVisibleYear` / `defaultEndVisibleYear`.
 */
export const RangeMonthYearPanelMinMaxDate: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month range between April 2026 and October 2028";
  const errorHelperText =
    "Please enter months within the allowed range (e.g. June 2026)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection | null,
      details: DateInputRangeDetails | undefined,
    ) => {
      const {
        startDate: {
          value: startDateOriginalValue = undefined,
          errors: startDateErrors = undefined,
        } = {},
        endDate: {
          value: endDateOriginalValue = undefined,
          errors: endDateErrors = undefined,
        } = {},
      } = details || {};
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start month, ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end month, ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange],
  );

  const parseMonthYearRange = useCallback(
    (
      inputDate: string,
      field: DateParserField,
      inputFormat: string,
    ): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          const normalised =
            field === DateParserField.END
              ? dateAdapter.endOf(result.date, "month")
              : dateAdapter.startOf(result.date, "month");
          return { ...result, date: normalised, value };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const minDate =
    dateAdapter.parse("01/04/2026", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("31/10/2028", "DD/MM/YYYY").date ?? undefined;

  const labelId = useId();

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={maxDate}
        {...args}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYearRange}
            startInputProps={{ placeholder: "Month Year" }}
            endInputProps={{ placeholder: "Month Year" }}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearRangePanel
            defaultStartVisibleYear={2026}
            defaultEndVisibleYear={2028}
          />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
RangeMonthYearPanelMinMaxDate.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

/**
 * MonthYearPanelUnselectableMonths – uses `isMonthUnselectable` to
 * disable arbitrary months. Here the Q3 months (July, August, September) are
 * rejected with a rejection message that surfaces on the button's tooltip and
 * to assistive technology.
 */
export const MonthYearPanelUnselectableMonths: StoryFn<
  DatePickerSingleProps
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText = "Select a month, excluding July, August, September";
  const errorHelperText =
    "Please enter a selectable month (not July, August or September)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { errors } = details || {};
      if (errors?.length && details?.value?.length) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange],
  );

  const parseMonthYear = useCallback(
    (inputDate: string, inputFormat: string): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          return {
            ...result,
            date: dateAdapter.startOf(result.date, "month"),
            value,
          };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const isMonthUnselectable = useCallback(
    (month: DateFrameworkType) => {
      // `getMonth` is 0-based across all supported adapters.
      const monthIndex = dateAdapter.getMonth(month);
      const isQ3 = monthIndex === 6 || monthIndex === 7 || monthIndex === 8;
      return isQ3 ? "Q3 months are unavailable" : false;
    },
    [dateAdapter],
  );

  const labelId = useId();

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYear}
            placeholder="Month Year"
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearSinglePanel isMonthUnselectable={isMonthUnselectable} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
MonthYearPanelUnselectableMonths.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

/**
 * RangeMonthYearPanelUnselectableMonths – applies `isMonthUnselectable` to
 * both start and end grids. Q3 months (July, August, September) are rejected
 * on both sides.
 */
export const RangeMonthYearPanelUnselectableMonths: StoryFn<
  DatePickerRangeProps
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month range, excluding July, August, September";
  const errorHelperText =
    "Please enter selectable months (not July, August or September)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection | null,
      details: DateInputRangeDetails | undefined,
    ) => {
      const {
        startDate: {
          value: startDateOriginalValue = undefined,
          errors: startDateErrors = undefined,
        } = {},
        endDate: {
          value: endDateOriginalValue = undefined,
          errors: endDateErrors = undefined,
        } = {},
      } = details || {};
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start month, ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end month, ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange],
  );

  const parseMonthYearRange = useCallback(
    (
      inputDate: string,
      field: DateParserField,
      inputFormat: string,
    ): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          const normalised =
            field === DateParserField.END
              ? dateAdapter.endOf(result.date, "month")
              : dateAdapter.startOf(result.date, "month");
          return { ...result, date: normalised, value };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const isMonthUnselectable = useCallback(
    (month: DateFrameworkType) => {
      const monthIndex = dateAdapter.getMonth(month);
      const isQ3 = monthIndex === 6 || monthIndex === 7 || monthIndex === 8;
      return isQ3 ? "Q3 months are unavailable" : false;
    },
    [dateAdapter],
  );

  const labelId = useId();

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYearRange}
            startInputProps={{ placeholder: "Month Year" }}
            endInputProps={{ placeholder: "Month Year" }}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearRangePanel isMonthUnselectable={isMonthUnselectable} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
RangeMonthYearPanelUnselectableMonths.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};
