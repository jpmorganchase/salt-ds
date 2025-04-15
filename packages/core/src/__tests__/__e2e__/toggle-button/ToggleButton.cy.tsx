import { ToggleButton, type ToggleButtonProps } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import { useState } from "react";

describe("GIVEN a ToggleButton with Icon and Text", () => {
  it("THEN it should toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
    const ControlledToggleButtonExample = () => {
      const [toggled, setToggled] = useState(true);
      const handleToggle: ToggleButtonProps["onChange"] = (event) => {
        setToggled((old) => !old);
        selectionChangeSpy(event);
      };
      return (
        <ToggleButton onChange={handleToggle} selected={toggled} value="home">
          <HomeIcon aria-hidden />
          Home
        </ToggleButton>
      );
    };

    cy.mount(<ControlledToggleButtonExample />);

    cy.findByRole("button").should("have.text", "Home");
    cy.findByRole("button").should("have.attr", "aria-pressed", "true");

    // untoggle
    cy.findByRole("button").realClick();
    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.get("@selectionChangeSpy").should("have.been.calledOnce");

    // toggle
    cy.findByRole("button").realClick();
    cy.findByRole("button").should("have.attr", "aria-pressed", "true");
    cy.get("@selectionChangeSpy").should("have.been.calledTwice");
  });
});

describe("GIVEN a disabled ToggleButton with Icon and Text", () => {
  it("THEN it should not toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");

    cy.mount(
      <ToggleButton disabled value="home" onChange={selectionChangeSpy}>
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.findByRole("button").should("have.text", "Home");
    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.findByRole("button").should("be.disabled");

    // try to toggle
    cy.findByRole("button").realClick();
    cy.get("@selectionChangeSpy").should("not.have.been.called");
  });

  it("THEN it should be not be focusable", () => {
    cy.mount(
      <ToggleButton disabled value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.findByRole("button").focus().should("not.have.focus");
    cy.findByRole("button").should("be.disabled");
  });

  it("THEN it should be focusable when selected and disabled", () => {
    cy.mount(
      <ToggleButton disabled selected value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );
    cy.findByRole("button")
      .should("have.attr", "aria-disabled", "true")
      .and("have.attr", "aria-pressed", "true");
    cy.findByRole("button").focus().should("have.focus");
  });

  it("THEN it should not toggle when selected and disabled", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");

    cy.mount(
      <ToggleButton
        disabled
        selected
        value="home"
        onChange={selectionChangeSpy}
      >
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.findByRole("button").should("have.text", "Home");
    cy.findByRole("button").should("have.attr", "aria-pressed", "true");
    cy.findByRole("button").should("have.attr", "aria-disabled", "true");

    // try to toggle
    cy.findByRole("button").realClick();
    cy.get("@selectionChangeSpy").should("not.have.been.called");
  });
});
