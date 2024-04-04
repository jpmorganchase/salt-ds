import { forwardRef } from "react";
import {
  FloatingComponentProps,
  makePrefixer,
  useFloatingComponent,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { Calendar } from "../calendar";
import {
  DateFormatter, DateValue, parseAbsolute,
  parseAbsoluteToLocal,
  parseDate
} from "@internationalized/date";

const withBaseName = makePrefixer("saltInputCalendar");

export const InputCalendar = forwardRef<HTMLDivElement, FloatingComponentProps>(
  function InputCalendar(props, ref) {
    const { className, open, value, ...rest } = props;
    const { Component: FloatingComponent } = useFloatingComponent();
    // TODO: might be best to move this date parser up, so we ensure we always pass the same the same here and in the formatter
    // TODO: add a safe string parser, as toISOString fails if an invalid date is passed down. try catch and return null.
    const date = value && new Date(value).toISOString();

    console.log(date);
    // console.log(date, parseDate(date));
    // console.log(date && date, date && parseAbsolute(date));
    // const a = new DateFormatter("EN-GB", ).format(())
    // console.log(a)
    return (
      <FloatingComponent
        className={clsx(withBaseName(), className)}
        open={open}
        {...rest}
        ref={ref}
      >
          <Calendar/>
      </FloatingComponent>
    );
  }
);
