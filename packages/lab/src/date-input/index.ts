import { warnOnce } from "../utils/deprecate";

warnOnce({
  key: "@salt-ds/lab/date-input",
  message:
    "@salt-ds/lab 'date-input' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.",
});

export type {
  DateInputRangeDetails,
  DateInputRangeProps,
  DateInputRangeValue,
  DateInputSingleDetails,
  DateInputSingleProps,
  DateParserField,
} from "@salt-ds/date-components";
export { DateInputRange, DateInputSingle } from "@salt-ds/date-components";
