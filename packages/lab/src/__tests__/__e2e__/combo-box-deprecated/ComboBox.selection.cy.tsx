import { composeStories } from "@storybook/testing-react";
import * as comboBoxStories from "@stories/combobox-deprecated.stories";

const { Default, MultiSelect } = composeStories(comboBoxStories);

describe("A combo box", () => {
  it("should select the clicked item", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default onChange={changeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alaska" }).realClick();

    // input value updated
    cy.findByRole("combobox").should("have.value", "Alaska");

    // list is closed
    cy.findByRole("listbox").should("not.exist");

    // change callback invoked
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Alaska"
    );
  });

  it("should update input with the selected item", () => {
    cy.mount(<Default />);

    cy.findByRole("combobox").realClick();

    cy.realType("ama");
    cy.findByRole("combobox").should("have.value", "ama");

    cy.findByRole("option").realClick();

    cy.findByRole("combobox").should("have.value", "Alabama");

    // filter and select item 3
    cy.findByRole("combobox").realClick();
    cy.findByRole("combobox").clear();
    cy.findByRole("combobox").realType("Conn");

    cy.findByRole("combobox").should("have.value", "Conn");

    cy.findByRole("option").realClick();

    cy.findByRole("combobox").should("have.value", "Connecticut");
  });

  it("should do nothing when the selected item is clicked again", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default onChange={changeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alaska" }).realClick();

    cy.realPress("Tab");

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alaska" }).realClick();

    // input value stays the same
    cy.findByRole("combobox").should("have.value", "Alaska");

    cy.realPress("Tab");

    cy.findByRole("combobox").realClick();

    // list style stays the same
    cy.findByRole("option", { name: "Alaska" })
      .should("have.attr", "aria-checked", "true")
      .and("have.class", "uitkListItemDeprecated-highlighted");

    // change callback invoked only once
    cy.get("@changeSpy").should("have.callCount", 1);
  });

  it("should not clear the selection when input value changes", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default onChange={changeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alaska" }).realClick();

    cy.findByRole("combobox").realClick();

    // change input
    cy.realPress("Backspace");

    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .should("have.attr", "aria-checked", "true");

    cy.get("@changeSpy").should("have.callCount", 1);
  });

  it("should clear the selection when input is cleared", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default onChange={changeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alaska" }).realClick();

    cy.findByRole("combobox").realClick();

    // clear input
    cy.findByRole("combobox").clear();

    cy.findByRole("option", { name: "Alaska" })
      .should("not.have.attr", "aria-checked", "true")
      .and("not.have.class", "Highlighter-highlighted");

    // change callback invoked twice - when clicked and when selection is cleared
    cy.get("@changeSpy").should("have.callCount", 2);
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      null
    );
  });
});

describe("A multi-select combo box", () => {
  it("should select clicked items", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<MultiSelect onChange={changeSpy} />);

    cy.findByRole("textbox").realClick();

    cy.findByRole("option", { name: "Alaska" }).realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alaska"]
    );
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama", "Alaska"]
    );
    // pill group updated
    cy.findAllByTestId("pill").should("have.length", 2);
    cy.findAllByTestId("pill").eq(0).should("have.text", "Alabama");
    cy.findAllByTestId("pill").eq(1).should("have.text", "Alaska");

    // list style updated
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .should("have.attr", "aria-selected", "true");
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .should("have.attr", "aria-selected", "true");

    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .should("have.class", "uitkListItemDeprecated-highlighted");
  });

  it("should clear input when an item is selected", () => {
    cy.mount(<MultiSelect />);

    cy.findByRole("textbox").realClick();
    cy.realType("ama");
    cy.findByRole("textbox").should("have.value", "ama");

    cy.findByRole("option").realClick();

    cy.findByRole("textbox").should("not.have.value");
  });

  it("should de-select when the selected item is clicked again", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<MultiSelect onChange={changeSpy} />);

    cy.findByRole("textbox").realClick();

    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama"]
    );
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama", "Alaska"]
    );
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alaska"]
    );
    // pill group updated
    cy.findAllByTestId("pill").should("have.length", 1);
    cy.findByTestId("pill").should("have.text", "Alaska");

    // list style updated
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .should("not.have.attr", "aria-selected", "true");
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .should("have.attr", "aria-selected", "true");
  });

  it("should de-select when the selected term is removed from input", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<MultiSelect onChange={changeSpy} />);

    cy.findByRole("textbox").realClick();

    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama"]
    );
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama", "Alaska"]
    );

    cy.findAllByTestId("pill").should("have.length", 2);

    cy.findAllByTestId("pill")
      .eq(1)
      .findByRole("button", { hidden: true })
      .realClick();

    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama"]
    );

    // pill group updated
    cy.findAllByTestId("pill").should("have.length", 1);

    // list style updated
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .should("have.attr", "aria-selected", "true");
  });

  it("should de-select all the selected term when input is cleared", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<MultiSelect onChange={changeSpy} />);

    cy.findByRole("textbox").realClick();

    cy.findByRole("listbox")
      .findByRole("option", { name: "Alabama" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama"]
    );
    cy.findByRole("listbox")
      .findByRole("option", { name: "Alaska" })
      .realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["Alabama", "Alaska"]
    );

    cy.findAllByTestId("pill").should("have.length", 2);
    cy.findByRole("button", { name: "clear input" }).realClick();

    // pill group updated
    cy.findAllByTestId("pill").should("have.length", 0);
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      []
    );

    // list style updated
    cy.findByRole("listbox")
      .findAllByRole("option")
      .should("not.have.attr", "aria-selected");
  });
});
