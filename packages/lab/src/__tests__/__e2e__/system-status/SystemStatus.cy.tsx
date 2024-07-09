import { composeStories } from "@storybook/react";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import * as systemStatusStories from "@stories/system-status/system-status.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(systemStatusStories);
const { Info, Success, Error, Warning } = composedStories;

describe("GIVEN a System status", () => {
  checkAccessibility(composedStories);

  it("THEN should render info status", () => {
    cy.mount(<Info />);

    cy.findByTestId("InfoSolidIcon").should("exist");
  });
  it("THEN should render success status", () => {
    cy.mount(<Success />);

    cy.findByTestId("SuccessTickIcon").should("exist");
  });
  it("THEN should render warning status", () => {
    cy.mount(<Warning />);

    cy.findByTestId("WarningSolidIcon").should("exist");
  });
  it("THEN should render error status", () => {
    cy.mount(<Error />);

    cy.findByTestId("ErrorSolidIcon").should("exist");
  });

  it("THEN should announce the contents of the System status", () => {
    const message = "example announcement";
    cy.mount(
      <SystemStatus>
        <SystemStatusContent>{message}</SystemStatusContent>
      </SystemStatus>
    );

    cy.get("[aria-live]").contains(message);
  });
});
