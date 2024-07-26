import { getLocalTimeZone, today } from "@internationalized/date";
import {
  FlexItem,
  FlexLayout,
  FormFieldHelperText,
  StackLayout,
  makePrefixer,
  ListBox,
  Option,
} from "@salt-ds/core";
import {
  DatePickerRangePanel,
  type DatePickerRangePanelProps,
  List,
  type ListProps,
  type DateRangeSelection,
  useDatePickerContext,
} from "@salt-ds/lab";
import React, { forwardRef } from "react";

type CustomItem = {
  label: string;
  tenor: number;
};
const customItemToString: ListProps<CustomItem>["itemToString"] = ({ label }) =>
  label;

const tenorOptions = [
  { tenor: "5", label: "5 years" },
  { tenor: "10", label: "10 years" },
  { tenor: "15", label: "15 years" },
  { tenor: "20", label: "20 years" },
];

export const CustomDatePickerPanel = forwardRef<
  HTMLDivElement,
  DatePickerRangePanelProps<DateRangeSelection>
>(function CustomDatePickerPanel(props, ref) {
  const {
    state: { selectedDate },
    helpers: { setSelectedDate },
  } = useDatePickerContext<DateRangeSelection>();
  const { helperText, ...rest } = props;
  return (
    <StackLayout separators gap={0} ref={ref}>
      {helperText && (
        <FlexItem className={"saltDatePickerPanel-header"}>
          <FormFieldHelperText>{helperText}</FormFieldHelperText>
        </FlexItem>
      )}
      <FlexLayout>
        <ListBox
          bordered
          style={{ width: "10em" }}
          onSelectionChange={(e, item) => {
            if (!item) {
              return;
            }
            const tenor = parseInt(item[0], 10);
            const newSelectedDate = selectedDate?.startDate
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
            setSelectedDate(newSelectedDate);
          }}
        >
          {tenorOptions.map(({ tenor, label }) => (
            <Option value={tenor} key={tenor}>
              {label}
            </Option>
          ))}
        </ListBox>
        );
        <DatePickerRangePanel {...rest} />
      </FlexLayout>
    </StackLayout>
  );
});
