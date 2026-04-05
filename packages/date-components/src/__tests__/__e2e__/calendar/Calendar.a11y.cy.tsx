import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";

import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(calendarStories);

const adapters: [AdapterDateFnsTZ, AdapterDayjs, AdapterLuxon, AdapterMoment] =
  [
    new AdapterDateFnsTZ(),
    new AdapterDayjs(),
    new AdapterLuxon(),
    new AdapterMoment(),
  ];

describe("GIVEN a DateInput", () => {
  adapters.forEach((adapter) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        cy.setDateAdapter(adapter);
      });

      checkAccessibility(composedStories);
    });
  });
});
