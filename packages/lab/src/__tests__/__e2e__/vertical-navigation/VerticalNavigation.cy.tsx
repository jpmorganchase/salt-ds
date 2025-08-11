import * as verticalNavigationStories from "@stories/vertical-navigation/vertical-navigation.stories";
import { composeStories } from "@storybook/react-vite";

const { Basic, CollapsibleSubmenu, WithExpandButton } = composeStories(
  verticalNavigationStories,
);

describe("Given a VerticalNavigation", () => {
  it("should render a list of links", () => {
    cy.mount(<Basic />);

    cy.findAllByRole("link").should("have.length", 5);
  });

  it("should allow navigation via mouse click", () => {
    cy.mount(<Basic />);

    cy.findByRole("link", { name: "Home" }).realClick();
    cy.findByRole("link", { name: "Home" }).should(
      "have.attr",
      "aria-current",
      "page",
    );
  });

  it("should allow navigation via keyboard", () => {
    cy.mount(<Basic />);

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Home" }).should("be.focused");
    cy.realPress("Enter");
    cy.findByRole("link", { name: "Home" }).should(
      "have.attr",
      "aria-current",
      "page",
    );
  });

  it("should allow nested collapsible items", () => {
    cy.mount(<CollapsibleSubmenu />);

    cy.findByRole("button", { name: "Products" }).should("be.visible");
    cy.findByRole("button", { name: "Products" }).should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.findByRole("button", { name: "Products" }).realClick();
    cy.findByRole("button", { name: "Products" }).should(
      "have.attr",
      "aria-expanded",
      "true",
    );

    cy.findByRole("link", { name: "Widgets" }).should("be.visible");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Widgets" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Gadgets" }).should("be.focused");
  });

  it("should support separate expand and navigate actions", () => {
    cy.mount(<WithExpandButton />);

    cy.findByRole("link", { name: "Solutions" }).should("be.visible");
    cy.findByRole("link", { name: "Solutions" }).should(
      "not.have.attr",
      "aria-expanded",
    );
    cy.findByRole("button", { name: "Solutions Subpages" }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: "Solutions Subpages" }).should(
      "have.attr",
      "aria-expanded",
      "false",
    );

    cy.findByRole("link", { name: "Solutions" }).realClick();
    cy.findByRole("link", { name: "Solutions" }).should(
      "have.attr",
      "aria-current",
      "page",
    );
    cy.findByRole("button", { name: "Solutions Subpages" }).should(
      "have.attr",
      "aria-expanded",
      "false",
    );

    cy.findByRole("button", { name: "Solutions Subpages" }).realClick();
    cy.findByRole("button", { name: "Solutions Subpages" }).should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.findByRole("link", { name: "By Industry" }).should("be.visible");

    cy.realPress("Tab");
    cy.findByRole("link", { name: "By Industry" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "By Industry Subpages" }).should(
      "be.focused",
    );
  });
});
