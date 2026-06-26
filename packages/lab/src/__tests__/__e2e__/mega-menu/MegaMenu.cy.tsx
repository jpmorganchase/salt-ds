import * as megaMenuStories from "@stories/mega-menu/mega-menu.stories";
import { composeStories } from "@storybook/react-vite";

const { Baseline, DefaultOpen, Controlled } = composeStories(megaMenuStories);

describe("Given the Baseline MegaMenu example", () => {
  it("renders triggers and keeps menus closed initially", () => {
    cy.mount(<Baseline />);

    cy.findByRole("button", { name: "Solutions" }).should("exist");
    cy.findByRole("button", { name: "Services" }).should("exist");
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("opens and closes a menu on trigger click", () => {
    cy.mount(<Baseline />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("switches open state between top-level triggers", () => {
    cy.mount(<Baseline />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).should("exist");

    cy.findByRole("button", { name: "Services" }).click();
    cy.findByRole("link", { name: "Strategy" }).should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("not.exist");
  });

  it("selects an item and closes the menu", () => {
    cy.mount(<Baseline />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).click();

    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("closes on outside click", () => {
    cy.mount(<Baseline />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.get("body").click(0, 0);
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });
});

describe("Given a controlled MegaMenu", () => {
  it("keeps the panel open when the parent owns the open state", () => {
    cy.mount(<Controlled open />);
    cy.get(".saltMegaMenuPanel").should("exist");

    // The parent controls `open` and ignores the change request, so clicking
    // the trigger cannot close the panel.
    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");
  });
});

describe("Given a MegaMenu with onOpenChange", () => {
  it("fires onOpenChange when opening and closing via the trigger", () => {
    const onOpenChange = cy.stub().as("onOpenChange");
    cy.mount(<Controlled onOpenChange={onOpenChange} />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");
    cy.get("@onOpenChange").should("have.been.calledWith", true);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");
    cy.get("@onOpenChange").should("have.been.calledWith", false);
  });

  it("fires onOpenChange(false) when an item is selected", () => {
    const onOpenChange = cy.stub().as("onOpenChange");
    cy.mount(<Controlled onOpenChange={onOpenChange} />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).click();

    cy.get(".saltMegaMenuPanel").should("not.exist");
    cy.get("@onOpenChange").should("have.been.calledWith", false);
  });
});

describe("Given the DefaultOpen MegaMenu example", () => {
  it("renders its panel open from the start", () => {
    cy.mount(<DefaultOpen />);

    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("exist");
  });

  it("is accessible while open", () => {
    cy.mount(<DefaultOpen />);

    cy.findByRole("region").should("exist");
    cy.checkAxeComponent();
  });
});
