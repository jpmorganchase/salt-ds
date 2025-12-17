import { Switch, type SwitchProps } from "@salt-ds/core";
import * as switchStories from "@stories/switch/switch.stories";
import { composeStories } from "@storybook/react";
import { type ChangeEvent, useState } from "react";

function ControlledSwitch({ onChange, disabled }: SwitchProps) {
  const [checked, setChecked] = useState(false);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <Switch disabled={disabled} checked={checked} onChange={handleChange} />
  );
}

const { WithFormField } = composeStories(switchStories);

describe("GIVEN a Switch", () => {
  it("SHOULD support data attribute on inputProps", () => {
    cy.mount(<Switch inputProps={{ "data-testId": "customInput" }} checked />);
    cy.findByTestId("customInput").should("be.checked");
  });

  describe("WHEN using Tab to navigate", () => {
    it("THEN should be focusable", () => {
      cy.mount(<Switch />);
      cy.realPress("Tab");
      cy.findByRole("switch").should("be.focused");
    });

    it("SHOULD not be focusable when disabled", () => {
      cy.mount(<Switch disabled />);
      cy.findByRole("switch").should("be.disabled");
      cy.realPress("Tab");
      cy.findByRole("switch").should("not.be.focused");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      cy.mount(<Switch defaultChecked />);
      cy.findByRole("switch").should("be.checked");
    });

    describe("AND using a mouse", () => {
      it("THEN should be toggle if clicked", () => {
        cy.mount(<Switch />);
        cy.findByRole("switch").should("not.be.checked");
        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("be.checked");
        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("not.be.checked");
      });

      it("SHOULD call onChange when clicked", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Switch onChange={changeSpy} />);
        cy.findByRole("switch").should("not.be.checked");
        cy.findByRole("switch").realClick();
        cy.get("@changeSpy").should("have.been.called");
      });

      describe("AND is disabled", () => {
        it("THEN should not be checked if clicked", () => {
          cy.mount(<Switch disabled />);
          cy.findByRole("switch").should("not.be.checked");
          cy.findByRole("switch").realClick();
          cy.findByRole("switch").should("not.be.checked");
        });

        it("SHOULD not call onChange when clicked", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(<Switch disabled onChange={changeSpy} />);
          cy.findByRole("switch").should("be.disabled");
          cy.findByRole("switch").should("not.be.checked");
          cy.findByRole("switch").realClick();
          cy.get("@changeSpy").should("not.have.been.called");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle when pressing the Space key", () => {
        cy.mount(<Switch />);
        cy.findByRole("switch").should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Space");
        cy.findByRole("switch").should("be.checked");
        cy.realPress("Space");
        cy.findByRole("switch").should("not.be.checked");
      });

      it("SHOULD call onChange when pressing the Space key", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Switch onChange={changeSpy} />);
        cy.findByRole("switch").should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Space");
        cy.get("@changeSpy").should("have.been.called");
      });

      it("SHOULD not toggle when pressing Enter key", () => {
        cy.mount(<Switch />);
        cy.findByRole("switch").should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("switch").should("not.be.checked");
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      cy.mount(<Switch checked />);
      cy.findByRole("switch").should("be.checked");
    });

    describe("AND using a mouse", () => {
      it("THEN should be toggle if clicked", () => {
        cy.mount(<ControlledSwitch />);
        cy.findByRole("switch").should("not.be.checked");
        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("be.checked");
        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("not.be.checked");
      });

      describe("AND is disabled", () => {
        it("THEN should not be checked if clicked", () => {
          cy.mount(<ControlledSwitch disabled />);
          cy.findByRole("switch").should("be.disabled");
          cy.findByRole("switch").should("not.be.checked");
          cy.findByRole("switch").realClick();
          cy.findByRole("switch").should("not.be.checked");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle when pressing the Space key", () => {
        cy.mount(<ControlledSwitch />);
        cy.findByRole("switch").should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Space");
        cy.findByRole("switch").should("be.checked");
        cy.realPress("Space");
        cy.findByRole("switch").should("not.be.checked");
      });

      it("SHOULD not toggle when pressing Enter key", () => {
        cy.mount(<ControlledSwitch />);
        cy.findByRole("switch").should("not.be.checked");
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("switch").should("not.be.checked");
      });
    });
  });

  describe("WHEN used without label", () => {
    it("THEN should NOT render label span", () => {
      cy.mount(<Switch />);
      cy.get(".saltSwitch-label").should("not.exist");
    });
  });

  it("should have form field support", () => {
    cy.mount(<WithFormField />);
    cy.findByRole("switch").should("have.accessibleName", "Label");
    cy.findByRole("switch").should("have.accessibleDescription", "Helper text");

    cy.findByText("Label").realClick();
    cy.findByRole("switch").should("be.focused");
    cy.findByRole("switch").should("be.checked");
  });

  describe("WHEN readOnly is true", () => {
    it("THEN should not toggle if clicked", () => {
      cy.mount(<Switch readOnly />);
      cy.findByRole("switch").should("not.be.checked");
      cy.findByRole("switch").realClick();
      cy.findByRole("switch").should("not.be.checked");
    });

    it("THEN should not toggle when pressing the Space key", () => {
      cy.mount(<Switch readOnly />);
      cy.findByRole("switch").should("not.be.checked");
      cy.realPress("Tab");
      cy.realPress("Space");
      cy.findByRole("switch").should("not.be.checked");
    });

    it("THEN should have aria-readonly attribute", () => {
      cy.mount(<Switch readOnly />);
      cy.findByRole("switch").should("have.attr", "aria-readonly", "true");
    });

    it("THEN should be focusable", () => {
      cy.mount(<Switch readOnly />);
      cy.realPress("Tab");
      cy.findByRole("switch").should("be.focused");
    });
  });
});
