import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";
// As required by locale specific examples
import "moment/dist/locale/zh-cn";
import "dayjs/locale/zh-cn";
import { zhCN as dateFnsZhCn } from "date-fns/locale";

export const SingleWithLocaleZhCN = (): ReactElement => {
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
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
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
    },
    [dateAdapter, defaultHelperText],
  );

  return (
    <FormField
      style={{ width: "256px" }}
      validationStatus={validationStatus}
      lang="zh"
    >
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput format={"DD MMM YYYY"} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSingleGridPanel
            helperText={helperText}
            CalendarNavigationProps={{ formatMonth: "MMMM" }}
          />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};
