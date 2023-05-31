import { ChangeEvent, useState } from "react";
import { Input, FormField, FormFieldLabel } from "@salt-ds/core";

describe("GIVEN an Input", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Input defaultValue="The default value" />);
    cy.checkAxeComponent();
  });

  describe("WHEN cy.mounted as an uncontrolled component", () => {
    it("THEN it should cy.mount with the specified defaultValue", () => {
      cy.mount(<Input defaultValue="The default value" />);
      cy.findByRole("textbox").should("have.value", "The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };
        cy.mount(
          <Input defaultValue="The default value" onChange={onChange} />
        );
        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "new value" },
        });
      });
    });
  });

  describe("WHEN cy.mounted as an controlled component", () => {
    it("THEN it should cy.mount with the specified value", () => {
      cy.mount(<Input value="text value" />);
      cy.findByRole("textbox").should("have.value", "text value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");

        function ControlledInput() {
          const [value, setValue] = useState("text value");
          const onChange = (event: ChangeEvent<HTMLInputElement>) => {
            // React 16 backwards compatibility
            event.persist();
            setValue(event.target.value);
            changeSpy(event);
          };

          return <Input value={value} onChange={onChange} />;
        }

        cy.mount(<ControlledInput />);
        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "new value" },
        });
      });
    });
  });

  describe("WHEN the Input is disabled", () => {
    it("THEN should cy.mount disabled", () => {
      cy.mount(<Input defaultValue="The default value" disabled />);
      cy.findByRole("textbox").should("be.disabled");
    });
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<Input defaultValue="The default value" disabled />);
      cy.checkAxeComponent();
    });
  });

  describe("WHEN the Input is read only", () => {
    it("THEN should cy.mount read only", () => {
      cy.mount(<Input defaultValue="The default value" readOnly />);
      cy.findByRole("textbox").should("have.attr", "readonly");
    });

    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<Input defaultValue="The default value" readOnly />);
      cy.checkAxeComponent();
    });

    describe("AND empty", () => {
      it("THEN should cy.mount an emdash by default", () => {
        cy.mount(<Input readOnly />);
        cy.findByRole("textbox").should("have.value", "—");
      });

      it("THEN should cy.mount an custom marker", () => {
        cy.mount(<Input emptyReadOnlyMarker="#" readOnly />);
        cy.findByRole("textbox").should("have.value", "#");
      });
    });
  });

  describe("WHEN used in Formfield", () => {
    describe("AND disabled", () => {
      it("THEN input within should be disabled", () => {
        cy.mount(
          <FormField disabled>
            <FormFieldLabel>Disabled form field</FormFieldLabel>
            <Input defaultValue="Value" />
          </FormField>
        );
        cy.wait(2000);
        cy.findByLabelText("Disabled form field").should(
          "have.attr",
          "disabled"
        );
      });
    });

    describe("AND readonly", () => {
      it("THEN input within should be readonly", () => {
        cy.mount(
          <FormField readOnly>
            <FormFieldLabel>Readonly form field</FormFieldLabel>
            <Input defaultValue="Value" />
          </FormField>
        );
        cy.wait(2000);
        cy.findByLabelText("Readonly form field").should(
          "have.attr",
          "readonly"
        );
      });
    });
  });
});
