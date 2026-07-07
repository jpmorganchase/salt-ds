import { Avatar, AvatarGroup, Tooltip } from "@salt-ds/core";

describe("Given an AvatarGroup", () => {
  it("should render all Avatars when the number of children is within `max`", () => {
    cy.mount(
      <AvatarGroup max={5}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
    cy.findByText("+3").should("not.exist");
  });

  it("should render an overflow indicator when children exceed `max`", () => {
    cy.mount(
      <AvatarGroup max={2}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
        <Avatar name="Jane Doe" />
      </AvatarGroup>,
    );

    // 2 visible avatars + 1 overflow indicator
    cy.findAllByRole("img").should("have.length", 3);
    cy.findByText("+2").should("exist");
  });

  it("should give the default overflow indicator an accessible name", () => {
    cy.mount(
      <AvatarGroup max={1}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByRole("img", { name: "2 more" }).should("exist");
  });

  it("should preserve native button semantics when rendered as a button", () => {
    cy.mount(
      <AvatarGroup max={2} render={<button type="button" />}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByRole("button").should("have.class", "saltAvatarGroup");
    // 2 visible avatars + 1 overflow indicator
    cy.findAllByRole("img").should("have.length", 3);
    cy.findByText("+1").should("exist");
  });

  it("WHEN `render` is passed a render function, THEN should call `render` to create the element", () => {
    const testId = "avatar-group-testid";
    const mockRender = cy
      .stub()
      .as("render")
      .returns(<div data-testid={testId} />);

    cy.mount(
      <AvatarGroup max={2} render={mockRender}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByTestId(testId).should("exist");
    cy.get("@render").should("have.been.calledWithMatch", {
      className: Cypress.sinon.match.string,
      children: Cypress.sinon.match.any,
    });
  });

  it("WHEN `render` is given a JSX element, THEN should merge the props and render the JSX element", () => {
    const testId = "avatar-group-testid";

    cy.mount(
      <AvatarGroup max={2} render={<section data-testid={testId} />}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByTestId(testId).should("have.class", "saltAvatarGroup");
    // 2 visible avatars + 1 overflow indicator
    cy.findAllByRole("img").should("have.length", 3);
    cy.findByText("+1").should("exist");
  });

  it("should not render an overflow indicator when children exactly match `max`", () => {
    cy.mount(
      <AvatarGroup max={2}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 2);
    cy.findByText(/\+\d+/).should("not.exist");
  });

  it("should preserve non-Avatar children in the layout", () => {
    cy.mount(
      <AvatarGroup max={3}>
        <Tooltip content="Alex Brailescu">
          <Avatar name="Alex Brailescu" />
        </Tooltip>
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    // Wrapped Avatar is still rendered rather than dropped.
    cy.findByRole("img", { name: "Alex Brailescu" }).should("exist");
    cy.findAllByRole("img").should("have.length", 3);
    cy.findByText(/\+\d+/).should("not.exist");
  });

  it("should count non-Avatar children towards the overflow", () => {
    cy.mount(
      <AvatarGroup max={2}>
        <Tooltip content="Alex Brailescu">
          <Avatar name="Alex Brailescu" />
        </Tooltip>
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
        <Avatar name="Jane Doe" />
      </AvatarGroup>,
    );

    cy.findByText("+2").should("exist");
  });
});
