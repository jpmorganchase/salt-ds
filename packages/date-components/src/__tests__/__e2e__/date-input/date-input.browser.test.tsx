import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as dateInputStories from "~stories/date-input/date-input.stories";

const composedStories = composeStories(dateInputStories);
function registerAdapterTests<TDate extends DateFrameworkType, TLocale>(
  adapter: SaltDateAdapter<TDate, TLocale>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    checkAccessibility(composedStories, (children) =>
      renderWithSalt(children, { dateAdapter: adapter }),
    );
  });
}

describe("GIVEN a DateInput", () => {
  registerAdapterTests(new AdapterDateFns());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
