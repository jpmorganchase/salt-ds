import { Toast, ToastContent } from "@salt-ds/core";
import { LinkedIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react";
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

    it("AND status is info, THEN renders info state", () => {
      cy.mount(
        <Toast status="info">
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

    it("AND no status with custom icon, THEN renders info state with custom icon", () => {
      cy.mount(
        <Toast icon={LinkedIcon}>
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("LinkedIcon").should(
        "have.class",
        "saltStatusIndicator-info"
      );
    });

    it("AND status is info with custom icon, THEN renders info state with custom icon", () => {
      cy.mount(
        <Toast status="info" icon={LinkedIcon}>
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("LinkedIcon").should(
        "have.class",
        "saltStatusIndicator-info"
      );
    });

    it("AND status is error with custom icon, THEN renders error state with custom icon", () => {
      cy.mount(
        <Toast status="error" icon={LinkedIcon}>
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("LinkedIcon").should(
        "have.class",
        "saltStatusIndicator-error"
      );
    });

    it("AND status is warning with custom icon, THEN renders warning state with custom icon", () => {
      cy.mount(
        <Toast status="warning" icon={LinkedIcon}>
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("LinkedIcon").should(
        "have.class",
        "saltStatusIndicator-warning"
      );
    });

    it("AND status is success with custom icon, THEN renders success state with custom icon", () => {
      cy.mount(
        <Toast status="success" icon={LinkedIcon}>
          <ToastContent>Toast content</ToastContent>
        </Toast>
      );
      cy.findAllByTestId("LinkedIcon").should(
        "have.class",
        "saltStatusIndicator-success"
      );
    });
  });
});
