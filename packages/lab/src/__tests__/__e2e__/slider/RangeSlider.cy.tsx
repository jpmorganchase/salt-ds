import { RangeSlider } from "@salt-ds/lab";

describe("Given a Range Slider", () => {
  it("should have ARIA roles and attributes", () => {
    cy.mount(
      <RangeSlider
        style={{ width: "400px" }}
        min={5}
        max={125}
        step={5}
        defaultValue={[50, 100]}
      />,
    );

    // TODO Finish tests

    cy.findAllByRole("slider")
      .should("have.attr", "aria-valuemin", "5")
      .and("have.attr", "aria-valuemax", "125");
  });

  it("should trigger onChange when clicked on the track", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<RangeSlider style={{ width: "400px" }} onChange={changeSpy} />);
    cy.get(".saltSlider-track").trigger("mousedown", {
      button: 0,
      clientX: 500,
      clientY: 50,
    });
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get(".saltSlider-track").trigger("mouseup");
  });

  it("should set thumb positions correctly when clicked on the track", () => {
    cy.mount(<RangeSlider style={{ width: "400px" }} />);
    cy.get(".saltSlider-track").trigger("mousedown", {
      button: 0,
      clientX: 500,
      clientY: 50,
    });
    cy.get(".saltSlider-track").trigger("mouseup");
    cy.get(".saltSlider-track").trigger("mousedown", {
      button: 0,
      clientX: 700,
      clientY: 50,
    });
    cy.get(".saltSlider-track").trigger("mouseup");

    // First thumb
    cy.findAllByRole("slider").eq(0).should("have.attr", "aria-valuenow", "1");
    // First thumb
    cy.findAllByRole("slider").eq(1).should("have.attr", "aria-valuenow", "7");
  });

  it("should change thumb positions based on keyboard navigation", () => {
    cy.mount(<RangeSlider defaultValue={[4, 8]} style={{ width: "400px" }} />);

    // Focus and move first thumb
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(0).should("have.attr", "aria-valuenow", "5");

    // Focus and move second thumb
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
    cy.findAllByRole("slider").eq(1).should("have.attr", "aria-valuenow", "7");

    // Focus first thumb and press and Home key
    cy.findAllByRole("slider").eq(0).focus().realPress("Home");
    cy.findAllByRole("slider").eq(0).should("have.attr", "aria-valuenow", "0");

    // Focus second thumb and press and End key
    cy.findAllByRole("slider").eq(1).focus().realPress("End");
    cy.findAllByRole("slider").eq(1).should("have.attr", "aria-valuenow", "10");
  });

  it("should not allow thumbs to overlap", () => {
    cy.mount(<RangeSlider defaultValue={[4, 8]} style={{ width: "400px" }} />);

    // Focus first thumb and press and End key
    cy.findAllByRole("slider").eq(0).focus().realPress("End");
    cy.findAllByRole("slider").eq(0).should("have.attr", "aria-valuenow", "8");

    // Focus second thumb and press and Home key
    cy.findAllByRole("slider").eq(1).focus().realPress("Home");
    cy.findAllByRole("slider").eq(1).should("have.attr", "aria-valuenow", "8");
  });

  it("should display a tooltip with correct value only when thumb is hovered", () => {
    cy.mount(<RangeSlider style={{ width: "400px" }} defaultValue={[2, 5]} />);

    // Hover the first thumb
    cy.get(".saltSliderThumb").eq(0).trigger("mouseover");
    // First thumb's tooltip should be visible and have correct value
    cy.get(".saltSliderTooltip").eq(0).should("be.visible");
    cy.get(".saltSliderTooltip").eq(0).should("have.text", "2");
    // Second thumb's tooltip should not be visible
    cy.get(".saltSliderTooltip").eq(1).should("not.be.visible");

    cy.get(".saltSliderThumb").eq(0).trigger("mouseout");
    cy.wait(250);
    cy.get(".saltSliderTooltip").should("not.be.visible");

    // Hover the second thumb
    cy.get(".saltSliderThumb").eq(1).trigger("mouseover");
    // Second thumb's tooltip should be visible and have correct value
    cy.get(".saltSliderTooltip").eq(1).should("be.visible");
    cy.get(".saltSliderTooltip").eq(1).should("have.text", "5");
    // First thumb's tooltip should not be visible
    cy.get(".saltSliderTooltip").eq(0).should("not.be.visible");

    cy.get(".saltSliderThumb").eq(1).trigger("mouseout");
    cy.wait(250);
    cy.get(".saltSliderTooltip").should("not.be.visible");
  });
});
