import { composeStories } from "@storybook/testing-react";
import * as comboBoxStories from "@stories/combobox-deprecated.stories";

const {
  Default,
  MultiSelectWithInitialSelection,
  MultiSelectWithFormField,
  WithInitialSelection,
  WithFormField,
  MultiSelect,
  MultiSelectWithFormFieldWithInitialSelection,
} = composeStories(comboBoxStories);

describe("A combo box", () => {
  it("should assign correct role to the input", () => {
    const testId = "my-input";

    cy.mount(
      <Default InputProps={{ inputProps: { "data-testid": testId } as any }} />
    );

    cy.findByTestId(testId).should("have.attr", "role", "combobox");
  });

  it("should have correct aria-expanded when it is opened and closed", () => {
    cy.mount(<Default />);

    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
    cy.findByRole("combobox").realClick();
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
  });

  describe("when navigating using keyboard", () => {
    const mockId = "my-combo-box";

    // TODO - fix
    it.skip("should assign aria-activedescendant only on focus", () => {
      cy.mount(<WithInitialSelection id={mockId} />);

      cy.findByRole("combobox").should(
        "not.have.attr",
        "aria-activedescendant"
      );
      cy.realPress("Tab");

      cy.findByRole("combobox").should(
        "have.attr",
        "aria-activedescendant",
        `${mockId}-list-item-0`
      );
    });

    it("should remove aria-activedescendant when navigating through input", () => {
      cy.mount(<Default />);

      cy.realPress("Tab");
      cy.realType("A");
      cy.realPress("ArrowDown");

      cy.findByRole("combobox").should("have.attr", "aria-activedescendant");

      cy.realPress("ArrowLeft");

      cy.findByRole("combobox").should(
        "not.have.attr",
        "aria-activedescendant"
      );
    });

    (["ArrowUp", "ArrowDown"] as const).forEach((key) => {
      it(`should re-attach aria-activedescendant when navigating through list using ${key} key`, () => {
        cy.mount(<Default id={mockId} />);

        // first time highlight
        cy.realPress("Tab");
        cy.realType("A");
        cy.realPress("ArrowDown");

        /* TODO When quickSelection is true, the focus will move to list-item-1 */
        /* Update the test when quickSelection is implemented */
        // cy.findByRole("combobox").should(
        //   "have.attr",
        //   "aria-activedescendant",
        //   `${mockId}-list-item-0`
        // );

        // // navigate through input
        cy.realPress("ArrowLeft");

        cy.findByRole("combobox").should(
          "not.have.attr",
          "aria-activedescendant"
        );

        // // second time highlight
        cy.realPress(key);

        cy.findByRole("combobox").should(
          "have.attr",
          "aria-activedescendant",
          `${mockId}-list-item-${key === "ArrowDown" ? "1" : "0"}`
        );
      });
    });
  });

  describe("when used inside of <FormField/>", () => {
    it("should inherit correct aria-required value", () => {
      cy.mount(<WithFormField required />);

      cy.findByRole("combobox").should("have.attr", "aria-required", "true");
    });
  });
});

describe("A multi-select combo box", () => {
  it("should assign correct role and role description to the input", () => {
    const testId = "my-input";

    cy.mount(
      <MultiSelect
        InputProps={{
          InputProps: { inputProps: { "data-testid": testId } as any },
        }}
      />
    );

    cy.findByTestId(testId)
      .should("have.attr", "role", "textbox")
      .and("have.attr", "aria-roledescription", "MultiSelect Combobox");
  });

  it("should assign correct role and role description to the expand input button", () => {
    cy.mount(<MultiSelectWithInitialSelection />);

    cy.findByRole("button").should(
      "have.attr",
      "aria-roledescription",
      "Expand combobox button"
    );
  });

  describe("when navigating using keyboard", () => {
    const mockId = "my-combo-box";

    //TODO fix
    it.skip("should have no aria-activedescendant on focus", () => {
      cy.mount(<MultiSelectWithInitialSelection />);

      cy.realPress("Tab");
      cy.findByRole("textbox").should("not.have.attr", "aria-activedescendant");
    });

    it("should attach correct aria-activedescendant when navigating through list and pills", () => {
      cy.mount(<MultiSelectWithInitialSelection id={mockId} />);

      cy.realPress("Tab");
      cy.realType("A");
      cy.realPress("ArrowDown");
      cy.findByRole("textbox").should(
        "have.attr",
        "aria-activedescendant",
        `${mockId}-list-item-1`
      );
      cy.realPress("Home");
      cy.realPress("ArrowLeft");

      cy.findByRole("textbox").should(
        "have.attr",
        "aria-activedescendant",
        `${mockId}-input-pill-4`
      );
    });

    it("should re-attach aria-activedescendant when navigating through pills", () => {
      cy.mount(<MultiSelectWithInitialSelection id={mockId} />);

      cy.realPress("Tab");
      cy.realType("A");
      cy.realPress("Home");

      // first time highlight
      cy.realPress("ArrowLeft");
      cy.findByRole("textbox").should(
        "have.attr",
        "aria-activedescendant",
        `${mockId}-input-pill-4`
      );

      // leave pills
      cy.realPress("ArrowRight");
      cy.findByRole("textbox").should("not.have.attr", "aria-activedescendant");

      // second time highlight
      cy.realPress("ArrowLeft");
      cy.realPress("ArrowLeft");
      cy.findByRole("textbox").should(
        "have.attr",
        "aria-activedescendant",
        `${mockId}-input-pill-4`
      );
    });

    (["ArrowUp", "ArrowDown"] as const).forEach((key) => {
      it(`should re-attach aria-activedescendant when navigating through list using ${key} key`, () => {
        cy.mount(<MultiSelectWithInitialSelection id={mockId} />);

        // first time highlight
        cy.realPress("Tab");
        cy.realType("A");
        cy.realPress("ArrowDown");

        // navigate through input
        cy.realPress("Home");
        cy.realPress("ArrowLeft");
        cy.findByRole("textbox").should(
          "have.attr",
          "aria-activedescendant",
          `${mockId}-input-pill-4`
        );

        // second time highlight
        cy.realPress(key);
        // TODO - fix
        // cy.findByRole("textbox").should(
        //   "have.attr",
        //   "aria-activedescendant",
        //   `${mockId}-list-item-${key === "ArrowDown" ? "2" : "0"}`
        // );
      });
    });
  });

  describe("when used inside of <FormField/>", () => {
    it("should inherit correct aria-required value", () => {
      cy.mount(<MultiSelectWithFormField required />);

      cy.findByRole("textbox").should("have.attr", "aria-required", "true");
    });

    // TODO fix
    it.skip("should assign correct aria-labelledby to the input and the list", () => {
      const mockId = "my-combo-box";
      const mockInputId = `${mockId}-input-input`;
      const mockLabelId = `${mockId}-input-label`;
      cy.mount(
        <MultiSelectWithFormFieldWithInitialSelection
          id={mockId}
          LabelProps={{ id: mockLabelId }}
        />
      );

      cy.realPress("Tab");
      cy.findByRole("textbox").should("have.attr", "aria-label", "5 items");
      cy.findByRole("textbox").should(
        "have.attr",
        "aria-labelledby",
        `${mockLabelId} ${mockInputId}`
      );
    });

    it("should assign correct aria-labelledby to the expand input button", () => {
      const mockId = "my-combo-box";
      const mockInputId = `${mockId}-input-input`;
      const mockLabelId = `${mockId}-input-label`;

      cy.mount(
        <MultiSelectWithFormFieldWithInitialSelection
          id={mockId}
          LabelProps={{ id: mockLabelId }}
        />
      );

      cy.findByRole("button").should(
        "have.attr",
        "aria-labelledby",
        `${mockLabelId} ${mockInputId}`
      );
    });
  });
});
