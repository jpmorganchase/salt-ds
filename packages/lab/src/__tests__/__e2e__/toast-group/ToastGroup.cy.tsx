import { composeStories } from "@storybook/react";
import { Button, Toast, ToastContent } from "@salt-ds/core";
import { ToastGroup } from "@salt-ds/lab";
import { CloseIcon } from "@salt-ds/icons";
import * as toastGroupStories from "@stories/toast-group/toast-group.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(toastGroupStories);

describe("Given a ToastGroup", () => {
  checkAccessibility(composedStories);

  describe("WHEN placement is top-right", () => {
    it("THEN should render correctly", () => {
      cy.mount(
        <ToastGroup placement="top-right">
          <Toast>
            <ToastContent>This is a toast</ToastContent>
            <Button variant="secondary">
              <CloseIcon />
            </Button>
          </Toast>
        </ToastGroup>
      );
      cy.get(".saltToastGroup-top-right")
        .should("exist")
        .and("have.css", "top", "0px");
      cy.findByRole("alert").should("exist");
    });
  });
  describe("WHEN placement is bottom-right", () => {
    it("THEN should render correctly", () => {
      cy.mount(
        <ToastGroup placement="bottom-right">
          <Toast>
            <ToastContent>This is a toast</ToastContent>
            <Button variant="secondary">
              <CloseIcon />
            </Button>
          </Toast>
        </ToastGroup>
      );
      cy.get(".saltToastGroup-bottom-right")
        .should("exist")
        .and("have.css", "bottom", "0px");
      cy.findByRole("alert").should("exist");
    });
  });
});
