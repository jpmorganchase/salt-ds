import { composeStories } from "@storybook/testing-react";
import * as comboBoxStories from "@stories/combobox-deprecated.stories";

const {
  Default,
  MultiSelectWithInitialSelection,
  WithInitialSelection,
  MultiSelect,
  ItemRenderer,
  WithCustomizedFilter,
} = composeStories(comboBoxStories);

describe("A combo box", () => {
  it("should render all its items", () => {
    cy.mount(<Default />);

    cy.realPress("Tab");

    Default.args!.source!.forEach((item) => {
      cy.findByRole("option", { name: item }).should("exist");
    });
  });

  it("should render with a customized id", () => {
    cy.mount(<Default id="my-combo-box" />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("combobox").should("have.attr", "id", "my-combo-box-input");
    cy.findByRole("listbox").should("have.attr", "id", "my-combo-box-list");
    cy.findAllByRole("option").then((items) => {
      Array.from(items).forEach((item, index) => {
        cy.wrap(item).should(
          "have.attr",
          "id",
          `my-combo-box-list-item-${index}`
        );
      });
    });
  });

  it('should render with a customized "itemToString"', () => {
    cy.mount(<ItemRenderer />);

    cy.findByRole("combobox").realClick();

    cy.findByText("Tokyo").should("exist");
    cy.findByText("Delhi").should("exist");
    cy.findByText("Shanghai").should("exist");
  });

  it('should allow setting "initialSelectedItem"', () => {
    cy.mount(<WithInitialSelection />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("combobox").should("have.value", "Brown");
    cy.findAllByRole("option").should("have.length", 1);
    cy.findByRole("option").should(
      "have.class",
      "uitkListItemDeprecated-selected"
    );
  });

  it('should become a multi-select combo box if "initialSelectedItem" is an array', () => {
    cy.mount(
      <Default
        initialSelectedItem={[
          Default.args!.source![0],
          Default.args!.source![1],
        ]}
      />
    );

    cy.findByRole("textbox").realClick();

    // multi-select input should be empty
    cy.findByRole("textbox").should("not.have.value");

    // selection is presented as a group of pills
    cy.findAllByTestId("pill").should("have.length", 2);
    cy.findAllByTestId("pill")
      .eq(0)
      .should("have.text", Default.args!.source![0]);
    cy.findAllByTestId("pill")
      .eq(1)
      .should("have.text", Default.args!.source![1]);

    // and they should be "selected" in the list
    cy.findByRole("listbox")
      .findByRole("option", { name: Default.args!.source![0] })
      .should("have.attr", "aria-selected", "true");

    cy.findByRole("listbox")
      .findByRole("option", { name: Default.args!.source![1] })
      .should("have.attr", "aria-selected", "true");
  });

  it("should allow customized item filter", () => {
    cy.mount(<WithCustomizedFilter />);

    cy.findByRole("combobox").realClick();
    cy.realType("as");

    cy.findByRole("listbox").should("not.exist");
    cy.findAllByRole("option").should("have.length", 0);
  });

  describe("when start typing in the input", () => {
    it("should filter items", () => {
      cy.mount(<Default />);

      cy.findByRole("combobox").realClick();

      // filter
      cy.realType("ska");

      cy.findAllByRole("option").should("have.length", 2);

      // clear
      cy.findByRole("combobox").clear();
      cy.findAllByRole("option").should(
        "have.length",
        Default.args!.source!.length
      );
    });

    it("should highlight matching text", () => {
      cy.mount(<Default />);

      cy.findByRole("combobox").realClick();

      cy.realType("Connec");

      cy.findAllByRole("option").should("have.length", 1);

      cy.findByText("Connec").should("have.class", "uitkHighlighter-highlight");
    });
  });
});

describe("A multi-select combo box", () => {
  // Should pass - check implementation
  it.skip("should render with a customized id", () => {
    cy.mount(<MultiSelectWithInitialSelection id="my-combo-box" />);

    cy.findByRole("textbox").realClick();

    cy.findByRole("textbox").should(
      "have.attr",
      "id",
      "my-combo-box-input-input"
    );
    cy.findByRole("listbox").should("have.attr", "id", "my-combo-box-list");

    cy.findAllByTestId("pill").then((items) => {
      Array.from(items).forEach((item, index) => {
        cy.wrap(item).should(
          "have.attr",
          "id",
          `my-combo-box-input-pill-${index}`
        );
      });
    });

    cy.findByRole("listbox")
      .findAllByRole("option")
      .then((items) => {
        Array.from(items).forEach((item, index) => {
          cy.wrap(item).should(
            "have.attr",
            "id",
            `my-combo-box-list-item-${index}`
          );
        });
      });
  });

  it("should allow customized delimiter", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(<MultiSelect delimiter="|" onChange={changeSpy} />);

    cy.findByRole("textbox").realClick();
    cy.findByRole("textbox").paste("Alabama| Alaska");

    cy.findAllByTestId("pill").should("have.length", 2);
    cy.findAllByTestId("pill").eq(0).should("have.text", "Alabama");
    cy.findAllByTestId("pill").eq(1).should("have.text", "Alaska");

    // list style updated
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .should("have.attr", "aria-selected", "true");
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .should("have.attr", "aria-selected", "true");

    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama", "Alaska"]
    );
  });
});
