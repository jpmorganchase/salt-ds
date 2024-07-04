import React, { forwardRef } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";
import {
  FlexItem,
  FlexLayout,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
} from "@salt-ds/core";
import {
  DatePickerRangePanel,
  useDatePickerContext,
  List,
  ListProps,
  RangeSelectionValueType,
  DatePickerRangePanelProps,
} from "@salt-ds/lab";

type CustomItem = {
  label: string;
  tenor: number;
};
const customItemToString: ListProps<CustomItem>["itemToString"] = ({ label }) =>
  label;

export const CustomDatePickerPanel = forwardRef<
  HTMLDivElement,
  DatePickerRangePanelProps<RangeSelectionValueType>
>(function CustomDatePickerPanel(props, ref) {
  const {
    state: { selectedDate },
    helpers: { setSelectedDate },
  } = useDatePickerContext<RangeSelectionValueType>();
  const { helperText, ...rest } = props;
  return (
    <StackLayout separators gap={0} ref={ref}>
      {helperText && (
        <FlexItem className={"saltDatePickerPanel-header"}>
          <FormFieldHelperText>{helperText}</FormFieldHelperText>
        </FlexItem>
      )}
      <FlexLayout>
        <List<CustomItem>
          aria-label="Tenor shortcuts"
          itemToString={customItemToString}
          maxHeight="unset"
          onSelectionChange={(e, item) => {
            if (!item) {
              return;
            }
            const { tenor } = item;
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
          source={[
            { tenor: 5, label: "5 years" },
            { tenor: 10, label: "10 years" },
            { tenor: 15, label: "15 years" },
            { tenor: 20, label: "20 years" },
          ]}
        />
        <DatePickerRangePanel {...rest} />
      </FlexLayout>
    </StackLayout>
  );
});
