import { QueryInput, QueryInputCategory } from "@jpmorganchase/uitk-lab";
import { Button } from "@jpmorganchase/uitk-core";

const fakeCategories: QueryInputCategory[] = [
  { name: "A", values: ["A1", "A2", "A3"] },
  { name: "B", values: ["B1", "B2", "B3", "B4"] },
  { name: "C", values: ["C1", "C2", "C3", "C4", "C5"] },
];

describe("GIVEN a QueryInput component", () => {
  it("WHEN expanded SHOULD render categories/values", () => {
    cy.mount(<QueryInput categories={fakeCategories} />);
    cy.findByRole("textbox").focus();
    cy.findByRole("listbox").should("be.visible");
    cy.findByTestId("category-list").findByText("A").should("exist");
    cy.findByTestId("category-list").findByText("B").should("exist");
    cy.findByTestId("category-list").findByText("C").should("exist");
  });

  it("WHEN category clicked, SHOULD render the values list", () => {
    cy.mount(<QueryInput categories={fakeCategories} />);
    cy.findByRole("textbox").focus();
    // // User clicks category B, its values are expected to appear
    cy.findByTestId("category-list").findByText("B").realHover().realClick();
    cy.findByTestId("value-list").should("be.visible");
    cy.findByText("B1").should("exist");
    cy.findByText("B4").should("exist");
  });

  it("WHEN value list back clicked, SHOULD render the categories list", () => {
    cy.mount(<QueryInput categories={fakeCategories} />);
    cy.findByRole("textbox").focus();
    cy.findByTestId("category-list").findByText("B").realHover().realClick();
    // // User clicks the back button, the list of categories is expected to be visible
    cy.findByTestId("value-list").findByText("B").realClick();
    cy.findByTestId("category-list").should("be.visible");
  });

  it("WHEN user types in a query SHOULD render the search list", () => {
    cy.mount(<QueryInput categories={fakeCategories} />);
    cy.findByRole("textbox").focus();
    cy.findByRole("textbox").realType("2");
    cy.findByTestId("search-list").should("be.visible");
  });

  it("WHEN autoClose is set to true SHOULD auto close", () => {
    cy.mount(<QueryInput categories={fakeCategories} autoClose />);
    cy.findByRole("textbox").focus();
    cy.findByTestId("category-list").findByText("C").realHover().realClick();
    cy.findByTestId("value-list").should("be.visible");
    cy.findByText("C2").realHover().realClick();
    cy.findByTestId("value-list").should("not.exist");
  });

  it("WHEN none of the values match the query SHOULD create new tokens", () => {
    cy.mount(<QueryInput categories={fakeCategories} />);
    cy.findByRole("textbox").focus();
    cy.findByRole("textbox").realType("defg");
    cy.realPress("Enter");
    cy.findAllByTestId("pill").should("have.length", 1);
    cy.findAllByTestId("pill").eq(0).should("have.text", "defg");
  });

  describe("WHEN Tab is pressed", () => {
    describe("AND focus is on the text edit", () => {
      beforeEach(() => {
        cy.mount(<QueryInput categories={fakeCategories} />);
        cy.findByRole("textbox").focus();
      });

      //   it("AND there is no text in the input THEN focus should move to the X button", () => {
      //     cy.realPress("Tab");
      //     cy.findAllByTestId("clear-button").should("be.focused");
      //   });

      it("AND there is text in the input THEN the text should be tokenized and X button should be focused", () => {
        cy.findByRole("textbox").realType("ABCD");
        cy.realPress("Tab");
        cy.findAllByTestId("pill").should("have.length", 1);
        cy.findAllByTestId("pill").eq(0).should("have.text", "ABCD");
        cy.findAllByTestId("clear-button").should("be.focused");
      });
    });

    describe("AND focus is on the X button", () => {
      it("THEN focus should move to the boolean selector", () => {
        cy.mount(<QueryInput categories={fakeCategories} />);
        cy.findByRole("textbox").focus();
        // cy.realPress("Tab");
        // cy.findAllByTestId("clear-button").should("be.focused");
        cy.realPress("Tab");
        cy.findAllByRole("radio").eq(0).should("be.focused");
      });
    });

    it("AND focus is on a menu item THEN focus should move to the X button without making a selection", () => {
      cy.mount(<QueryInput categories={fakeCategories} />);
      cy.findByRole("textbox").focus();
      cy.findByRole("textbox").realType("2");
      cy.realPress("ArrowDown");
      cy.realPress("Tab");
      cy.findAllByTestId("clear-button").should("be.focused");
    });
  });

  describe("WHEN Shift+Tab is pressed", () => {
    it("AND focus is on the text edit THEN focus moves to the previous component", () => {
      cy.mount(
        <div>
          <Button data-testid="previous-control">PreviousControl</Button>
          <QueryInput categories={fakeCategories} />
        </div>
      );
      cy.findByRole("textbox").focus();
      cy.realPress(["Shift", "Tab"]);
      cy.findByTestId("previous-control").should("be.focused");
    });
  });
});
