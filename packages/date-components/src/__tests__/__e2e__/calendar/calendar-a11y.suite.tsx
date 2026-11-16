import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as calendarStories from "~stories/calendar/calendar.stories";

const composedStories = composeStories(calendarStories);

export function registerAdapterTests<TDate extends DateFrameworkType, TLocale>(
  adapter: SaltDateAdapter<TDate, TLocale>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    checkAccessibility(composedStories, (children) =>
      renderWithSalt(children, { dateAdapter: adapter }),
    );
  });
}
