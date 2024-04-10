import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useFloatingComponent } from "@salt-ds/core";
import { clsx } from "clsx";
import { useDateInputContext } from "./DateInputContext";
import dateInputPanelCss from "./DateInputPanel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Calendar } from "../calendar";
import { CalendarDate, DateValue } from "@internationalized/date";

export interface DateInputPanelProps extends ComponentPropsWithoutRef<"div"> {
  selectionVariant?: "default" | "range";
}

const withBaseName = makePrefixer("saltDateInputPanel");

export const DateInputPanel = forwardRef<HTMLDivElement, DateInputPanelProps>(
  function DateInputPanel(props, ref) {
    const { className, context, selectionVariant = "default", ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-input-panel",
      css: dateInputPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const { openState, startDate, setStartDate, setInputValue, setOpen } =
      useDateInputContext();

    const handleSelectedDateChange = (_, newDate: DateValue) => {
      // console.log("setting start date from calendar pick", newDate);
      // const date =
      //   newDate && new Date(newDate?.year, newDate?.month, newDate?.day);
      // console.log(date);
      setStartDate(newDate);
      setInputValue();
      setOpen(false);
    };
    //
    // const calendarDay = startDate
    //   ? new CalendarDate(
    //       startDate?.getUTCFullYear(),
    //       startDate?.getMonth(),
    //       startDate?.getDay()
    //     )
    //   : null;
    // console.log("calendarDay", calendarDay);
    // console.log("calendarDay", calendarDay);
    return (
      <FloatingComponent
        className={clsx(withBaseName(), className)}
        open={openState}
        aria-modal="true"
        ref={ref}
        // focusManagerProps={{
        //   context: context,
        // }}
        {...rest}
      >
        {/*TODO: more panels can be added here. might need a more complex grid than layout so we can do areas */}
        <Calendar
          selectionVariant={selectionVariant}
          defaultVisibleMonth={startDate ? startDate : undefined}
          // TODO: move focus inside calendar once we got
          // TODO: change fallback for the range object
          selectedDate={selectionVariant === "default" ? startDate : startDate}
          onSelectedDateChange={handleSelectedDateChange}
          // TODO: do we move on calendar blur or in something that checks if focus is inside the panel, since more things might be added in?
          // TODO: when passing on blur to calendar, moving with arrows in days triggers blur
        />
      </FloatingComponent>
    );
  }
);
