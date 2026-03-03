import { Button, FormField, FormFieldLabel, Input } from "@salt-ds/core";
import * as inputStories from "@stories/input/input.stories";
import { composeStories } from "@storybook/react";
import { type ChangeEvent, useState } from "react";

const { WithFormField } = composeStories(inputStories);

describe("GIVEN an Input", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Input defaultValue="The default value" />);
    cy.checkAxeComponent();
  });

  it("SHOULD support data attribute on inputProps", () => {
    cy.mount(
      <Input inputProps={{ "data-testId": "customInput" }} value="value" />,
    );
    cy.findByTestId("customInput").should("have.value", "value");
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
          <Input defaultValue="The default value" onChange={onChange} />,
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

  describe("WHEN an adornment is given", () => {
    it("THEN should cy.mount with the adornment", () => {
      cy.mount(<Input startAdornment={<>%</>} defaultValue={"Value"} />);
      cy.findByText("%").should("be.visible");
    });

    describe("AND adornment is a Button", () => {
      it("THEN should cy.mount with the adornment", () => {
        cy.mount(
          <Input
            startAdornment={<Button>Test</Button>}
            defaultValue={"Value"}
          />,
        );
        cy.findByRole("button").should("be.visible");
        cy.findByRole("button").should("have.class", "saltButton");
      });

      it("THEN should have the correct tab order on startAdornment", () => {
        cy.mount(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <Input
              startAdornment={<Button>Test</Button>}
              defaultValue="Value"
              data-testid="test-id-3"
            />
          </FormField>,
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
            <Input
              defaultValue="Value"
              endAdornment={<Button>Test</Button>}
              data-testid="test-id-3"
            />
          </FormField>,
        );

        cy.realPress("Tab");
        cy.findByRole("textbox").should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("button").should("be.focused");
      });
    });
  });

  describe("WHEN the Input is required", () => {
    it("THEN should have required attr", () => {
      cy.mount(
        <Input
          defaultValue="The default value"
          inputProps={{ required: true }}
        />,
      );
      cy.findByRole("textbox").should("have.attr", "required");
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
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Disabled form field").should(
          "have.attr",
          "disabled",
        );
      });
    });

    describe("AND is required", () => {
      it("THEN input within should be required", () => {
        cy.mount(
          <FormField necessity="required">
            <FormFieldLabel>Form Field</FormFieldLabel>
            <Input defaultValue="Value" />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Form Field (Required)").should(
          "have.attr",
          "required",
        );
      });
    });

    describe("AND is required with asterisk", () => {
      it("THEN input within should be required", () => {
        cy.mount(
          <FormField necessity="asterisk">
            <FormFieldLabel>Form Field</FormFieldLabel>
            <Input defaultValue="Value" />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Form Field *").should("have.attr", "required");
      });
    });

    describe("AND is optional", () => {
      it("THEN input within should not be required", () => {
        cy.mount(
          <FormField necessity="optional">
            <FormFieldLabel>Form Field</FormFieldLabel>
            <Input defaultValue="Value" />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Form Field (Optional)").should(
          "not.have.attr",
          "required",
        );
      });
    });

    describe("AND readonly", () => {
      it("THEN input within should be readonly", () => {
        cy.mount(
          <FormField readOnly>
            <FormFieldLabel>Readonly form field</FormFieldLabel>
            <Input defaultValue="Value" />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Readonly form field").should(
          "have.attr",
          "readonly",
        );
      });
    });
  });

  it("should have form field support", () => {
    cy.mount(<WithFormField />);
    cy.findByRole("textbox").should("have.accessibleName", "Username");
    cy.findByRole("textbox").should(
      "have.accessibleDescription",
      "This should be more than 3 characters long.",
    );

    cy.findByText("Username").realClick();
    cy.findByRole("textbox").should("be.focused");
  });

  it("should not have empty aria-describedby or aria-labelledby attributes if used outside a formfield", () => {
    cy.mount(<Input />);

    cy.findByRole("textbox").should("not.have.attr", "aria-describedby");
    cy.findByRole("textbox").should("not.have.attr", "aria-labelledby");
  });
});
