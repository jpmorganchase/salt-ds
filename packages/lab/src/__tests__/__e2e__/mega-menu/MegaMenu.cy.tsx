import * as megaMenuStories from "@stories/mega-menu/mega-menu.stories";
import { composeStories } from "@storybook/react-vite";

const {
  Default,
  WithIcons,
  WithAdornment,
  TriggerPosition,
  FullWidthContainer,
  EdgeToEdge,
  WithContent,
  WithLink,
  InSmallViewport,
  DefaultOpen,
  Placement,
} = composeStories(megaMenuStories);

describe("Given the Default MegaMenu example", () => {
  it("renders triggers and keeps menus closed initially", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "Solutions" }).should("exist");
    cy.findByRole("button", { name: "Services" }).should("exist");
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("opens and closes a menu on trigger click", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("switches open state between top-level triggers", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital banking" }).should("exist");

    cy.findByRole("button", { name: "Services" }).click();
    cy.findByRole("link", { name: "Strategy" }).should("exist");
    cy.findByRole("link", { name: "Digital banking" }).should("not.exist");
  });

  it("selects an item and closes the menu", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital banking" }).click();

    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("closes on outside click", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.get("body").click(0, 0);
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("does not persist item active state after selection", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital banking" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital banking" }).should(
      "not.have.attr",
      "aria-current",
    );
  });
});

describe("Given the DefaultOpen MegaMenu example", () => {
  it("renders its panel open from the start", () => {
    cy.mount(<DefaultOpen />);

    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByRole("link", { name: "Digital banking" }).should("exist");
  });
});

describe("Given the documented MegaMenu examples", () => {
  const examples = [
    ["Default", Default],
    ["WithIcons", WithIcons],
    ["WithAdornment", WithAdornment],
    ["TriggerPosition", TriggerPosition],
    ["FullWidthContainer", FullWidthContainer],
    ["EdgeToEdge", EdgeToEdge],
    ["WithContent", WithContent],
    ["WithLink", WithLink],
    ["InSmallViewport", InSmallViewport],
    ["Placement", Placement],
  ] as const;

  for (const [name, Example] of examples) {
    it(`${name} opens, is accessible, and dismisses on Escape`, () => {
      cy.mount(<Example />);

      cy.get(".saltMegaMenuPanel").should("not.exist");

      // Open the first trigger (only triggers carry aria-expanded).
      cy.get("[aria-expanded]").first().click();
      cy.findByRole("region").should("exist");

      cy.checkAxeComponent();

      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });
  }

  it("DefaultOpen is accessible while open", () => {
    cy.mount(<DefaultOpen />);

    cy.findByRole("region").should("exist");
    cy.checkAxeComponent();
  });
});
