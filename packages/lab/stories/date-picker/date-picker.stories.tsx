import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  AdapterDateFns,
  AdapterDayjs,
  AdapterLuxon,
  AdapterMoment,
  DateDetailErrorEnum,
  type DateFrameworkType,
  type DateInputRangeDetails,
  type DateInputSingleDetails,
  DatePicker,
  DatePickerActions,
  type DatePickerHandles,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DatePickerRangeProps,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type DatePickerSinglePanelProps,
  type DatePickerSingleProps,
  DatePickerTrigger,
  type DateRangeSelection,
  LocalizationProvider,
  type LocalizationProviderProps,
  type SingleDatePickerState,
  type SingleDateSelection,
  type TimeFields,
  useDatePickerContext,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { CustomDatePickerPanel } from "./CustomDatePickerPanel"; // CustomDatePickerPanel is an example, replace with your own composition of date controls
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      }
      args?.onSelectionChange?.(newSelection);
    },
    [args?.onSelectionChange, dateAdapter],
  );

  return (
    <DatePicker
      selectionVariant="single"
      {...args}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args?.onSelectionChange?.(newSelection);
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

export const SingleControlled: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(defaultSelectedDate ?? null);
  const { dateAdapter } = useLocalization();
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      setSelectedDate(newSelection.date);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      }
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setSelectedDate],
  );

  return (
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      setSelectedDate({
        startDate,
        endDate,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setSelectedDate],
  );

  return (
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
  );
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
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
        onOpen={setOpen}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
  );

  const minDate =
    dateAdapter.parse("15/01/2030", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("15/01/2031", "DD/MM/YYYY").date ?? undefined;
  const defaultStartVisibleMonth =
    dateAdapter.parse("01/01/2030", "DD/MM/YYYY").date ?? undefined;
  const defaultEndVisibleMonth =
    dateAdapter.parse("01/02/2030", "DD/MM/YYYY").date ?? undefined;
  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={maxDate}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
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
        onOpen={setOpen}
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
        onClick={() =>
          select({
            date: dateAdapter.today(),
          })
        }
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      setSelectedDate(newSelectedDate);
      if (newSelectedDate) {
        applyButtonRef?.current?.focus();
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  const handleOpen = useCallback(
    (opening: boolean) => {
      if (opening) {
        savedState.current = {
          helperText,
          validationStatus,
        };
      }
      setOpen(opening);
    },
    [validationStatus, setOpen],
  );

  const handleCancel = useCallback(() => {
    setValidationStatus(savedState.current?.validationStatus);
    setHelperText(savedState.current?.helperText);
    setSelectedDate(previousSelectedDate.current);
    args?.onCancel?.();
  }, [args, setHelperText, setValidationStatus]);

  const handleApply = useCallback(
    (
      newSelectedDate:
        | SingleDateSelection<DateFrameworkType>
        | null
        | undefined,
    ) => {
      console.log(
        `Applied date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      setSelectedDate(newSelectedDate);
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
      previousSelectedDate.current = newSelectedDate;
      args?.onApply?.(newSelectedDate);
    },
    [
      args,
      applyButtonRef?.current,
      dateAdapter,
      setHelperText,
      setSelectedDate,
      setValidationStatus,
    ],
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
        onOpen={handleOpen}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      setSelectedDate({ startDate, endDate });
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
  );

  const handleOpen = useCallback(
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
  }, [args, setHelperText, setValidationStatus]);

  const handleApply = useCallback(
    (newSelectedDate: DateRangeSelection<DateFrameworkType>) => {
      const { startDate, endDate } = newSelectedDate;
      console.log(
        `Applied StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      setSelectedDate(newSelectedDate);
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
      previousSelectedDate.current = newSelectedDate;
      args?.onApply?.(newSelectedDate);
    },
    [
      args,
      applyButtonRef?.current,
      dateAdapter,
      setHelperText,
      setSelectedDate,
      setValidationStatus,
    ],
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
        onOpen={handleOpen}
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      setSelectedDate(newSelectedDate);
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  const customParser = useCallback(
    (
      inputDate: string,
      format: string,
      locale: any,
    ): DateInputSingleDetails<DateFrameworkType> => {
      if (!inputDate?.length) {
        return {
          date: null,
          errors: [
            { type: DateDetailErrorEnum.UNSET, message: "no date provided" },
          ],
        };
      }
      const parsedDate = inputDate;
      const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
      if (offsetMatch) {
        const offsetDays = Number.parseInt(offsetMatch[1], 10);
        let offsetDate = selectedDate ? selectedDate : dateAdapter.today();
        offsetDate = dateAdapter.add(offsetDate, { days: offsetDays });
        return {
          date: offsetDate,
        };
      }
      return dateAdapter.parse(parsedDate || "", format, locale);
    },
    [dateAdapter, selectedDate],
  );

  // ProTip: you don't need this map, it supports dynamically switching the Adapter at runtime, just extend a known Adapter instead
  const dateAdapterMap: Record<
    string,
    LocalizationProviderProps<any, any>["DateAdapter"]
  > = useMemo(
    () => ({
      dayjs: class CustomDayjsAdapter extends AdapterDayjs {
        parse(
          value: string,
          format: string,
          locale?: string,
        ): ReturnType<AdapterDayjs["parse"]> {
          const result = customParser(value, format, locale) as ReturnType<
            AdapterDayjs["parse"]
          >;
          if (result.date !== undefined) {
            return result;
          }
          return super.parse(value, format, locale);
        }
      },
      "date-fns": class CustomDateFnsAdapter extends AdapterDateFns {
        parse(
          value: string,
          format: string,
          locale?: any,
        ): ReturnType<AdapterDateFns["parse"]> {
          const result = customParser(value, format, locale) as ReturnType<
            AdapterDateFns["parse"]
          >;
          if (result.date !== undefined) {
            return result;
          }
          return super.parse(value, format, locale);
        }
      },
      luxon: class CustomLuxonAdapter extends AdapterLuxon {
        parse(
          value: string,
          format: string,
          locale?: string,
        ): ReturnType<AdapterLuxon["parse"]> {
          const result = customParser(value, format, locale) as ReturnType<
            AdapterLuxon["parse"]
          >;
          if (result.date !== undefined) {
            return result;
          }
          return super.parse(value, format, locale);
        }
      },
      moment: class CustomMomentAdapter extends AdapterMoment {
        parse(
          value: string,
          format: string,
          locale?: string,
        ): ReturnType<AdapterMoment["parse"]> {
          const result = customParser(value, format, locale) as ReturnType<
            AdapterMoment["parse"]
          >;
          if (result.date !== undefined) {
            return result;
          }
          return super.parse(value, format, locale);
        }
      },
    }),
    [customParser],
  );

  const CustomDateAdapter = dateAdapterMap[dateAdapter.lib];
  return (
    <LocalizationProvider DateAdapter={CustomDateAdapter}>
      <FormField validationStatus={validationStatus}>
        <FormLabel>Select a date</FormLabel>
        <DatePicker
          selectionVariant="single"
          {...args}
          onSelectionChange={handleSelectionChange}
          onOpen={setOpen}
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
    </LocalizationProvider>
  );
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
      result: DateInputSingleDetails<DateFrameworkType>,
    ): DateInputSingleDetails<DateFrameworkType> => {
      if (result?.date && isWeekend(result.date)) {
        result.errors = result.errors ?? [];
        result.errors?.push({
          type: DateDetailErrorEnum.INVALID_DAY,
          message: "date must be a weekday",
        });
      }
      return result;
    },
    [],
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  const customiseNonDateError = useCallback(
    (
      result: DateInputSingleDetails<DateFrameworkType>,
    ): DateInputSingleDetails<DateFrameworkType> => {
      if (!result.errors) {
        return result;
      }
      result.errors = result.errors.map((error) => {
        if (error.type === DateDetailErrorEnum.NOT_A_DATE) {
          error.message = "valid dates are any weekday";
        }
        return error;
      });
      return result;
    },
    [],
  );

  const isDayUnselectable = useCallback(
    (date: DateFrameworkType): string | false => {
      return isWeekend(date) ? "weekends are un-selectable" : false;
    },
    [],
  );

  const validateAndCustomizeError = useCallback(
    (
      result: DateInputSingleDetails<DateFrameworkType>,
    ): DateInputSingleDetails<DateFrameworkType> => {
      const validateWeekdayResult = validateIsAWeekday(result);
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
        onOpen={setOpen}
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
  dateAdapter.locale = isDateFns ? dateFnsEs : "es-ES";
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
  dateAdapter.locale = isDateFns ? dateFnsEs : "es-ES";
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"range"}
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
  dateAdapter.locale = isDateFns ? dateFnsZhCn : "zh-CN";
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY", isDateFns ? dateFnsEnUs : "en") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
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
        onOpen={setOpen}
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
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      args.onSelectionChange?.(newSelection);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        {...args}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
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

  const handleDateChange = useCallback(
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      let newSelectedDate: DateRangeSelection<DateFrameworkType> = {
        startDate,
        endDate,
      };
      newSelectedDate = addTimeToDate(selectedTime, newSelectedDate);
      console.log(
        `StartDate: ${newSelectedDate?.startDate ? dateAdapter.format(newSelectedDate.startDate, "DD MMM YYYY HH:mm:ss") : newSelectedDate?.startDate}, EndDate: ${newSelectedDate?.endDate ? dateAdapter.format(newSelectedDate.endDate, "DD MMM YYYY HH:mm:ss") : newSelectedDate?.endDate}`,
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
      setSelectedDate(newSelectedDate);
      args.onSelectionChange?.({
        startDate: {
          ...newSelection.startDate,
          date: newSelectedDate.startDate,
        },
        endDate: { ...newSelection.endDate, date: newSelectedDate.endDate },
      });
    },
    [args.onSelectionChange, dateAdapter, selectedTime],
  );

  const handleTimeChange = useCallback(
    (newSelectedTime: typeof selectedTime) => {
      setSelectedTime(newSelectedTime);
      if (selectedDate) {
        const newSelectedDate = addTimeToDate(newSelectedTime, selectedDate);
        setSelectedDate(newSelectedDate);
        console.log(
          `StartDate: ${newSelectedDate?.startDate ? dateAdapter.format(newSelectedDate.startDate, "DD MMM YYYY HH:mm:ss") : newSelectedDate?.startDate}, EndDate: ${newSelectedDate?.endDate ? dateAdapter.format(newSelectedDate.endDate, "DD MMM YYYY HH:mm:ss") : newSelectedDate?.endDate}`,
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
    if (date?.startDate && startTime) {
      date.startDate = dateAdapter.set(date.startDate, {
        hour: startTime.hour,
        minute: startTime.minute,
        second: startTime.second,
        millisecond: startTime.millisecond,
      });
    }
    if (date?.endDate && endTime) {
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
    (appliedDate: DateRangeSelection<DateFrameworkType>) => {
      const { startDate, endDate } = appliedDate;
      console.log(
        `Applied StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY HH:mm:ss") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY  HH:mm:ss") : endDate}`,
      );
      previousSelectedDate.current = selectedDate;
      onApplyProp?.(appliedDate);
    },
    [onApplyProp],
  );

  const handleCancel = useCallback(() => {
    setSelectedDate(previousSelectedDate.current);
    args?.onCancel?.();
  }, [args]);

  return (
    <DatePicker
      selectionVariant="range"
      {...args}
      selectedDate={selectedDate}
      onApply={handleApply}
      onCancel={handleCancel}
      onSelectionChange={handleDateChange}
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

export const ResetSingleState: StoryFn<
  DatePickerSingleProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(defaultSelectedDate ?? null);
  const { dateAdapter } = useLocalization();
  const datePickerRef = useRef<DatePickerHandles>(null);
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails<DateFrameworkType>) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(
        `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
      );
      setSelectedDate(newSelection.date);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      }
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      {...args}
      onSelectionChange={handleSelectionChange}
      selectedDate={selectedDate}
      ref={datePickerRef}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
      <Button
        onClick={() => {
          datePickerRef?.current?.reset();
          setSelectedDate(null);
        }}
      >
        Reset all selections
      </Button>
    </DatePicker>
  );
};

export const ResetRangeState: StoryFn<
  DatePickerRangeProps<DateFrameworkType>
> = ({ selectionVariant, defaultSelectedDate, ...args }) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] =
    useState<DateRangeSelection<DateFrameworkType> | null>(
      defaultSelectedDate ?? null,
    );
  const datePickerRef = useRef<DatePickerHandles>(null);
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails<DateFrameworkType>) => {
      const {
        startDate: {
          date: startDate,
          value: startDateOriginalValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateOriginalValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      setSelectedDate({
        startDate,
        endDate,
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
      args.onSelectionChange?.(newSelection);
    },
    [args.onSelectionChange, dateAdapter, setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant="range"
      {...args}
      onSelectionChange={handleSelectionChange}
      selectedDate={selectedDate}
      ref={datePickerRef}
    >
      <DatePickerTrigger>
        <DatePickerRangeInput />
        <Button
          onClick={() => {
            datePickerRef?.current?.reset();
            setSelectedDate(null);
          }}
        >
          Reset All Selections
        </Button>
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
