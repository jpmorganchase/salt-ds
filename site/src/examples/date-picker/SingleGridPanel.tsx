import { FormField, FormFieldLabel, Input, StackLayout } from "@salt-ds/core";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  type DatePickerSingleGridPanelProps,
  DatePickerSingleInput,
  DatePickerTrigger,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

export const SingleGridPanel = () => {
  const { dateAdapter } = useLocalization();
  const [numberOfVisibleMonths, setNumberOfVisibleMonths] = useState("1");
  const [columns, setColumns] = useState("1");
  const [step, setStep] = useState("1");

  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: SingleDateSelection | null,
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
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSingleGridPanel
            columns={Number.parseInt(columns, 10)}
            numberOfVisibleMonths={
              Number.parseInt(
                numberOfVisibleMonths,
                10,
              ) as DatePickerSingleGridPanelProps["numberOfVisibleMonths"]
            }
            CalendarNavigationProps={{ step: Number.parseInt(step, 10) }}
          />
        </DatePickerOverlay>
      </DatePicker>
    </StackLayout>
  );
};
