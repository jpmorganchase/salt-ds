import { FormField, FormFieldLabel, Input, StackLayout } from "@salt-ds/core";
import {
  type DateInputRangeDetails,
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeGridPanel,
  type DatePickerRangeGridPanelProps,
  DatePickerRangeInput,
  DatePickerTrigger,
  type DateRangeSelection,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

export const RangeGridPanel = () => {
  const { dateAdapter } = useLocalization();
  const [numberOfVisibleMonths, setNumberOfVisibleMonths] = useState("1");
  const [columns, setColumns] = useState("1");
  const [step, setStep] = useState("1");
  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
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
    },
    [dateAdapter],
  );

  return (
    <StackLayout>
      <StackLayout direction={"row"}>
        <FormField>
          <FormFieldLabel>Number of columns</FormFieldLabel>
          <Input
            value={columns}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setColumns(event.target.value);
            }}
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Number of months in grid</FormFieldLabel>
          <Input
            value={numberOfVisibleMonths}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNumberOfVisibleMonths(event.target.value);
            }}
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Step</FormFieldLabel>
          <Input
            value={step}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setStep(event.target.value);
            }}
          />
        </FormField>
      </StackLayout>
      <DatePicker
        selectionVariant="range"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangeGridPanel
            columns={Number.parseInt(columns, 10)}
            numberOfVisibleMonths={
              Number.parseInt(
                numberOfVisibleMonths,
                10,
              ) as DatePickerRangeGridPanelProps["numberOfVisibleMonths"]
            }
            CalendarNavigationProps={{ step: Number.parseInt(step, 10) }}
          />
        </DatePickerOverlay>
      </DatePicker>
    </StackLayout>
  );
};
