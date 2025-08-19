import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import * as systemStatusStories from "@stories/system-status/system-status.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(systemStatusStories);
// biome-ignore lint/suspicious/noShadowRestrictedNames: Error is the story name.
const { Info, Success, Error, Warning } = composedStories;

describe("GIVEN a System status", () => {
  checkAccessibility(composedStories);

  it('should render an info status when `status="info"`', () => {
    cy.mount(<Info />);

    cy.findByTestId("InfoSolidIcon").should("exist");
  });
  it('should render a success status when `status="success"`', () => {
    cy.mount(<Success />);

    cy.findByTestId("SuccessTickIcon").should("exist");
  });
  it('should render a warning status when `status="warning"`', () => {
    cy.mount(<Warning />);

    cy.findByTestId("WarningSolidIcon").should("exist");
  });
  it('should render an error status when `status="error"`', () => {
    cy.mount(<Error />);

    cy.findByTestId("ErrorSolidIcon").should("exist");
  });

  it('should have a default role of "status"', () => {
    const message = "example announcement";
    cy.mount(
      <SystemStatus>
        <SystemStatusContent>{message}</SystemStatusContent>
      </SystemStatus>,
    );

    cy.findByRole("status").should("have.text", message);
  });
});
