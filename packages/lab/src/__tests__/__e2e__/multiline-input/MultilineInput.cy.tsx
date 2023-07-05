import { ChangeEvent, useState } from "react";
import { FormField, FormFieldLabel, Button } from "@salt-ds/core";
import { MultilineInput } from "@salt-ds/lab";

describe("GIVEN an MultilineInput", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<MultilineInput defaultValue="The default value" />);
    cy.checkAxeComponent();
  });

  describe("WHEN cy.mounted as an uncontrolled component", () => {
    it("THEN it should cy.mount with the specified defaultValue", () => {
      cy.mount(<MultilineInput defaultValue="The default value" />);
      cy.findByRole("textbox").should("have.value", "The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
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

  describe("WHEN cy.mounted as an controlled component", () => {
    it("THEN it should cy.mount with the specified value", () => {
      cy.mount(<MultilineInput value="text value" />);
      cy.findByRole("textbox").should("have.value", "text value");
    });

    describe("WHEN the user input is updated", () => {
      it("THEN should call onChange with the new value", () => {
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
    it("THEN should cy.mount with the adornment", () => {
      cy.mount(
        <MultilineInput startAdornment={<>%</>} defaultValue={"Value"} />
      );
      cy.findByText("%").should("be.visible");
    });

    describe("AND adornment is a Button", () => {
      it("THEN should cy.mount with the adornment", () => {
        cy.mount(
          <MultilineInput
            startAdornment={<Button>Test</Button>}
            defaultValue={"Value"}
          />
        );
        cy.findByRole("button").should("be.visible");
        cy.findByRole("button").should("have.class", "saltButton");
      });

      it("THEN should have the correct tab order on startAdornment", () => {
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

      it("THEN should have the correct tab order on endAdornment", () => {
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

  describe("WHEN the MultilineInput is required", () => {
    it("THEN should have required attr", () => {
      cy.mount(
        <MultilineInput
          defaultValue="The default value"
          textAreaProps={{ required: true }}
        />
      );
      cy.findByRole("textbox").should("have.attr", "required");
    });
  });

  describe("WHEN the MultilineInput is disabled", () => {
    it("THEN should cy.mount disabled", () => {
      cy.mount(<MultilineInput defaultValue="The default value" disabled />);
      cy.findByRole("textbox").should("be.disabled");
    });
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<MultilineInput defaultValue="The default value" disabled />);
      cy.checkAxeComponent();
    });
  });

  describe("WHEN the MultilineInput is read only", () => {
    it("THEN should cy.mount read only", () => {
      cy.mount(<MultilineInput defaultValue="The default value" readOnly />);
      cy.findByRole("textbox").should("have.attr", "readonly");
    });

    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<MultilineInput defaultValue="The default value" readOnly />);
      cy.checkAxeComponent();
    });

    describe("AND empty", () => {
      it("THEN should cy.mount an emdash by default", () => {
        cy.mount(<MultilineInput readOnly />);
        cy.findByRole("textbox").should("have.value", "—");
      });

      it("THEN should cy.mount an custom marker", () => {
        cy.mount(<MultilineInput emptyReadOnlyMarker="#" readOnly />);
        cy.findByRole("textbox").should("have.value", "#");
      });
    });
  });
});
