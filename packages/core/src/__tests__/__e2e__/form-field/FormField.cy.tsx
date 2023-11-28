import {
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
  Tooltip,
  Checkbox,
  RadioButton,
  Button,
} from "@salt-ds/core";

const MockChildren = () => {
  return (
    <>
      <FormFieldLabel>Label</FormFieldLabel>
      <div />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </>
  );
};

describe("GIVEN a FormField", () => {
  describe("WHEN FormFieldLabel is provided", () => {
    it("THEN the label is rendered", () => {
      cy.mount(
        <FormField>
          <MockChildren />
        </FormField>
      );

      cy.findByText("Label").should("exist");
    });
  });

  describe("WHEN FormFieldHelperText is provided", () => {
    it("THEN the helper text is rendered", () => {
      cy.mount(
        <FormField>
          <MockChildren />
        </FormField>
      );

      cy.findByText("Helper text").should("exist");
    });
  });

  describe("WHEN an id is provided", () => {
    it("THEN the label and helper text should have the corresponding ids", () => {
      cy.mount(
        <FormField id={"test-id"}>
          <MockChildren />
        </FormField>
      );

      cy.findByText("Label").should("have.attr", "id", "label-test-id");
      cy.findByText("Helper text").should(
        "have.attr",
        "id",
        "helperText-test-id"
      );
    });
  });

  describe("WHEN disabled", () => {
    it("THEN inner components should have disabled set from useFormFieldProps.a11yProps", () => {
      cy.mount(
        <FormField disabled>
          <MockChildren />
        </FormField>
      );
      cy.findByText("Label").should("have.class", "saltText-disabled");
      cy.findByText("Helper text").should("have.class", "saltText-disabled");
    });
  });

  describe("WHEN has error validationStatus", () => {
    it("THEN StatusIndicator should show within Helper Text", () => {
      cy.mount(
        <FormField validationStatus="error">
          <MockChildren />
        </FormField>
      );

      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-error"
      );
    });

    describe("AND is disabled", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormField disabled validationStatus="error">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltFormFieldHelperText")
          .find(".saltStatusIndicator")
          .should("not.exist");
      });
    });

    describe("AND is readonly", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormField readOnly validationStatus="error">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltFormFieldHelperText")
          .find(".saltStatusIndicator")
          .should("not.exist");
      });
    });

    describe("OR is success state", () => {
      it("THEN the success variant should show", () => {
        cy.mount(
          <FormField validationStatus="success">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltStatusIndicator").should(
          "have.class",
          "saltStatusIndicator-success"
        );
      });
    });

    describe("OR is warning state", () => {
      it("THEN the warning variant should show", () => {
        cy.mount(
          <FormField validationStatus="warning">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltStatusIndicator").should(
          "have.class",
          "saltStatusIndicator-warning"
        );
      });
    });
  });

  describe("WITH a nested Input", () => {
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Input defaultValue="Value" data-testid="test-id-1" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      );

      cy.findByLabelText("Label").focus();
      cy.checkAxeComponent();
    });

    describe("WITH a necessity label", () => {
      it("THEN required should display if opted", () => {
        cy.mount(
          <FormField necessity="required">
            <FormFieldLabel>Label</FormFieldLabel>
            <Input defaultValue="Value" />
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </FormField>
        );

        cy.findByText("(Required)").should("exist");
        cy.findByLabelText("Label (Required)").should("have.attr", "required");
      });

      it("THEN optional should display if opted", () => {
        cy.mount(
          <FormField necessity="optional">
            <FormFieldLabel>Label</FormFieldLabel>
            <Input defaultValue="Value" />
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </FormField>
        );

        cy.findByText("(Optional)").should("exist");
      });

      it("THEN asterisk should display if opted", () => {
        cy.mount(
          <FormField necessity="asterisk">
            <FormFieldLabel>Label</FormFieldLabel>
            <Input defaultValue="Value" />
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </FormField>
        );

        cy.findByLabelText("Label *").should("have.attr", "required");
      });
    });

    describe("AND has tooltip helper text", () => {
      it("THEN tooltip should be visible on input hover", () => {
        cy.mount(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <Tooltip content="Helper text">
              <Input defaultValue="Value" data-testid="test-id-2" />
            </Tooltip>
          </FormField>
        );

        cy.findByLabelText("Label").realHover();
        cy.findByRole("tooltip").should("be.visible");
      });

      it("THEN should have the corresponding id", () => {
        cy.mount(
          <FormField id={"test-id"}>
            <FormFieldLabel>Label</FormFieldLabel>
            <Tooltip content="Helper text">
              <Input defaultValue="Value" data-testid="test-id-2" />
            </Tooltip>
          </FormField>
        );

        cy.findByLabelText("Label").realHover();
        cy.findByText("Helper text").should(
          "have.attr",
          "id",
          "helperText-test-id"
        );
      });

      describe("AND is disabled", () => {
        it("THEN tooltip should not be visible on input hover", () => {
          cy.mount(
            <FormField disabled>
              <FormFieldLabel>Label</FormFieldLabel>
              <Tooltip content="Helper text">
                <Input defaultValue="Value" data-testid="test-id-2" />
              </Tooltip>
            </FormField>
          );
          cy.findByLabelText("Label").realHover();

          cy.findByRole("tooltip").should("not.exist");
        });
      });

      describe("AND has validation status", () => {
        it("THEN tooltip should reflect status", () => {
          cy.mount(
            <FormField validationStatus="error">
              <FormFieldLabel>Label</FormFieldLabel>
              <Tooltip content="Helper text">
                <Input defaultValue="Value" data-testid="test-id-2" />
              </Tooltip>
            </FormField>
          );
          cy.findByLabelText("Label").realHover();

          cy.findByRole("tooltip").should("have.class", "saltTooltip-error");
        });
      });
      
      describe("AND has empty validation status", () => {
        it("THEN tooltip should reflect status", () => {
          cy.mount(
            <FormField validationStatus="">
              <FormFieldLabel>Label</FormFieldLabel>
              <Tooltip content="Helper text">
                <Input defaultValue="Value" data-testid="test-id-2" />
              </Tooltip>
            </FormField>
          );
          cy.findByLabelText("Label").realHover();

          cy.findByRole("tooltip").should("have.class", "saltTooltip-info");
        });
      });
    });

    describe("AND Input has an button adornment", () => {
      it("THEN should cy.mount with the adornment", () => {
        cy.mount(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <Input
              defaultValue="Value"
              startAdornment={<Button>Test</Button>}
              data-testid="test-id-3"
            />
          </FormField>
        );
        cy.findByRole("button").should("be.visible");
      });

      it("THEN should disable the button when disabled", () => {
        cy.mount(
          <FormField disabled>
            <FormFieldLabel>Label</FormFieldLabel>
            <Input
              defaultValue="Value"
              startAdornment={<Button disabled>Test</Button>}
              data-testid="test-id-3"
            />
          </FormField>
        );
        cy.findByRole("button").should("be.visible");
        cy.findByRole("button").should("have.class", "saltButton-disabled");
      });

      it("THEN should disable the button when readonly", () => {
        cy.mount(
          <FormField readOnly>
            <FormFieldLabel>Label</FormFieldLabel>
            <Input
              defaultValue="Value"
              startAdornment={<Button disabled>Test</Button>}
              data-testid="test-id-3"
            />
          </FormField>
        );
        cy.findByRole("button").should("be.visible");
        cy.findByRole("button").should("have.class", "saltButton-disabled");
      });
    });
  });

  describe("WITH a nested RadioButton", () => {
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButton label="Value" />
        </FormField>
      );

      cy.findByLabelText("Label").focus();
      cy.checkAxeComponent();
    });

    it("THEN should disable the RadioButton when disabled", () => {
      cy.mount(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButton label="Value" />
        </FormField>
      );
      cy.findByLabelText("Label").should("have.attr", "disabled");
    });

    it.skip("THEN should disable the RadioButton when readonly", () => {
      cy.mount(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButton label="Value" />
        </FormField>
      );
      cy.findByText("Label").should("have.class", "saltRadioButton-readonly");
    });
  });

  describe("WITH a nested Checkbox", () => {
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Checkbox label="Value" />
        </FormField>
      );

      cy.findByLabelText("Label").focus();
      cy.checkAxeComponent();
    });

    it("THEN should disable the Checkbox when disabled", () => {
      cy.mount(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <Checkbox label="Value" />
        </FormField>
      );
      cy.findByLabelText("Label").should("have.attr", "disabled");
    });

    it.skip("THEN should disable the Checkbox when readonly", () => {
      cy.mount(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <Checkbox label="Value" />
        </FormField>
      );
      cy.findByText("Label").should("have.class", "saltCheckbox-readonly");
    });
  });
});
