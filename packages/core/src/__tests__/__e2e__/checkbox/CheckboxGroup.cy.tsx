import {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupProps,
  FormField,
  FormFieldLabel,
} from "@salt-ds/core";
import { ChangeEvent, useState } from "react";

const ControlledGroup = ({ onChange, disabled }: CheckboxGroupProps) => {
  const [controlledValues, setControlledValues] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (controlledValues.indexOf(value) === -1) {
      setControlledValues((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setControlledValues((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value
        )
      );
    }
    onChange?.(event);
  };
  return (
    <CheckboxGroup
      disabled={disabled}
      checkedValues={controlledValues}
      onChange={handleChange}
    >
      <Checkbox label="one" value="one" />
      <Checkbox label="two" value="two" />
      <Checkbox label="three" value="three" />
    </CheckboxGroup>
  );
};

describe("GIVEN a CheckboxGroup", () => {
  it("THEN should render checkboxes", () => {
    cy.mount(
      <CheckboxGroup>
        <Checkbox label="one" value="one" />
        <Checkbox label="two" value="two" />
        <Checkbox label="three" value="three" />
      </CheckboxGroup>
    );

    cy.findAllByRole("checkbox").should("have.length", 3);
    cy.findByRole("checkbox", { name: "one" }).should("have.value", "one");
    cy.findByRole("checkbox", { name: "two" }).should("have.value", "two");
    cy.findByRole("checkbox", { name: "three" }).should("have.value", "three");
  });

  describe("WHEN using Tab to navigate", () => {
    it("SHOULD focus the first checkbox when none are checked", () => {
      cy.mount(
        <CheckboxGroup>
          <Checkbox label="one" value="one" />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );

      cy.realPress("Tab");
      cy.findByRole("checkbox", { name: "one" }).should("be.focused");
    });

    it("SHOULD focus the first checkbox when one is checked", () => {
      cy.mount(
        <CheckboxGroup>
          <Checkbox label="one" value="one" />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );

      cy.realPress("Tab");
      cy.findByRole("checkbox", { name: "one" }).should("be.focused");
    });

    it("SHOULD move focus when pressing Tab and not wrap", () => {
      cy.mount(
        <>
          <CheckboxGroup>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
          <button>end</button>
        </>
      );

      cy.realPress("Tab");
      cy.findByRole("checkbox", { name: "one" }).should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("checkbox", { name: "two" }).should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("checkbox", { name: "three" }).should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("button", { name: "end" }).should("be.focused");
    });

    it("SHOULD move focus backwards when pressing Shift+Tab and not wrap", () => {
      cy.mount(
        <>
          <button>start</button>
          <CheckboxGroup>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
          <button>end</button>
        </>
      );

      cy.findByRole("button", { name: "end" }).realClick();
      cy.findByRole("button", { name: "end" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("checkbox", { name: "three" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("checkbox", { name: "two" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("checkbox", { name: "one" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "start" }).should("be.focused");
    });

    it("SHOULD skip disabled checkboxes", () => {
      cy.mount(
        <CheckboxGroup>
          <Checkbox label="one" value="one" disabled />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );

      cy.realPress("Tab");
      cy.findByRole("checkbox", { name: "two" }).should("be.focused");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultCheckedValues", () => {
      cy.mount(
        <CheckboxGroup defaultCheckedValues={["one"]}>
          <Checkbox label="one" value="one" />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );
      cy.findByRole("checkbox", { name: "one" }).should("be.checked");
      cy.findByRole("checkbox", { name: "two" }).should("not.be.checked");
      cy.findByRole("checkbox", { name: "three" }).should("not.be.checked");
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle checkboxes", () => {
        cy.mount(
          <CheckboxGroup>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("not.be.checked");

        cy.findByRole("checkbox", { name: "one" }).realClick();
        cy.findByRole("checkbox", { name: "one" }).should("be.checked");

        cy.findByRole("checkbox", { name: "one" }).realClick();
        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");

        cy.findByRole("checkbox", { name: "one" }).realClick();
        cy.findByRole("checkbox", { name: "two" }).realClick();
        cy.findByRole("checkbox", { name: "three" }).realClick();
        cy.findByRole("checkbox", { name: "one" }).should("be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("be.checked");
      });

      it("SHOULD call onChange", () => {
        const changeSpy = cy.stub().as("changeSpy");

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };

        cy.mount(
          <CheckboxGroup onChange={handleChange}>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        cy.findByRole("checkbox", { name: "two" }).realClick();
        cy.get("@changeSpy").should("be.calledWithMatch", {
          target: { value: "two" },
        });
      });

      describe("AND a checkbox is disabled", () => {
        it("SHOULD not toggle the checkbox", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(
            <CheckboxGroup onChange={changeSpy}>
              <Checkbox label="one" value="one" disabled />
              <Checkbox label="two" value="two" />
              <Checkbox label="three" value="three" />
            </CheckboxGroup>
          );

          cy.findByRole("checkbox", { name: "one" })
            .should("be.disabled")
            .and("not.be.checked");
          cy.findByRole("checkbox", { name: "one" }).realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle checkboxes when using the Space key", () => {
        cy.mount(
          <CheckboxGroup>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("not.be.checked");

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "one" }).should("be.checked");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");

        cy.realPress("Space");
        cy.findByRole("checkbox", { name: "one" }).should("be.checked");

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "one" }).should("be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("be.checked");
      });

      it("SHOULD call onChange", () => {
        const changeSpy = cy.stub().as("changeSpy");

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };

        cy.mount(
          <CheckboxGroup onChange={handleChange}>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        cy.realPress("Tab");
        cy.realPress("Tab");

        cy.realPress("Space");
        cy.get("@changeSpy").should("be.calledWithMatch", {
          target: { value: "two" },
        });
      });

      it("SHOULD not toggle checkboxes using the Enter key", () => {
        cy.mount(
          <CheckboxGroup>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should respect checkedValues", () => {
      cy.mount(
        <CheckboxGroup checkedValues={["one"]}>
          <Checkbox label="one" value="one" />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );
      cy.findByRole("checkbox", { name: "one" }).should("be.checked");
      cy.findByRole("checkbox", { name: "two" }).should("not.be.checked");
      cy.findByRole("checkbox", { name: "three" }).should("not.be.checked");
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle checkboxes", () => {
        cy.mount(<ControlledGroup />);

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("not.be.checked");

        cy.findByRole("checkbox", { name: "one" }).realClick();
        cy.findByRole("checkbox", { name: "one" }).should("be.checked");

        cy.findByRole("checkbox", { name: "one" }).realClick();
        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");

        cy.findByRole("checkbox", { name: "one" }).realClick();
        cy.findByRole("checkbox", { name: "two" }).realClick();
        cy.findByRole("checkbox", { name: "three" }).realClick();
        cy.findByRole("checkbox", { name: "one" }).should("be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("be.checked");
      });

      describe("AND a checkbox is disabled", () => {
        it("SHOULD not toggle the checkbox", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(<ControlledGroup onChange={changeSpy} disabled />);

          cy.findByRole("checkbox", { name: "one" })
            .should("be.disabled")
            .and("not.be.checked");
          cy.findByRole("checkbox", { name: "one" }).realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle checkboxes when using the Space key", () => {
        cy.mount(<ControlledGroup />);

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("not.be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("not.be.checked");

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "one" }).should("be.checked");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");

        cy.realPress("Space");
        cy.findByRole("checkbox", { name: "one" }).should("be.checked");

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "one" }).should("be.checked");
        cy.findByRole("checkbox", { name: "two" }).should("be.checked");
        cy.findByRole("checkbox", { name: "three" }).should("be.checked");
      });

      it("SHOULD not toggle checkboxes using the Enter key", () => {
        cy.mount(<ControlledGroup />);

        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("checkbox", { name: "one" }).should("not.be.checked");
      });
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      cy.mount(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <CheckboxGroup checkedValues={["one"]}>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" disabled />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        </FormField>
      );

      cy.findAllByRole("checkbox").should("have.attr", "disabled");
    });

    it("THEN should respect the context when read-only", () => {
      cy.mount(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <CheckboxGroup checkedValues={["one"]}>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" readOnly />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        </FormField>
      );

      cy.findAllByRole("checkbox").should("have.attr", "readonly");
    });

    it("THEN should have the correct aria labelling", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <CheckboxGroup checkedValues={["one"]}>
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" readOnly />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        </FormField>
      );

      cy.findAllByRole("checkbox").eq(0).should("have.accessibleName", "one");
    });
  });
});
