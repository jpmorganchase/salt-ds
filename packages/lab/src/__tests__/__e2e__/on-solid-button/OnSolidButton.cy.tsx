import { OnSolidButton } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import * as onSolidButtonStories from "~stories/on-solid-button/on-solid-button.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(onSolidButtonStories);

describe("GIVEN an OnSolidButton", () => {
  checkAccessibility(composedStories);

  it("should forward a custom className", () => {
    cy.mount(<OnSolidButton className="custom-class">Dismiss</OnSolidButton>);
    cy.findByRole("button", { name: "Dismiss" }).should(
      "have.class",
      "custom-class",
    );
  });

  it("should call onClick when clicked", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<OnSolidButton onClick={clickSpy}>Dismiss</OnSolidButton>);
    cy.findByRole("button", { name: "Dismiss" }).realClick();
    cy.get("@clickSpy").should("have.been.calledOnce");
  });

  it("should not call onClick when disabled", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(
      <OnSolidButton disabled onClick={clickSpy}>
        Dismiss
      </OnSolidButton>,
    );
    cy.findByRole("button", { name: "Dismiss" }).should("be.disabled");
    cy.findByRole("button", { name: "Dismiss" }).realClick();
    cy.get("@clickSpy").should("not.have.been.called");
  });
});
