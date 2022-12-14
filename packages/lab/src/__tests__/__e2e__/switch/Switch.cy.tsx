import { Switch } from "../../../switch";

describe("GIVEN a Switch", () => {
  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      cy.mount(<Switch defaultChecked />);
      cy.findByRole("checkbox").should("be.checked");
    });

    describe("WHEN the switch is clicked", () => {
      it("THEN should toggle the selection state", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Switch onChange={changeSpy} />);
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
      cy.mount(<Switch checked />);
      cy.findByRole("checkbox").should("be.checked");
    });

    describe("WHEN the switch is clicked", () => {
      it("THEN should call onChange and not change the selection state", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Switch onChange={changeSpy} checked={false} />);
        cy.findByRole("checkbox").should("not.be.checked");
        cy.get("@changeSpy").should("not.have.been.called");
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
      cy.mount(<Switch disabled />);
      cy.findByRole("checkbox").should("be.disabled");
    });
  });
});
