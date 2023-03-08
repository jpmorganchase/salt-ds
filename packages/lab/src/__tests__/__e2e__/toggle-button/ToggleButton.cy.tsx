import { HomeIcon } from "@salt-ds/icons";
import { ToggleButton, ToggleButtonProps } from "@salt-ds/lab";
import { useState } from "react";

describe("GIVEN a ToggleButton with Icon and Text", () => {
  it("THEN it should render correctly", () => {
    const toggleSpy = cy.stub().as("toggleSpy");
    const ControlledToggleButtonExample = () => {
      const [toggled, setToggled] = useState(true);
      const handleToggle: ToggleButtonProps["onToggle"] = (event, state) => {
        setToggled(state);
        toggleSpy(event, state);
      };
      return (
        <ToggleButton
          aria-label="home"
          onToggle={handleToggle}
          toggled={toggled}
          tooltipText="Home"
        >
          <HomeIcon />
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
    cy.get("@toggleSpy").should("have.been.calledOnce");

    cy.get("@toggleSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      false
    );

    // toggle
    cy.findByRole("checkbox").realClick();
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "true");
    cy.get("@toggleSpy").should("have.been.calledTwice");

    cy.get("@toggleSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      true
    );
  });
});

describe("GIVEN a disabled ToggleButton with Icon and Text", () => {
  it("THEN it should not toggle", () => {
    const toggleSpy = cy.stub().as("toggleSpy");
    const ControlledToggleButtonExample = () => {
      const [toggled, setToggled] = useState(false);
      const handleToggle: ToggleButtonProps["onToggle"] = (event, state) => {
        setToggled(state);
        toggleSpy(event, state);
      };
      return (
        <ToggleButton
          aria-label="home"
          disabled
          onToggle={handleToggle}
          toggled={toggled}
          tooltipText="Home"
        >
          <HomeIcon />
          Home
        </ToggleButton>
      );
    };
    cy.mount(<ControlledToggleButtonExample />);

    cy.findByRole("checkbox").should("have.text", "Home");
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "false");
    cy.findByRole("checkbox").should("be.disabled");

    // try to toggle
    cy.findByRole("checkbox").realClick();
    cy.get("@toggleSpy").should("not.have.been.called");
  });
});
