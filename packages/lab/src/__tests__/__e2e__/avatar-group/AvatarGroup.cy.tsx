import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";

describe("Given an AvatarGroup", () => {
  it("renders a composed AvatarGroupCount as an accessible indicator", () => {
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

  it("renders as a custom element from a JSX element while preserving the group class", () => {
    cy.mount(
      <AvatarGroup render={<button type="button" />}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <AvatarGroupCount name="1 more">+1</AvatarGroupCount>
      </AvatarGroup>,
    );

    cy.findByRole("button").should("have.class", "saltAvatarGroup");
    cy.findByText("+1").should("be.visible");
  });

  it("calls a `render` function with the merged props to create the element", () => {
    const mockRender = cy
      .stub()
      .as("render")
      .returns(<div data-testid="render-fn" />);

    cy.mount(
      <AvatarGroup render={mockRender}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
      </AvatarGroup>,
    );

    cy.findByTestId("render-fn").should("exist");
    cy.get("@render").should("have.been.calledWithMatch", {
      className: Cypress.sinon.match.string,
      children: Cypress.sinon.match.any,
    });
  });
});
