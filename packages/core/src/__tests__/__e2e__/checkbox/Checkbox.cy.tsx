import { Checkbox } from "@jpmorganchase/uitk-core";

describe("GIVEN a Checkbox", () => {
  describe("WHEN in an indeterminate state", () => {
    it("THEN should have aria-checked set to `mixed`", () => {
      cy.mount(<Checkbox indeterminate />);
      cy.findByRole("checkbox").should("have.attr", "aria-checked", "mixed");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      cy.mount(<Checkbox defaultChecked />);
      cy.findByRole("checkbox").should("be.checked");
    });

    describe("WHEN the checkbox is clicked", () => {
      it("THEN should toggle the selection state", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Checkbox onChange={changeSpy} value="test" />);
        cy.findByRole("checkbox").should("not.be.checked");
        cy.get("@changeSpy").should("not.have.been.called");
        cy.findByRole("checkbox").realClick();
        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          true
        );
        cy.findByRole("checkbox").should("be.checked");
        cy.findByRole("checkbox").realClick();
        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          false
        );
        cy.findByRole("checkbox").should("not.be.checked");
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should be checked if checked is true", () => {
      cy.mount(<Checkbox checked />);
      cy.findByRole("checkbox").should("be.checked");
    });

    describe("WHEN the checkbox is clicked", () => {
      it("THEN should call onChange and not change the selection state", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(
          <Checkbox onChange={changeSpy} checked={false} value="test" />
        );
        cy.findByRole("checkbox").should("not.be.checked");
        cy.get("@changeSpy").should("have.not.been.called");
        cy.findByRole("checkbox").realClick();
        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          true
        );
        cy.findByRole("checkbox").should("not.be.checked");
      });
    });
  });

  describe("WHEN disabled", () => {
    it("THEN should have the disabled attribute applied", () => {
      cy.mount(<Checkbox disabled />);
      cy.findByRole("checkbox").should("be.disabled");
    });
  });
});
