import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
  StackLayout,
  Text,
  ToggleButton,
} from "@salt-ds/core";
import {
  DateDetailError,
  type DateFrameworkType,
  type ParserResult,
  type TimeFields,
} from "@salt-ds/date-adapters";
import {
  type DateInputRangeDetails,
  type DateInputSingleDetails,
  DateParserField,
  DatePicker,
  DatePickerActions,
  type DatePickerOpenChangeReason,
  DatePickerOverlay,
  DatePickerRangeInput,
  type DatePickerRangeInputProps,
  DatePickerRangePanel,
  type DatePickerRangeProps,
  DatePickerSingleInput,
  type DatePickerSingleInputProps,
  DatePickerSinglePanel,
  type DatePickerSinglePanelProps,
  type DatePickerSingleProps,
  DatePickerTrigger,
  type DateRangeSelection,
  type SingleDatePickerState,
  type SingleDateSelection,
  useDatePickerContext,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import type { SyntheticEvent } from "react";
import { useCallback, useRef, useState } from "react";
// CustomDatePickerPanel is a sample component, representing a composition you could create yourselves, not intended for importing into your own projects
// refer to https://github.com/jpmorganchase/salt-ds/blob/main/packages/lab/src/date-picker/useDatePicker.ts to create your own
import { CustomDatePickerPanel } from "./CustomDatePickerPanel";
// As required by locale specific examples
import "moment/dist/locale/zh-cn";
import "moment/dist/locale/es";
import "dayjs/locale/es";
import "dayjs/locale/zh-cn";
import { es as dateFnsEs } from "date-fns/locale";
import { zhCN as dateFnsZhCn } from "date-fns/locale";
import { enUS as dateFnsEnUs } from "date-fns/locale";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

const DatePickerSingleTemplate: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <DatePicker
      {...args}
      selectionVariant="single"
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

const DatePickerRangeTemplate: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <DatePicker
      selectionVariant="range"
      {...args}
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerTrigger>
        <DatePickerRangeInput />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const Single = DatePickerSingleTemplate.bind({});
Single.args = {};

export const Range = DatePickerRangeTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};

export const SingleReadOnly = DatePickerSingleTemplate.bind({});
SingleReadOnly.args = {
  readOnly: true,
};

export const RangeReadOnly = DatePickerRangeTemplate.bind({});
RangeReadOnly.args = {
  readOnly: true,
  selectionVariant: "range",
};

export const SingleControlled: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(defaultSelectedDate ?? null);
  const { dateAdapter } = useLocalization();
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      setSelectedDate(date ?? null);
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
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <StackLayout style={{ width: "400px" }}>
      <DatePicker
        selectionVariant={"single"}
        {...args}
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
      <FlexLayout>
        <Button aria-label={"reset"} onClick={() => setSelectedDate(null)}>
          reset
        </Button>
        <Button
          aria-label={"today"}
          onClick={() => setSelectedDate(dateAdapter.today())}
        >
          today
        </Button>
        <Button
          onClick={() =>
            setSelectedDate(dateAdapter.add(dateAdapter.today(), { days: 1 }))
          }
        >
          set tomorrow
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const RangeControlled: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] =
    useState<DateRangeSelection<DateFrameworkType> | null>(
      defaultSelectedDate ?? null,
    );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      setSelectedDate({
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      });
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <StackLayout style={{ width: "400px" }}>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel />
        </DatePickerOverlay>
      </DatePicker>
      <Text>Start Date</Text>
      <StackLayout
        direction={"row"}
        style={{
          width: "100%",
        }}
        gap={1}
      >
        <FlexItem>
          <Button
            aria-label={"reset start date"}
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                startDate: null,
              })
            }
          >
            reset
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            aria-label={"set start date to today"}
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                startDate: dateAdapter.today(),
              })
            }
          >
            today
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            aria-label={"set start date to tomorrow"}
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                startDate: dateAdapter.add(dateAdapter.today(), { days: 1 }),
              })
            }
          >
            tomorrow
          </Button>
        </FlexItem>
      </StackLayout>
      <Text>End Date</Text>
      <StackLayout
        direction={"row"}
        style={{
          width: "100%",
        }}
        gap={1}
      >
        <FlexItem>
          <Button
            aria-label={"reset end date"}
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                endDate: null,
              })
            }
          >
            reset
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                endDate: dateAdapter.today(),
              })
            }
          >
            today
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            aria-label={"set end date to today"}
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                endDate: dateAdapter.add(dateAdapter.today(), { days: 1 }),
              })
            }
          >
            tomorrow
          </Button>
        </FlexItem>
      </StackLayout>
      <Text>Both</Text>
      <StackLayout
        direction={"row"}
        style={{
          width: "100%",
        }}
        gap={1}
      >
        <FlexItem>
          <Button
            aria-label={"set end date to tomorrow"}
            onClick={() =>
              setSelectedDate({
                startDate: null,
                endDate: null,
              })
            }
          >
            reset
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            aria-label={"reset both"}
            onClick={() =>
              setSelectedDate({
                startDate: dateAdapter.today(),
                endDate: dateAdapter.add(dateAdapter.today(), { days: 1 }),
              })
            }
          >
            set
          </Button>
        </FlexItem>
      </StackLayout>
    </StackLayout>
  );
};
// Passing a date object to a Story, containing an invalid date, will cause Storybook to throw from toISOString()
RangeControlled.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

export const SingleWithMinMaxDate: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Select date between 15 Jan 2030 and 15 Jan 2031";
  const errorHelperText = "Please enter an in-range date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  const minDate =
    dateAdapter.parse("15/01/2030", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("15/01/2031", "DD/MM/YYYY").date ?? undefined;
  const defaultVisibleMonth =
    dateAdapter.parse("01/01/2030", "DD/MM/YYYY").date ?? undefined;
  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        minDate={minDate}
        maxDate={maxDate}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel
            defaultVisibleMonth={defaultVisibleMonth}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithMinMaxDate: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Select date between 15 Jan 2030 and 15 Jan 2031";
  const errorHelperText = "Please enter an in-range date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args.onSelectionChange, dateAdapter],
  );

  const minDate =
    dateAdapter.parse("15/01/2030", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("15/01/2031", "DD/MM/YYYY").date ?? undefined;
  const defaultStartVisibleMonth =
    dateAdapter.parse("01/01/2030", "DD/MM/YYYY").date ?? undefined;
  const defaultEndVisibleMonth =
    dateAdapter.parse("01/01/2031", "DD/MM/YYYY").date ?? undefined;
  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={maxDate}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel
            defaultStartVisibleMonth={defaultStartVisibleMonth}
            defaultEndVisibleMonth={defaultEndVisibleMonth}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithInitialError: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        defaultSelectedDate={dateAdapter.parse("bad date", "DD MMM YYYY").date}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput defaultValue="bad date" />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithInitialError: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const defaultStartVisibleMonth =
    dateAdapter.parse("01/06/2024", "DD/MM/YYYY").date ?? dateAdapter.today();
  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={{
          startDate: dateAdapter.parse("09/06/2024", "DD/MM/YYYY").date,
          endDate: null,
        }}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            defaultValue={{ startDate: "09 Jun 2024", endDate: "bad date" }}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
            defaultStartVisibleMonth={defaultStartVisibleMonth}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithFormField: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithFormField: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithCustomPanel: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="single"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithCustomPanel: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="range"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

const TodayButton = () => {
  const {
    helpers: { select },
  } = useDatePickerContext({
    selectionVariant: "single",
  }) as SingleDatePickerState<DateFrameworkType>;
  const { dateAdapter } = useLocalization();
  return (
    <div style={{ display: "flex" }}>
      <Button
        style={{ margin: "var(--salt-spacing-50)", flexGrow: 1 }}
        sentiment="accented"
        appearance="bordered"
        onClick={(event: SyntheticEvent) => select(event, dateAdapter.today())}
      >
        Select Today
      </Button>
    </div>
  );
};

export const SingleWithTodayButton: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <Divider />
            </FlexItem>
            <FlexItem>
              <DatePickerSinglePanel helperText={helperText} />
            </FlexItem>
            <FlexItem>
              <Divider />
            </FlexItem>
            <FlexItem>
              <TodayButton />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithConfirmation: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState<string>(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(defaultSelectedDate ?? null);
  const previousSelectedDate = useRef<typeof selectedDate>(selectedDate);

  const savedState = useRef<{
    validationStatus: typeof validationStatus;
    helperText: typeof helperText;
  }>({
    validationStatus: undefined,
    helperText: defaultHelperText,
  });
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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
      setSelectedDate(date ?? null);
      if (date) {
        applyButtonRef?.current?.focus();
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const handleOpenChange = useCallback(
    (opening: boolean) => {
      if (opening) {
        savedState.current = {
          helperText,
          validationStatus,
        };
      }
      setOpen(opening);
    },
    [helperText, validationStatus],
  );

  const handleCancel = useCallback(() => {
    setValidationStatus(savedState.current?.validationStatus);
    setHelperText(savedState.current?.helperText);
    setSelectedDate(previousSelectedDate.current);
    args?.onCancel?.();
  }, [args?.onCancel]);

  const handleApply = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
    ) => {
      console.log(
        `Applied date: ${date ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      setSelectedDate(date);
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
      previousSelectedDate.current = date;
      args?.onApply?.(event, date);
    },
    [args?.onApply, dateAdapter],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onApply={handleApply}
        onCancel={handleCancel}
        onSelectionChange={handleSelectionChange}
        onOpenChange={handleOpenChange}
        selectedDate={selectedDate}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions
                selectionVariant="single"
                applyButtonRef={applyButtonRef}
                ApplyButtonProps={{
                  disabled: !!validationStatus,
                }}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithConfirmation: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Select range (DD MMM YYYY - DD MMM YYYY) e.g. 09 Jun 2024";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [helperText, setHelperText] = useState<string>(defaultHelperText);
  const [open] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<
    "error" | undefined
  >();
  const savedValidationState = useRef<typeof validationStatus>();
  const [selectedDate, setSelectedDate] =
    useState<DateRangeSelection<DateFrameworkType> | null>(
      defaultSelectedDate ?? null,
    );
  const previousSelectedDate = useRef<typeof selectedDate>(selectedDate);

  const savedState = useRef<{
    validationStatus: typeof validationStatus;
    helperText: typeof helperText;
  }>({
    validationStatus: undefined,
    helperText: defaultHelperText,
  });
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      setSelectedDate({
        startDate:
          startDateOriginalValue?.trim().length === 0 ? null : startDate,
        endDate: endDateOriginalValue?.trim().length === 0 ? null : endDate,
      });
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const handleOpenChange = useCallback(
    (opening: boolean) => {
      if (opening) {
        savedValidationState.current = validationStatus;
      }
    },
    [validationStatus],
  );

  const handleCancel = useCallback(() => {
    setHelperText(savedState.current?.helperText);
    setValidationStatus(savedValidationState.current);
    setSelectedDate(previousSelectedDate.current);
    args?.onCancel?.();
  }, [args?.onCancel]);

  const handleApply = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
    ) => {
      const { startDate, endDate } = date ?? {};
      console.log(
        `Applied StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      setSelectedDate(date);
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
      previousSelectedDate.current = date;
      args?.onApply?.(event, date);
    },
    [args?.onApply, dateAdapter],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onApply={handleApply}
        onCancel={handleCancel}
        onSelectionChange={handleSelectionChange}
        onOpenChange={handleOpenChange}
        selectedDate={selectedDate}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerRangePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions
                selectionVariant="range"
                applyButtonRef={applyButtonRef}
                ApplyButtonProps={{
                  disabled: !!validationStatus,
                }}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};
// Passing a date object to a Story, containing an invalid date, will cause Storybook to throw from toISOString()
RangeWithConfirmation.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

export const SingleWithCustomParser: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(defaultSelectedDate ?? null);
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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
      setSelectedDate(date ?? null);
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const customParser = useCallback(
    (
      inputDate: string,
      format: string,
      locale: any,
    ): ParserResult<DateFrameworkType> => {
      if (!inputDate?.length) {
        const parsedDate = dateAdapter.parse("invalid date", "DD/MMM/YYYY");
        return {
          date: parsedDate.date,
          value: inputDate,
          errors: [
            { type: DateDetailError.UNSET, message: "no date provided" },
          ],
        };
      }
      const parsedDate = inputDate;
      const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
      if (offsetMatch) {
        const offsetDays = Number.parseInt(offsetMatch[1], 10);
        let offsetDate = dateAdapter.isValid(selectedDate)
          ? selectedDate
          : dateAdapter.today();
        offsetDate = dateAdapter.add(offsetDate, { days: offsetDays });
        return {
          date: offsetDate,
          value: inputDate,
        };
      }
      return dateAdapter.parse(parsedDate || "", format, locale);
    },
    [dateAdapter, selectedDate],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput parse={customParser} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};
SingleWithCustomParser.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

export const RangeWithCustomParser: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] =
    useState<DateRangeSelection<DateFrameworkType> | null>(
      defaultSelectedDate ?? null,
    );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      setSelectedDate({
        startDate:
          startDateOriginalValue?.trim().length === 0 ? null : startDate,
        endDate: endDateOriginalValue?.trim().length === 0 ? null : endDate,
      });
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  const customParser = useCallback(
    (
      inputDate: string,
      field: DateParserField,
      format: string,
      locale: any,
    ): ParserResult<DateFrameworkType> => {
      if (!inputDate?.length) {
        const parsedDate = dateAdapter.parse("invalid date", "DD/MMM/YYYY");
        return {
          date: parsedDate.date,
          value: inputDate,
          errors: [
            { type: DateDetailError.UNSET, message: "no date provided" },
          ],
        };
      }
      const parsedDate = inputDate;
      const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
      if (offsetMatch) {
        const offsetDays = Number.parseInt(offsetMatch[1], 10);
        let offsetDate;
        if (selectedDate?.startDate && field === DateParserField.START) {
          offsetDate = selectedDate.startDate;
        } else if (selectedDate?.endDate && field === DateParserField.END) {
          offsetDate = selectedDate.endDate;
        } else {
          offsetDate = dateAdapter.today();
        }
        offsetDate = dateAdapter.add(offsetDate, { days: offsetDays });
        return {
          date: offsetDate,
          value: inputDate,
        };
      }
      return dateAdapter.parse(parsedDate || "", format, locale);
    },
    [dateAdapter, selectedDate],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput parse={customParser} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};
RangeWithCustomParser.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

export const SingleWithCustomValidation: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "A weekday,in the format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const isWeekend = (date: DateFrameworkType): boolean => {
    const dow = dateAdapter.getDayOfWeek(date);
    return dow === 0 || dow === 6; // ISO dates, 0 is Sunday, 6 is Saturday
  };
  const validateIsAWeekday = useCallback(
    (
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ): DateInputSingleDetails => {
      const updatedDetails = { ...details };
      if (date && isWeekend(date)) {
        updatedDetails.errors = updatedDetails?.errors ?? [];
        updatedDetails.errors?.push({
          type: DateDetailError.INVALID_DAY,
          message: "date must be a weekday",
        });
      }
      return updatedDetails;
    },
    [],
  );

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  const customiseNonDateError = useCallback(
    (details: DateInputSingleDetails): DateInputSingleDetails => {
      if (!details.errors) {
        return details;
      }
      details.errors = details.errors.map((error) => {
        if (error.type === DateDetailError.NOT_A_DATE) {
          error.message = "valid dates are any weekday";
        }
        return error;
      });
      return details;
    },
    [],
  );

  const isDayUnselectable = useCallback(
    (date: DateFrameworkType): string | false => {
      return isWeekend(date) ? "weekends are un-selectable" : false;
    },
    [isWeekend],
  );

  const validateAndCustomizeError = useCallback(
    (
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ): DateInputSingleDetails => {
      const validateWeekdayResult = validateIsAWeekday(date, details);
      return customiseNonDateError(validateWeekdayResult);
    },
    [customiseNonDateError, validateIsAWeekday],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput validate={validateAndCustomizeError} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarProps={{ isDayUnselectable }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithLocaleEsES: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  // Include any locales, required by your DateAdapter of choice.
  // Wrap in your own LocalizationProvider to specify the locale or modify the current context
  // <LocalizationProvider DateAdapter={DateAdapter} locale="es-ES"></LocalizationProvider>
  const { dateAdapter } = useLocalization();
  const isDateFns = dateAdapter.lib === "date-fns";
  const isDayjs = dateAdapter.lib === "dayjs";
  if (isDateFns) {
    dateAdapter.locale = dateFnsEs;
  } else if (isDayjs) {
    dateAdapter.locale = "es";
  } else {
    dateAdapter.locale = "es-ES";
  }
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithLocaleEsES: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  // Include any locales, required by your DateAdapter of choice.
  // Wrap in your own LocalizationProvider to specify the locale or modify the current context
  // <LocalizationProvider DateAdapter={DateAdapter} locale="es-ES"></LocalizationProvider>
  const { dateAdapter } = useLocalization();
  const isDateFns = dateAdapter.lib === "date-fns";
  const isDayjs = dateAdapter.lib === "dayjs";
  if (isDateFns) {
    dateAdapter.locale = dateFnsEs;
  } else if (isDayjs) {
    dateAdapter.locale = "es";
  } else {
    dateAdapter.locale = "es-ES";
  }
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter, defaultHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"range"}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithLocaleZhCN: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  // Include any locales, required by your DateAdapter of choice.
  // Wrap in your own LocalizationProvider to specify the locale or modify the current context
  // <LocalizationProvider DateAdapter={DateAdapter} locale="zh-CN"></LocalizationProvider>
  const { dateAdapter } = useLocalization();
  const isDateFns = dateAdapter.lib === "date-fns";
  const isDayjs = dateAdapter.lib === "dayjs";
  if (isDateFns) {
    dateAdapter.locale = dateFnsZhCn;
  } else if (isDayjs) {
    dateAdapter.locale = "zh-cn";
  } else {
    dateAdapter.locale = "zh-CN";
  }
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY", isDateFns ? dateFnsEnUs : "en") : date}`,
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
    [args?.onSelectionChange, dateAdapter, defaultHelperText],
  );

  function renderDayContents(day: DateFrameworkType) {
    return <>{dateAdapter.format(day, "D")}</>;
  }

  const CalendarDataGridProps: DatePickerSinglePanelProps<DateFrameworkType>["CalendarDataGridProps"] =
    {
      getCalendarMonthProps: () => ({ renderDayContents }),
    };

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput
            format={"DD MMM YYYY"}
            locale={isDateFns ? dateFnsEnUs : "en"}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarDataGridProps={CalendarDataGridProps}
            CalendarNavigationProps={{ formatMonth: "MMMM" }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleBordered: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput bordered />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarNavigationProps={{
              MonthDropdownProps: { bordered: true },
              YearDropdownProps: { bordered: true },
            }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeBordered: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpenChange={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput bordered />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
            StartCalendarNavigationProps={{
              MonthDropdownProps: { bordered: true },
              YearDropdownProps: { bordered: true },
            }}
            EndCalendarNavigationProps={{
              MonthDropdownProps: { bordered: true },
              YearDropdownProps: { bordered: true },
            }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleCustomFormat: StoryFn<
  DatePickerSingleProps<DateFrameworkType> &
    Pick<DatePickerSingleInputProps<DateFrameworkType>, "format">
> = ({ selectionVariant, format = "YYYY-MM-DD", ...args }) => {
  const { dateAdapter } = useLocalization();
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
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
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <DatePicker
      {...args}
      selectionVariant="single"
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput format={format} />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const RangeCustomFormat: StoryFn<
  DatePickerRangeProps<DateFrameworkType> &
    Pick<DatePickerRangeInputProps<DateFrameworkType>, "format">
> = ({ selectionVariant, format = "YYYY-MM-DD", ...args }) => {
  const { dateAdapter } = useLocalization();
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
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
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      args?.onSelectionChange?.(event, date, details);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <DatePicker
      selectionVariant="range"
      {...args}
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerTrigger>
        <DatePickerRangeInput format={format} />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

interface DatePickerTimeInputProps {
  time: { startTime: TimeFields | null; endTime: TimeFields | null };
  onTimeChange: (time: {
    startTime: TimeFields | null;
    endTime: TimeFields | null;
  }) => void;
}

const DatePickerTimeInput: React.FC<DatePickerTimeInputProps> = ({
  time,
  onTimeChange,
}) => {
  function parseTime(timeValue: string): TimeFields | null {
    const timePattern = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
    const match = timeValue.match(timePattern);
    if (!match) {
      return null;
    }

    const hour = Number.parseInt(match[1], 10);
    const minute = Number.parseInt(match[2], 10);
    const second = match[3] ? Number.parseInt(match[3], 10) : 0;
    const millisecond = match[4]
      ? Number.parseInt(match[4].padEnd(3, "0"), 10)
      : 0;
    return { hour, minute, second, millisecond };
  }

  const handleStartTimeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const value = event.target.value;
    const parsedTime = parseTime(value);
    onTimeChange({ startTime: parsedTime, endTime: time.endTime });
  };

  const handleEndTimeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const value = event.target.value;
    const parsedTime = parseTime(value);
    onTimeChange({ startTime: time.startTime, endTime: parsedTime });
  };

  function formatTimeValue(hour: number, minute: number): string {
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute}`;
  }

  return (
    <>
      <DatePickerRangeInput bordered />
      <input
        aria-label="start date time"
        type="time"
        value={
          time.startTime
            ? formatTimeValue(time.startTime.hour, time.startTime.minute)
            : ""
        }
        onChange={handleStartTimeChange}
      />
      <input
        aria-label="end date time"
        type="time"
        value={
          time.endTime
            ? formatTimeValue(time.endTime.hour, time.endTime.minute)
            : ""
        }
        onChange={handleEndTimeChange}
      />
    </>
  );
};

export const WithExperimentalTime: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({
  defaultSelectedDate,
  selectionVariant,
  onApply: onApplyProp,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const [selectedTime, setSelectedTime] = useState<{
    startTime: TimeFields | null;
    endTime: TimeFields | null;
  }>({ startTime: null, endTime: null });
  const [selectedDate, setSelectedDate] =
    useState<DateRangeSelection<DateFrameworkType> | null>(
      defaultSelectedDate ?? null,
    );
  const previousSelectedDate = useRef<typeof selectedDate>(selectedDate);

  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
      details: DateInputRangeDetails | undefined,
    ) => {
      const updatedDate = date ? addTimeToDate(selectedTime, date) : date;
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
        `StartDate: ${updatedDate && dateAdapter.isValid(updatedDate?.startDate) ? dateAdapter.format(updatedDate.startDate, "DD MMM YYYY HH:mm:ss") : updatedDate?.startDate}, EndDate: ${updatedDate && dateAdapter.isValid(updatedDate?.endDate) ? dateAdapter.format(updatedDate.endDate, "DD MMM YYYY HH:mm:ss") : updatedDate?.endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      setSelectedDate({
        startDate:
          startDateOriginalValue?.trim().length === 0
            ? null
            : updatedDate?.startDate,
        endDate:
          endDateOriginalValue?.trim().length === 0
            ? null
            : updatedDate?.endDate,
      });
      args?.onSelectionChange?.(event, updatedDate, details);
    },
    [
      args?.onSelectionChange,
      dateAdapter,
      selectedTime?.startTime,
      selectedTime?.endTime,
    ],
  );

  const handleTimeChange = useCallback(
    (time: typeof selectedTime) => {
      setSelectedTime(time);
      if (selectedDate) {
        const date = addTimeToDate(time, selectedDate);
        setSelectedDate(date);
        console.log(
          `StartDate: ${dateAdapter.isValid(date?.startDate) ? dateAdapter.format(date.startDate, "DD MMM YYYY HH:mm:ss") : date?.startDate}, EndDate: ${dateAdapter.isValid(date?.endDate) ? dateAdapter.format(date.endDate, "DD MMM YYYY HH:mm:ss") : date?.endDate}`,
        );
      }
    },
    [selectedDate],
  );

  function addTimeToDate(
    time: typeof selectedTime,
    date: DateRangeSelection<DateFrameworkType>,
  ) {
    const { startTime, endTime } = time;
    if (dateAdapter.isValid(date?.startDate) && startTime) {
      date.startDate = dateAdapter.set(date.startDate, {
        hour: startTime.hour,
        minute: startTime.minute,
        second: startTime.second,
        millisecond: startTime.millisecond,
      });
    }
    if (dateAdapter.isValid(date?.endDate) && endTime) {
      date.endDate = dateAdapter.set(date.endDate, {
        hour: endTime.hour,
        minute: endTime.minute,
        second: endTime.second,
        millisecond: endTime.millisecond,
      });
    }
    return date;
  }

  const handleApply = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
    ) => {
      const { startDate, endDate } = date ?? {};
      console.log(
        `Applied StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY HH:mm:ss") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY  HH:mm:ss") : endDate}`,
      );
      previousSelectedDate.current = selectedDate;
      onApplyProp?.(event, date);
    },
    [onApplyProp],
  );

  const handleCancel = useCallback(() => {
    setSelectedDate(previousSelectedDate.current);
    args?.onCancel?.();
  }, [args?.onCancel]);

  return (
    <DatePicker
      selectionVariant="range"
      {...args}
      selectedDate={selectedDate}
      onApply={handleApply}
      onCancel={handleCancel}
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerTrigger>
        <DatePickerTimeInput
          time={selectedTime}
          onTimeChange={handleTimeChange}
        />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <FlexLayout gap={0} direction="column">
          <FlexItem>
            <DatePickerRangePanel
              StartCalendarNavigationProps={{
                MonthDropdownProps: { bordered: true },
                YearDropdownProps: { bordered: true },
              }}
              EndCalendarNavigationProps={{
                MonthDropdownProps: { bordered: true },
                YearDropdownProps: { bordered: true },
              }}
            />
            <Divider variant="tertiary" />
          </FlexItem>
          <FlexItem>
            <DatePickerActions selectionVariant="range" />
          </FlexItem>
        </FlexLayout>
      </DatePickerOverlay>
    </DatePicker>
  );
};
// Passing a date object to a Story, containing an invalid date, will cause Storybook to throw from toISOString()
WithExperimentalTime.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

export const UncontrolledSingleOpen: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const [openOnClick, setOpenOnClick] = useState(false);
  return (
    <StackLayout style={{ width: "400px" }}>
      <FlexLayout>
        <ToggleButton
          aria-label={"open on click"}
          value={openOnClick ? "false" : "true"}
          onChange={(event) =>
            setOpenOnClick(event.currentTarget.value === "true")
          }
        >
          Open On Click
        </ToggleButton>
      </FlexLayout>
      <DatePicker
        selectionVariant={"single"}
        openOnClick={openOnClick}
        {...args}
        defaultSelectedDate={defaultSelectedDate}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
    </StackLayout>
  );
};

export const UncontrolledRangeOpen: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const [openOnClick, setOpenOnClick] = useState(false);
  return (
    <StackLayout style={{ width: "400px" }}>
      <FlexLayout>
        <ToggleButton
          aria-label={"open on click"}
          value={openOnClick ? "false" : "true"}
          onChange={(event) =>
            setOpenOnClick(event.currentTarget.value === "true")
          }
        >
          Open On Click
        </ToggleButton>
      </FlexLayout>
      <DatePicker
        selectionVariant={"range"}
        openOnClick={openOnClick}
        {...args}
        defaultSelectedDate={defaultSelectedDate}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel />
        </DatePickerOverlay>
      </DatePicker>
    </StackLayout>
  );
};

export const ControlledOpen: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(defaultSelectedDate ?? null);
  const { dateAdapter } = useLocalization();
  const triggerRef = useRef<HTMLInputElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const previousSelectedDate = useRef<typeof selectedDate>(selectedDate);

  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      _details: DateInputSingleDetails | undefined,
    ) => {
      setSelectedDate(date ?? null);
    },
    [dateAdapter],
  );

  const handleApply = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
    ) => {
      console.log(
        `Applied date: ${date ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      setSelectedDate(date);
      previousSelectedDate.current = date;
      setOpen(false);
      args?.onApply?.(event, date);
    },
    [args?.onApply, dateAdapter],
  );

  const handleCancel = useCallback(() => {
    setSelectedDate(previousSelectedDate.current);
    setSelectedDate(previousSelectedDate.current);
    args?.onCancel?.();
  }, [args?.onCancel]);

  const handleOpenChange = useCallback(
    (
      newOpen: boolean,
      _event?: Event,
      reason?: DatePickerOpenChangeReason | string,
    ) => {
      if (reason === undefined) {
        triggerRef.current?.focus();
        setTimeout(() => {
          triggerRef.current?.setSelectionRange(
            0,
            triggerRef.current.value.length,
          );
        }, 1);
      }
      setOpen(newOpen);
    },
    [],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      {...args}
      onSelectionChange={handleSelectionChange}
      selectedDate={selectedDate}
      onApply={handleApply}
      onCancel={handleCancel}
      onOpenChange={handleOpenChange}
      open={open}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput inputRef={triggerRef} />
      </DatePickerTrigger>
      <DatePickerOverlay ref={datePickerRef}>
        <FlexLayout gap={0} direction="column">
          <FlexItem>
            <DatePickerSinglePanel />
            <Divider variant="tertiary" />
          </FlexItem>
          <FlexItem>
            <DatePickerActions
              selectionVariant="single"
              applyButtonRef={applyButtonRef}
            />
          </FlexItem>
        </FlexLayout>
      </DatePickerOverlay>
    </DatePicker>
  );
};
