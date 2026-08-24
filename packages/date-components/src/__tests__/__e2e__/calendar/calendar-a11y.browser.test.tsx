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
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as calendarStories from "~stories/calendar/calendar.stories";

const composedStories = composeStories(calendarStories);

function registerAdapterTests<TDate extends DateFrameworkType, TLocale>(
  adapter: SaltDateAdapter<TDate, TLocale>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    checkAccessibility(composedStories, (children) =>
      renderWithSalt(children, { dateAdapter: adapter }),
    );
  });
}

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
