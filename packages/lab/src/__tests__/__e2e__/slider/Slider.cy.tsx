import { Slider } from "@jpmorganchase/uitk-lab";

describe("Given a Slider with a single value", () => {
  it("THEN it should have ARIA roles and attributes", () => {
    cy.mount(
      <Slider
        label={"TestLabel"}
        min={5}
        max={125}
        step={5}
        pageStep={25}
        defaultValue={100}
      />
    );
    cy.findByRole("slider")
      .should("have.attr", "aria-valuemin", "5")
      .and("have.attr", "aria-valuemax", "125")
      .and("have.attr", "aria-disabled", "false");
  });

  it("THEN it should respond to keyboard", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Slider
        label={"TestLabel"}
        min={5}
        max={125}
        step={5}
        pageStep={25}
        defaultValue={100}
        onChange={changeSpy}
      />
    );

    cy.findByRole("slider").focus();
    cy.realPress("ArrowLeft");
    cy.get("@changeSpy")
      .should("have.been.calledOnce")
      .and("be.calledWith", 95);
    cy.findByRole("slider").should("have.attr", "aria-valuenow", "95");

    // Page Up/Down buttons should move the value one "pageStep" up/down
    cy.findByRole("slider").realPress("PageDown");
    cy.get("@changeSpy")
      .should("have.been.calledTwice")
      .and("be.calledWith", 70);

    // End key should move the value to max
    cy.findByRole("slider").realPress("End");
    cy.get("@changeSpy")
      .should("have.been.calledThrice")
      .and("be.calledWith", 125);

    // Home key should move the value to min
    cy.findByRole("slider").realPress("Home");
    cy.get("@changeSpy").should("have.callCount", 4).and("be.calledWith", 5);
  });
});

describe("Given a Slider with a range value", () => {
  it("THEN it should have ARIA roles and attributes", () => {
    cy.mount(
      <Slider
        label={"TestLabel"}
        min={-100}
        max={100}
        step={10}
        defaultValue={[20, 40]}
      />
    );

    cy.findByRole("group").should(
      "have.attr",
      "aria-label",
      "TestLabel slider from -100 to 100"
    );

    cy.findAllByRole("slider").should("have.length", 2);

    cy.findAllByRole("slider")
      .eq(0)
      .should("have.attr", "aria-label", "Min")
      .and("have.attr", "aria-valuenow", "20");

    cy.findAllByRole("slider")
      .eq(1)
      .should("have.attr", "aria-label", "Max")
      .and("have.attr", "aria-valuenow", "40");
  });
});

describe("Given a Slider with more than 2 items in the value", () => {
  it("THEN it should have ARIA roles and attributes", () => {
    cy.mount(
      <Slider
        label={"TestLabel"}
        min={-10}
        max={110}
        step={1}
        defaultValue={[20, 40, 100]}
      />
    );

    cy.findByRole("group").should(
      "have.attr",
      "aria-label",
      "TestLabel slider from -10 to 110"
    );

    cy.findAllByRole("slider").should("have.length", 3);

    cy.findAllByRole("slider")
      .eq(0)
      .should("have.attr", "aria-label", "First")
      .and("have.attr", "aria-valuenow", "20");

    cy.findAllByRole("slider")
      .eq(1)
      .should("have.attr", "aria-label", "Second")
      .and("have.attr", "aria-valuenow", "40");

    cy.findAllByRole("slider")
      .eq(2)
      .should("have.attr", "aria-label", "Third")
      .and("have.attr", "aria-valuenow", "100");
  });
});

describe("Given a pushable range slider", () => {
  it("WHEN moving a handle, it should push other handles", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <Slider
        label={"TestLabel"}
        min={-8}
        max={8}
        step={1}
        defaultValue={[-1, 3, 7]}
        pushable
        pushDistance={3}
        onChange={changeSpy}
      />
    );

    cy.findAllByRole("slider").should("have.length", 3);

    cy.findAllByRole("slider").eq(0).focus();
    cy.realPress("ArrowRight");
    cy.get("@changeSpy").should("have.been.calledWith", [0, 3, 7]);

    cy.realPress("ArrowRight");
    cy.get("@changeSpy").should("have.been.calledWith", [1, 4, 7]);

    cy.realPress("ArrowRight");
    cy.get("@changeSpy").should("have.been.calledWith", [2, 5, 8]);

    // Should not push beyond max
    cy.realPress("ArrowRight");
    cy.get("@changeSpy").should("have.callCount", 3);
    cy.findAllByRole("slider").eq(0).should("have.attr", "aria-valuenow", "2");
    cy.findAllByRole("slider").eq(1).should("have.attr", "aria-valuenow", "5");
    cy.findAllByRole("slider").eq(2).should("have.attr", "aria-valuenow", "8");
  });
});

describe("Given a non-pushable range slider", () => {
  it("WHEN moving a handle, it should be constrained by the handles next to it", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Slider
        label={"TestLabel"}
        min={-8}
        max={8}
        step={1}
        pageStep={4}
        defaultValue={[-1, 3, 7]}
        onChange={changeSpy}
      />
    );

    cy.findAllByRole("slider").should("have.length", 3);

    cy.findAllByRole("slider").eq(0).focus();
    cy.realPress("PageUp");
    cy.realPress("ArrowUp");
    cy.realPress("ArrowRight");
    cy.realPress("End");
    cy.get("@changeSpy")
      .should("have.been.calledOnce")
      .and("been.calledWith", [3, 3, 7]);

    cy.findAllByRole("slider").eq(2).focus();
    cy.realPress("Home");
    cy.realPress("PageDown");
    cy.realPress("ArrowLeft");
    cy.realPress("ArrowDown");
    cy.get("@changeSpy")
      .should("have.been.calledTwice")
      .and("been.calledWith", [3, 3, 3]);
  });
});
