import { composeStories } from "@storybook/react";
import { Toast, ToastContent } from "@salt-ds/core";
import * as toastStories from "@stories/toast/toast.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { LinkedIcon } from "@salt-ds/icons";

const composedStories = composeStories(toastStories);

describe("Given a Toast", () => {
  checkAccessibility(composedStories);

  it("AND no status, THEN renders no state", () => {
    cy.mount(
      <Toast>
        <ToastContent>Toast content</ToastContent>
      </Toast>
    );
    cy.findByRole("img").should("not.exist");
  });

  it("AND status is info, THEN renders info state", () => {
    cy.mount(
      <Toast status="info">
        <ToastContent>Toast content</ToastContent>
      </Toast>
    );
    cy.findByRole("img", { name: "info" }).should("exist");
  });

  it("AND status is error, THEN renders error state", () => {
    cy.mount(
      <Toast status="error">
        <ToastContent>Toast content</ToastContent>
      </Toast>
    );
    cy.findByRole("img", { name: "error" }).should("exist");
  });

  it("AND status is warning, THEN renders warning state", () => {
    cy.mount(
      <Toast status="warning">
        <ToastContent>Toast content</ToastContent>
      </Toast>
    );
    cy.findByRole("img", { name: "warning" }).should("exist");
  });

  it("AND status is success, THEN renders success state", () => {
    cy.mount(
      <Toast status="success">
        <ToastContent>Toast content</ToastContent>
      </Toast>
    );
    cy.findByRole("img", { name: "success" }).should("exist");
  });

  it("AND custom icon, THEN renders with custom icon", () => {
    cy.mount(
      <Toast Icon={LinkedIcon} status={"success"}>
        <ToastContent>Toast content</ToastContent>
      </Toast>
    );
    cy.findAllByTestId("LinkedIcon").should("exist");
  });
});
