import {
  DateInputRange as _DateInputRange,
  DateInputSingle as _DateInputSingle,
} from "@salt-ds/date-components";
import { deprecatedComponent } from "../utils/deprecatedExport";

const KEY = "@salt-ds/lab/date-input";
const MSG =
  "@salt-ds/lab 'date-input' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.";

export const DateInputRange = deprecatedComponent(
  _DateInputRange,
  "DateInputRange",
  KEY,
  MSG,
);
export const DateInputSingle = deprecatedComponent(
  _DateInputSingle,
  "DateInputSingle",
  KEY,
  MSG,
);

export type {
  DateInputRangeDetails,
  DateInputRangeProps,
  DateInputRangeValue,
  DateInputSingleDetails,
  DateInputSingleProps,
  DateParserField,
} from "@salt-ds/date-components";
