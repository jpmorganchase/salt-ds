import { composeStories } from "@storybook/testing-react";
import { Toast } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import * as toastStories from "@stories/toast/toast.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(toastStories);

describe("Given a Toast", () => {
  checkAccessibility(composedStories);

  describe("WHEN ToastContent", () => {
    it("AND no status, THEN renders info state", () => {
      cy.mount(<Toast>Toast content</Toast>);
      cy.findAllByTestId("InfoSolidIcon").should("exist");
    });

    it("AND status=error, THEN renders error state", () => {
      cy.mount(<Toast status="error">Toast content</Toast>);
      cy.findAllByTestId("ErrorSolidIcon").should("exist");
    });

    it("AND status=warning, THEN renders warning state", () => {
      cy.mount(<Toast status="warning">Toast content</Toast>);
      cy.findAllByTestId("WarningSolidIcon").should("exist");
    });

    it("AND status=success, THEN renders success state", () => {
      cy.mount(<Toast status="success">Toast content</Toast>);
      cy.findAllByTestId("SuccessTickIcon").should("exist");
    });
  });

  describe("WHEN ToastClose", () => {
    it("renders close button", () => {
      cy.mount(
        <Toast>
          Toast content
          <Button variant="secondary">
            <CloseIcon />
          </Button>
        </Toast>
      );
      cy.findAllByRole("button").should("exist");
      cy.findAllByTestId("CloseIcon").should("exist");
    });
  });
});
