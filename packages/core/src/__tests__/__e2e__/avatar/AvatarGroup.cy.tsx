import { Avatar, AvatarGroup, Tooltip } from "@salt-ds/core";

describe("Given an AvatarGroup", () => {
  it("collapses children beyond `max` into a single, accessible overflow indicator", () => {
    cy.mount(
      <AvatarGroup max={2}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
        <Avatar name="Jane Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
    cy.findByRole("img", { name: "Alex Brailescu" }).should("be.visible");
    cy.findByRole("img", { name: "Peter Piper" }).should("be.visible");
    cy.findByRole("img", { name: "John Doe" }).should("not.exist");

    cy.findByText("+2").should("be.visible");
    cy.findByRole("img", { name: "2 more" }).should("be.visible");
  });

  it("renders every avatar without an overflow indicator when children equal `max`", () => {
    cy.mount(
      <AvatarGroup max={3}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
  });

  it("renders every avatar without an overflow indicator when children are fewer than `max`", () => {
    cy.mount(
      <AvatarGroup max={5}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
  });

  it("delegates the overflow indicator to `renderSurplus` when children exceed `max`", () => {
    const renderSurplus = cy
      .stub()
      .as("renderSurplus")
      .returns(<span data-testid="custom-overflow">custom</span>);

    cy.mount(
      <AvatarGroup max={2} renderSurplus={renderSurplus}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
        <Avatar name="Jane Doe" />
      </AvatarGroup>,
    );

    cy.findByTestId("custom-overflow").should("be.visible");
    cy.findByText("+2").should("not.exist");
    cy.get("@renderSurplus").should("have.been.calledWithMatch", {
      count: 2,
      hiddenAvatars: Cypress.sinon.match.array,
    });
  });

  it("does not call `renderSurplus` when children fit within `max`", () => {
    const renderSurplus = cy
      .stub()
      .as("renderSurplus")
      .returns(<span data-testid="custom-overflow">custom</span>);

    cy.mount(
      <AvatarGroup max={3} renderSurplus={renderSurplus}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByTestId("custom-overflow").should("not.exist");
    cy.findAllByRole("img").should("have.length", 3);
    cy.get("@renderSurplus").should("not.have.been.called");
  });

  it("renders as a custom element from a JSX element while preserving the group class", () => {
    cy.mount(
      <AvatarGroup max={2} render={<button type="button" />}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByRole("button").should("have.class", "saltAvatarGroup");
    cy.findAllByRole("img").should("have.length", 3);
    cy.findByText("+1").should("be.visible");
  });

  it("calls a `render` function with the merged props to create the element", () => {
    const mockRender = cy
      .stub()
      .as("render")
      .returns(<div data-testid="render-fn" />);

    cy.mount(
      <AvatarGroup max={2} render={mockRender}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByTestId("render-fn").should("exist");
    cy.get("@render").should("have.been.calledWithMatch", {
      className: Cypress.sinon.match.string,
      children: Cypress.sinon.match.any,
    });
  });

  it("ignores a negative `max`, showing every avatar", () => {
    cy.mount(
      <AvatarGroup max={-1}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
    cy.findByRole("img", { name: "John Doe" }).should("be.visible");
  });

  it("ignores a non-finite `max`, showing every avatar", () => {
    cy.mount(
      <AvatarGroup max={Number.POSITIVE_INFINITY}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
  });

  it("floors a fractional `max`", () => {
    cy.mount(
      <AvatarGroup max={1.9}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findByRole("img", { name: "Alex Brailescu" }).should("be.visible");
    cy.findAllByRole("img").should("have.length", 2); // 1 visible + overflow
    cy.findByText("+2").should("be.visible");
  });

  it("keeps non-Avatar children in the layout when within `max`", () => {
    cy.mount(
      <AvatarGroup max={3}>
        <Avatar name="Alex Brailescu" />
        <Tooltip content="Peter Piper">
          <Avatar name="Peter Piper" />
        </Tooltip>
        <Avatar name="John Doe" />
      </AvatarGroup>,
    );

    cy.findAllByRole("img").should("have.length", 3);
    cy.findByRole("img", { name: "Peter Piper" }).should("be.visible");
  });

  it("counts non-Avatar children towards the overflow", () => {
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

    cy.findByText("+2").should("be.visible");
  });
});
