import { composeStories } from "@storybook/testing-react";
import * as buttonStories from "@stories/button.stories";

const { FeatureButton, FocusableWhenDisabled } = composeStories(buttonStories);

describe("Given a Button", () => {
  it("should render text as children", () => {
    cy.mount(<FeatureButton />);
    cy.findByText(FeatureButton.args?.children as string).should("be.visible");
  });

  it("should call onClick when interacted with", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<FeatureButton onClick={clickSpy} />);
    cy.realPress("Tab");
    cy.findByRole("button").should("be.focused");
    cy.realPress("Enter");
    cy.get("@clickSpy").should("be.called");
    cy.realPress("Space");
    cy.get("@clickSpy").should("be.called");
    cy.findByRole("button").realClick();
    cy.get("@clickSpy").should("be.called");
  });

  it("should call onBlur when blurred", () => {
    const blurSpy = cy.stub().as("blurSpy");
    cy.mount(<FeatureButton onBlur={blurSpy} />);
    cy.findByText(FeatureButton.args?.children as string).should("be.visible");
    cy.realPress("Tab");
    cy.findByRole("button").should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button").should("not.be.focused");
    cy.get("@blurSpy").should("be.called");
  });

  it("should be focusable when disabled and focusableWhenDisabled", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<FocusableWhenDisabled onClick={clickSpy} />);
    cy.findByRole("button").should("have.attr", "aria-disabled", "true");
    cy.realPress("Tab");
    cy.findByRole("button").should("be.focused");
    cy.realPress("Enter");
    cy.get("@clickSpy").should("not.be.called");
    cy.realPress("Space");
    cy.get("@clickSpy").should("not.be.called");
    cy.findByRole("button").realClick();
    cy.get("@clickSpy").should("not.be.called");
  });

  it("should apply type prop to button element", () => {
    cy.mount(<FeatureButton type="submit" />);
    cy.findByRole("button").should("have.attr", "type", "submit");
  });

  it("should apply default type prop to button element", () => {
    cy.mount(<FeatureButton />);
    cy.findByRole("button").should("have.attr", "type", "button");
  });
});
