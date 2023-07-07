import { ChangeEvent, useState } from "react";
import { FormField, FormFieldLabel, Button } from "@salt-ds/core";
import { MultilineInput } from "@salt-ds/lab";

describe("GIVEN an MultilineInput", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<MultilineInput defaultValue="The default value" />);
    cy.checkAxeComponent();
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("SHOULD have the given default value", () => {
      cy.mount(<MultilineInput defaultValue="The default value" />);
      cy.findByRole("textbox").should("have.value", "The default value");
    });

    describe("THEN the input is updated", () => {
      it("SHOULD call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };
        cy.mount(
          <MultilineInput
            defaultValue="The default value"
            onChange={onChange}
          />
        );
        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "new value" },
        });
      });
    });
  });

  describe("WHEN mounted as an controlled component", () => {
    it("THEN have the specified value", () => {
      cy.mount(<MultilineInput value="text value" />);
      cy.findByRole("textbox").should("have.value", "text value");
    });

    describe("THEN the user input is updated", () => {
      it("SHOULD call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");

        function ControlledMultilineInput() {
          const [value, setValue] = useState("text value");
          const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
            // React 16 backwards compatibility
            event.persist();
            setValue(event.target.value);
            changeSpy(event);
          };

          return <MultilineInput value={value} onChange={onChange} />;
        }

        cy.mount(<ControlledMultilineInput />);
        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "new value" },
        });
      });
    });
  });

  describe("WHEN an adornment is given", () => {
    it("THEN should mount with adornment", () => {
      cy.mount(
        <MultilineInput startAdornment={<>%</>} defaultValue={"Value"} />
      );
      cy.findByText("%").should("be.visible");
    });

    describe("AND adornment is a Button", () => {
      it("SHOULD mount with the button", () => {
        cy.mount(
          <MultilineInput
            startAdornment={<Button>Test</Button>}
            defaultValue={"Value"}
          />
        );
        cy.findByRole("button").should("be.visible");
        cy.findByRole("button").should("have.class", "saltButton");
      });

      it("SHOULD have the correct tab order on startAdornment", () => {
        cy.mount(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <MultilineInput
              startAdornment={<Button>Test</Button>}
              defaultValue="Value"
              data-testid="test-id-3"
            />
          </FormField>
        );

        cy.realPress("Tab");
        cy.findByRole("button").should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("textbox").should("be.focused");
      });

      it("SHOULD have the correct tab order on endAdornment", () => {
        cy.mount(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <MultilineInput
              defaultValue="Value"
              endAdornment={<Button>Test</Button>}
              data-testid="test-id-3"
            />
          </FormField>
        );

        cy.realPress("Tab");
        cy.findByRole("textbox").should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("button").should("be.focused");
      });
    });
  });

  describe("WHEN the input is required", () => {
    it("SHOULD have required attr", () => {
      cy.mount(
        <MultilineInput
          defaultValue="The default value"
          textAreaProps={{ required: true }}
        />
      );
      cy.findByRole("textbox").should("have.attr", "required");
    });
  });

  describe("WHEN disabled", () => {
    it("SHOULD mount as disabled", () => {
      cy.mount(<MultilineInput defaultValue="The default value" disabled />);
      cy.findByRole("textbox").should("be.disabled");
    });
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<MultilineInput defaultValue="The default value" disabled />);
      cy.checkAxeComponent();
    });
  });

  describe("WHEN read only", () => {
    it("SHOULD mount as read only", () => {
      cy.mount(<MultilineInput defaultValue="The default value" readOnly />);
      cy.findByRole("textbox").should("have.attr", "readonly");
    });

    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<MultilineInput defaultValue="The default value" readOnly />);
      cy.checkAxeComponent();
    });
  });
});
