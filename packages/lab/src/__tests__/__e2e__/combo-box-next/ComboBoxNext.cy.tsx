import { composeStories } from "@storybook/testing-react";
import * as comboBoxNextStories from "@stories/combo-box-next/combo-box-next.stories";

const { Default, CustomRenderer } = composeStories(comboBoxNextStories);

describe("GIVEN a Combobox", () => {
  it("SHOULD render all its items", () => {
    cy.mount(<Default />);
    cy.realPress("Tab");

    Default.args!.source!.forEach((item) => {
      cy.findByRole("option", { name: item }).should("exist");
    });
  });
  it("SHOULD render with a custom renderer", () => {
    cy.mount(<CustomRenderer />);
    cy.realPress("Tab");

    cy.findByText("Tokyo").should("exist");
    cy.findByText("Delhi").should("exist");
    cy.findByText("Shanghai").should("exist");
  });
  it("SHOULD render with a custom filter", () => {
    cy.mount(<CustomRenderer />);
    cy.findByRole("combobox").realClick();
    cy.findByText("Mexico City").should("exist");
    cy.findByText("MX").should("not.exist");
    cy.realType("MX");
    cy.findAllByRole("option").should("have.length", 1);
  });
  it("SHOULD allow passing an initial selected item", () => {
    cy.mount(<Default defaultSelected={"Brown"} />);
    cy.findByRole("combobox").realClick();

    cy.findByRole("combobox").should("have.value", "Brown");
  });

  describe("WHEN interacted with via input", () => {
    describe("WHEN no element is pre selected", () => {
      it("SHOULD open with no highlighted item", () => {
        cy.mount(<Default />);
        cy.findByRole("combobox").realClick();
        cy.findAllByRole("option").should(
          "not.have.class",
          "saltHighlighter-highlight"
        );
      });
    });
    describe("WHEN start typing in the input", () => {
      it("SHOULD filter items", () => {
        cy.mount(<Default />);

        cy.findByRole("combobox").realClick();

        // filter
        cy.realType("bl");

        cy.findAllByRole("option").should("have.length", 3);

        // clear
        cy.findByRole("combobox").clear();
        cy.findAllByRole("option").should(
          "have.length",
          Default.args!.source!.length
        );
      });

      it("SHOULD highlight matching text", () => {
        cy.mount(<Default />);

        cy.findByRole("combobox").realClick();

        cy.realType("Pin");

        cy.findAllByRole("option").should("have.length", 1);

        cy.findByText("Pin").should("have.class", "saltHighlighter-highlight");
      });
    });
  });

  it("WHEN controlled prop open is passed", () => {
    it("SHOULD be able to control the open property of portal", () => {
      cy.mount(<Default PortalProps={{ open: true }} />);
      Default.args!.source!.forEach((item) => {
        cy.findByRole("option", { name: item }).should("exist");
      });
    });
  });
  // TODO: check we fix UITK bugs
  // When combobox is nested inside an overlay (or a similar component? drawer?)
});
