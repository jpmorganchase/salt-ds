import { warnOnce } from "../utils/deprecate";

warnOnce({
  key: "@salt-ds/lab/date-input",
  message:
    "@salt-ds/lab 'date-input' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.",
});

export { DateInputRange, DateInputSingle } from "@salt-ds/date-components";

export type {
  DateInputRangeProps,
  DateInputRangeValue,
  DateInputRangeDetails,
  DateParserField,
  DateInputSingleProps,
  DateInputSingleDetails,
} from "@salt-ds/date-components";
