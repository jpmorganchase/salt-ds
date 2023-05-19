import { HomeIcon } from "@salt-ds/icons";
import { ToggleButton, ToggleButtonProps } from "@salt-ds/lab";
import { useState } from "react";

describe("GIVEN a ToggleButton with Icon and Text", () => {
  it("THEN it should toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
    const ControlledToggleButtonExample = () => {
      const [toggled, setToggled] = useState(true);
      const handleToggle: ToggleButtonProps["onSelectionChange"] = (event) => {
        setToggled((old) => !old);
        selectionChangeSpy(event);
      };
      return (
        <ToggleButton
          onSelectionChange={handleToggle}
          selected={toggled}
          value="home"
        >
          <HomeIcon aria-hidden />
          Home
        </ToggleButton>
      );
    };

    cy.mount(<ControlledToggleButtonExample />);

    cy.findByRole("checkbox").should("have.text", "Home");
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "true");

    // untoggle
    cy.findByRole("checkbox").realClick();
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "false");
    cy.get("@selectionChangeSpy").should("have.been.calledOnce");

    // toggle
    cy.findByRole("checkbox").realClick();
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "true");
    cy.get("@selectionChangeSpy").should("have.been.calledTwice");
  });
});

describe("GIVEN a disabled ToggleButton with Icon and Text", () => {
  it("THEN it should not toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");

    cy.mount(
      <ToggleButton
        disabled
        value="home"
        onSelectionChange={selectionChangeSpy}
      >
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>
    );

    cy.findByRole("checkbox").should("have.text", "Home");
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "false");
    cy.findByRole("checkbox").should("be.disabled");

    // try to toggle
    cy.findByRole("checkbox").realClick();
    cy.get("@selectionChangeSpy").should("not.have.been.called");
  });
});
