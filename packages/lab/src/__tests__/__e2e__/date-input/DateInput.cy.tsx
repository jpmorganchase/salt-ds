import { DateInput } from "@salt-ds/lab";
import { ChangeEvent } from "react";

describe("GIVEN an DateInput", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<DateInput defaultValue="01 Feb 2000" />);
    cy.checkAxeComponent();
  });
  describe("WHEN cy.mounted as an uncontrolled component", () => {
    it("THEN it should cy.mount with the specified defaultValue", () => {
      cy.mount(<DateInput defaultValue="01 Feb 2000" />);
      cy.findByRole("textbox").should("have.value", "01 Feb 2000");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };
        cy.mount(<DateInput defaultValue="01 Feb 2000" onChange={onChange} />);
        cy.findByRole("textbox").click().clear().type("02-feb-2000");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "02-feb-2000" },
        });
      });
      it("THEN should format a valid date with a different format on blur", () => {
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
        };
        cy.mount(<DateInput defaultValue="01 jan 2000" onChange={onChange} />);
        cy.findByRole("textbox").click().clear().type("02-feb-2000");
        cy.findByRole("textbox").blur();
        cy.findByRole("textbox").should("have.value", "02 Feb 2000");
      });
      it("THEN should error and not format invalid dates on blur", () => {
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
        };
        cy.mount(<DateInput defaultValue="01 jan 2000" onChange={onChange} />);
        cy.findByRole("textbox").click().clear().type("01 0ct 2000");
        cy.findByRole("textbox").blur();
        cy.findByRole("textbox").should("have.value", "01 0ct 2000");
      });
    });
  });
});
