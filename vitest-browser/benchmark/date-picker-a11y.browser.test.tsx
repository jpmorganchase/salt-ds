import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import * as datePickerStories from "~stories/date-picker/date-picker.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(datePickerStories);

function registerAdapterTests<TDate extends DateFrameworkType, TLocale>(
  adapter: SaltDateAdapter<TDate, TLocale>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    checkAccessibility(composedStories, (children) =>
      renderWithSalt(children, { dateAdapter: adapter }),
    );
  });
}

describe("GIVEN a DatePicker", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
