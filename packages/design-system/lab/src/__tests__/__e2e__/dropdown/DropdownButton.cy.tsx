import { DropdownButton } from "@jpmorganchase/uitk-lab";

describe("GIVEN a DropdownButton component", () => {
  describe("WHEN the button renders", () => {
    it("THEN it should render correct icon and label", () => {
      cy.mount(<DropdownButton label="button" />);
      cy.findByRole("option").should(
        "have.class",
        "uitkDropdownButton-buttonLabel"
      );
      cy.get(".uitkDropdownButton-icon").within(() => {
        cy.findByTestId("ChevronDownIcon").should("exist");
      });
    });
  });

  describe("WHEN keyboard event is fired", () => {
    it("THEN onKeyDown onKeyUp is called", () => {
      const keyDownSpy = cy.stub().as("keyDownSpy");
      const keyUpSpy = cy.stub().as("keyUpSpy");
      cy.mount(
        <DropdownButton
          id="test-button"
          label="button"
          onKeyDown={keyDownSpy}
          onKeyUp={keyUpSpy}
        />
      );
      cy.get("#test-button").focus();
      cy.realPress("B");
      cy.get("@keyDownSpy").should("have.callCount", 1);
      cy.get("@keyUpSpy").should("have.callCount", 1);
    });
  });
});
