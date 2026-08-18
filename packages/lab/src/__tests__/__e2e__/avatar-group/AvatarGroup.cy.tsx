import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import * as avatarGroupStories from "~stories/avatar-group/avatar-group.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(avatarGroupStories);
const { RenderProp } = composedStories;

describe("Given an AvatarGroup", () => {
  checkAccessibility(composedStories);

  it("should not apply the group role when rendered as a button", () => {
    cy.mount(
      <RenderProp
        render={<button type="button" aria-label="Team members" />}
      />,
    );

    cy.findByRole("button", { name: "Team members" }).should("exist");
    cy.findByRole("group").should("not.exist");
  });

  it("should render the count as a visible label with its own accessible name", () => {
    cy.mount(
      <AvatarGroup>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <AvatarGroupCount name="2 more">+2</AvatarGroupCount>
      </AvatarGroup>,
    );

    cy.findByText("+2").should("be.visible");
    cy.findByRole("img", { name: "2 more" }).should("be.visible");
  });

  it("should be focusable and activatable when rendered as a button", () => {
    const clickSpy = cy.stub().as("clickSpy");

    cy.mount(
      <RenderProp
        render={
          <button type="button" aria-label="Team members" onClick={clickSpy} />
        }
      />,
    );

    cy.findByRole("button", { name: "Team members" }).as("group");
    cy.realPress("Tab");
    cy.get("@group").should("be.focused");

    cy.realPress("Enter");
    cy.get("@clickSpy").should("have.been.calledOnce");
  });

  it("should pass its children to a `render` function", () => {
    const renderSpy = cy
      .stub()
      .as("renderSpy")
      .callsFake(({ children }) => (
        <section data-testid="custom-group">{children}</section>
      ));

    cy.mount(
      <AvatarGroup render={renderSpy}>
        <Avatar name="Alex Brailescu" />
        <AvatarGroupCount name="1 more">+1</AvatarGroupCount>
      </AvatarGroup>,
    );

    cy.findByTestId("custom-group").within(() => {
      cy.findByRole("img", { name: "Alex Brailescu" }).should("be.visible");
      cy.findByText("+1").should("be.visible");
    });
  });
});
