import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
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
import { forwardRef } from "react";

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
    helpers: { select },
  } = stateAndHelpers;

  return (
    <StackLayout separators gap={0} ref={ref}>
      {helperText && (
        <FlexItem className={"saltDatePickerPanel-header"}>
          <FormFieldHelperText>{helperText}</FormFieldHelperText>
        </FlexItem>
      )}
      <FlexLayout gap={0}>
        <StackLayout>
          <FormField style={{ marginTop: "var(--salt-spacing-200)" }}>
            <FormFieldLabel style={{ marginLeft: "var(--salt-spacing-100)" }}>
              List header
            </FormFieldLabel>
            <ListBox
              style={{ width: "10em" }}
              onSelectionChange={(_event, item) => {
                if (!item) {
                  return;
                }
                const tenor = Number.parseInt(item[0], 10);
                let newSelection;
                if (selectionVariant === "range") {
                  newSelection = selectedDate?.startDate
                    ? {
                        startDate: {
                          date: selectedDate.startDate,
                        },
                        endDate: {
                          date: selectedDate.startDate.add({
                            years: tenor,
                          }),
                        },
                      }
                    : {
                        startDate: {
                          date: today(getLocalTimeZone()),
                        },
                        endDate: {
                          date: today(getLocalTimeZone()).add({
                            years: tenor,
                          }),
                        },
                      };
                  select(newSelection);
                } else {
                  newSelection = selectedDate
                    ? {
                        date: selectedDate.add({
                          years: tenor,
                        }),
                      }
                    : {
                        date: today(getLocalTimeZone()).add({
                          years: tenor,
                        }),
                      };
                  select(newSelection);
                }
              }}
            >
              {tenorOptions.map(({ tenor, label }) => (
                <Option value={tenor} key={tenor}>
                  {label}
                </Option>
              ))}
            </ListBox>
          </FormField>
        </StackLayout>
        <Divider orientation="vertical" />
        {selectionVariant === "range" ? (
          <DatePickerRangePanel />
        ) : (
          <DatePickerSinglePanel />
        )}
      </FlexLayout>
    </StackLayout>
  );
});
