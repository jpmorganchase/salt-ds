import { getLocalTimeZone, today } from "@internationalized/date";
import {
  FlexItem,
  FlexLayout,
  FormFieldHelperText,
  ListBox,
  Option,
  StackLayout,
} from "@salt-ds/core";
import {
  DatePickerRangePanel,
  DatePickerSinglePanel,
  type RangeDatePickerState,
  type SingleDatePickerState,
  useDatePickerContext,
} from "@salt-ds/lab";
import React, { forwardRef } from "react";

const tenorOptions = [
  { tenor: "5", label: "5 years" },
  { tenor: "10", label: "10 years" },
  { tenor: "15", label: "15 years" },
  { tenor: "20", label: "20 years" },
];

interface CustomDatePickerPanelProps {
  helperText?: string;
  selectionVariant: "single" | "range";
}

export const CustomDatePickerPanel = forwardRef<
  HTMLDivElement,
  CustomDatePickerPanelProps
>(function CustomDatePickerPanel({ selectionVariant, helperText }, ref) {
  // biome-ignore lint/suspicious/noExplicitAny: state and helpers is coerced based on selectionVariant
  let stateAndHelpers: any;
  if (selectionVariant === "range") {
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "range",
    }) as RangeDatePickerState;
  } else {
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "single",
    }) as SingleDatePickerState;
  }

  const {
    state: { selectedDate },
    helpers: { setSelectedDate },
  } = stateAndHelpers;

  return (
    <StackLayout separators gap={0} ref={ref}>
      {helperText && (
        <FlexItem className={"saltDatePickerPanel-header"}>
          <FormFieldHelperText>{helperText}</FormFieldHelperText>
        </FlexItem>
      )}
      <FlexLayout gap={0}>
        <ListBox
          bordered
          style={{ width: "10em" }}
          onSelectionChange={(_event, item) => {
            if (!item) {
              return;
            }
            const tenor = Number.parseInt(item[0], 10);
            let newSelectedDate;
            if (selectionVariant === "range") {
              newSelectedDate = selectedDate?.startDate
                ? {
                    startDate: selectedDate.startDate,
                    endDate: selectedDate.startDate.add({
                      years: tenor,
                    }),
                  }
                : {
                    startDate: today(getLocalTimeZone()),
                    endDate: today(getLocalTimeZone()).add({
                      years: tenor,
                    }),
                  };
              setSelectedDate(newSelectedDate, {
                startDate: false,
                endDate: false,
              });
            } else {
              newSelectedDate = selectedDate
                ? selectedDate.add({
                    years: tenor,
                  })
                : today(getLocalTimeZone()).add({
                    years: tenor,
                  });
              setSelectedDate(newSelectedDate, false);
            }
          }}
        >
          {tenorOptions.map(({ tenor, label }) => (
            <Option value={tenor} key={tenor} tabIndex={0}>
              {label}
            </Option>
          ))}
        </ListBox>
        {selectionVariant === "range" ? (
          <DatePickerRangePanel />
        ) : (
          <DatePickerSinglePanel />
        )}
      </FlexLayout>
    </StackLayout>
  );
});
