import { composeStories } from "@storybook/testing-react";
import { Toast } from "@salt-ds/lab";
import * as toastStories from "@stories/toast/toast.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(toastStories);

describe("Given a Toast", () => {
  checkAccessibility(composedStories);

  describe("THEN it renders correctly", () => {
    it("renders info state", () => {
      cy.mount(<Toast>Toast content</Toast>);
      cy.findAllByTestId("InfoSolidIcon").should("exist");
    });

    it("renders error state", () => {
      cy.mount(<Toast status="error">Toast content</Toast>);
      cy.findAllByTestId("ErrorSolidIcon").should("exist");
    });

    it("renders warning state", () => {
      cy.mount(<Toast status="warning">Toast content</Toast>);
      cy.findAllByTestId("WarningSolidIcon").should("exist");
    });

    it("renders success state", () => {
      cy.mount(<Toast status="success">Toast content</Toast>);
      cy.findAllByTestId("SuccessTickIcon").should("exist");
    });

    it("renders close button", () => {
      cy.mount(<Toast>Toast content</Toast>);
      cy.findAllByRole("button").should("exist");
      cy.findAllByTestId("CloseIcon").should("exist");
    });
  });

  describe("WHEN hideClose", () => {
    it("THEN the close button is not displayed", () => {
      cy.mount(<Toast hideClose>Toast content</Toast>);
      cy.findAllByRole("button").should("not.exist");
      cy.findAllByTestId("CloseIcon").should("not.exist");
    });
  });
});
