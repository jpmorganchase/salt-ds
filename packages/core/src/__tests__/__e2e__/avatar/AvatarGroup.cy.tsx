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

  it("should propagate `size` to child Avatars while respecting a per-Avatar override", () => {
    cy.mount(
      <AvatarGroup size={3}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" size={1} />
      </AvatarGroup>,
    );

    cy.findByRole("img", { name: "Alex Brailescu" })
      .invoke("attr", "style")
      .should("contain", "--saltAvatar-size-multiplier: 3");
    cy.findByRole("img", { name: "Peter Piper" })
      .invoke("attr", "style")
      .should("contain", "--saltAvatar-size-multiplier: 1");
  });

  it("should call `renderOverflow` with the hidden avatars, count and size", () => {
    const renderOverflow = cy
      .stub()
      .as("renderOverflow")
      .returns(<span data-testid="custom-overflow">custom</span>);

    cy.mount(
      <AvatarGroup max={2} size={3} renderOverflow={renderOverflow}>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <Avatar name="John Doe" />
        <Avatar name="Jane Doe" />
      </AvatarGroup>,
    );

    cy.findByTestId("custom-overflow").should("exist");
    cy.get("@renderOverflow").should("have.been.calledWithMatch", {
      count: 2,
      size: 3,
    });
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
