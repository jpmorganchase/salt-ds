import { composeStories } from "@storybook/react";
import { Toast, ToastContent } from "@salt-ds/core";
import * as toastStories from "@stories/toast/toast.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(toastStories);

describe("Given a Toast", () => {
  checkAccessibility(composedStories);

  describe("WHEN ToastContent", () => {
    it("AND no status, THEN renders info state", () => {
      cy.mount(
        <Toast>
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("InfoSolidIcon").should("exist");
    });

    it("AND status is error, THEN renders error state", () => {
      cy.mount(
        <Toast status="error">
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("ErrorSolidIcon").should("exist");
    });

    it("AND status is warning, THEN renders warning state", () => {
      cy.mount(
        <Toast status="warning">
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("WarningSolidIcon").should("exist");
    });

    it("AND status is success, THEN renders success state", () => {
      cy.mount(
        <Toast status="success">
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("SuccessTickIcon").should("exist");
    });
  });
});
