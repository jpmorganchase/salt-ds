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
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DatePickerRangePanel,
  DatePickerSingleGridPanel,
  type RangeDatePickerState,
  type SingleDatePickerState,
  useDatePickerContext,
  useLocalization,
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

// CustomDatePickerPanel is a sample component, representing a composition you could create yourselves, not intended for importing into your own projects
// refer to https://github.com/jpmorganchase/salt-ds/blob/main/packages/lab/src/date-picker/useDatePicker.ts to create your own
export const CustomDatePickerPanel = forwardRef<
  HTMLDivElement,
  CustomDatePickerPanelProps
>(function CustomDatePickerPanel({ selectionVariant, helperText }, ref) {
  const { dateAdapter } = useLocalization();
  // biome-ignore lint/suspicious/noExplicitAny: state and helpers is coerced based on selectionVariant
  let stateAndHelpers: any;
  if (selectionVariant === "range") {
    // TODO
    // biome-ignore lint/correctness/useHookAtTopLevel: This should be fixed.
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "range",
    }) as RangeDatePickerState<DateFrameworkType>;
  } else {
    // TODO
    // biome-ignore lint/correctness/useHookAtTopLevel: This should be fixed.
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "single",
    }) as SingleDatePickerState<DateFrameworkType>;
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
              onSelectionChange={(event, item) => {
                if (!item) {
                  return;
                }
                const tenor = Number.parseInt(item[0], 10);
                let newSelection;
                if (selectionVariant === "range") {
                  newSelection = selectedDate?.startDate
                    ? {
                        startDate: selectedDate.startDate,
                        endDate: dateAdapter.add(selectedDate.startDate, {
                          years: tenor,
                        }),
                      }
                    : {
                        startDate: dateAdapter.today(),
                        endDate: dateAdapter.add(dateAdapter.today(), {
                          years: tenor,
                        }),
                      };
                  select(event, newSelection);
                } else {
                  newSelection = selectedDate
                    ? dateAdapter.add(selectedDate, {
                        years: tenor,
                      })
                    : dateAdapter.add(dateAdapter.today(), {
                        years: tenor,
                      });
                  select(event, newSelection);
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
          <DatePickerSingleGridPanel />
        )}
      </FlexLayout>
    </StackLayout>
  );
});
