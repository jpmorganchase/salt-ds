import * as rangeSliderStories from "@stories/slider/range-slider.stories";
import { composeStories } from "@storybook/react";

const composedStories = composeStories(rangeSliderStories);

const { Default } = composedStories;

describe("Given a Range Slider", () => {
  it("should render with default props", () => {
    cy.mount(<Default />);

    cy.findAllByRole("slider").should("exist");
    cy.findAllByRole("slider").eq(0).should("have.value", "0");
    cy.findAllByRole("slider").eq(1).should("have.value", "1");
  });

  it("should trigger onChange when clicked on the track", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default style={{ width: "400px" }} onChange={changeSpy} />);
    cy.get(".saltSliderTrack-rail").trigger("pointerdown", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([0, 7]),
    );
    cy.get(".saltSliderTrack-rail").trigger("pointerup");
  });

  it("should set thumb positions correctly when clicked on the track", () => {
    cy.mount(<Default style={{ width: "400px" }} />);
    cy.get(".saltSliderTrack-rail").trigger("pointerdown", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.get(".saltSliderTrack-rail").trigger("pointerup");
    cy.get(".saltSliderTrack-rail").trigger("pointerdown", {
      button: 0,
      clientX: 615,
      clientY: 50,
    });
    cy.get(".saltSliderTrack-rail").trigger("pointerup");

    // First thumb
    cy.findAllByRole("slider").eq(0).should("have.value", "3");
    // Second thumb
    cy.findAllByRole("slider").eq(1).should("have.value", "7");
  });

  it("should allow dragging to change values", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default
        style={{ width: "400px" }}
        min={0}
        max={10}
        default={[0, 1]}
        onChange={changeSpy}
      />,
    );

    // Drag the second thumb
    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointerdown");
    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointerup");
    // Value should be updated
    cy.findAllByRole("slider").eq(1).should("have.value", "7");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([0, 7]),
    );

    // Drag the first thumb
    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerdown");
    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointermove", {
      button: 0,
      clientX: 550,
      clientY: 50,
    });
    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerup");
    // Value should be updated
    cy.findAllByRole("slider").eq(0).should("have.value", "1");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([1, 7]),
    );
  });

  it("should change thumb positions based on keyboard navigation", () => {
    cy.mount(
      <Default
        defaultValue={[4, 8]}
        min={0}
        max={30}
        style={{ width: "400px" }}
      />,
    );

    // Focus and move first thumb
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(0).should("have.value", "5");

    // Focus and move second thumb
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
    cy.findAllByRole("slider").eq(1).should("have.value", "7");

    // Focus first thumb and press and Home key
    cy.findAllByRole("slider").eq(0).focus().realPress("Home");
    cy.findAllByRole("slider").eq(0).should("have.value", "0");

    // Focus second thumb and press and End key
    cy.findAllByRole("slider").eq(1).focus().realPress("End");
    cy.findAllByRole("slider").eq(1).should("have.value", "30");

    // Focus first thumb and press and Page Up key
    cy.findAllByRole("slider").eq(0).focus().realPress("PageUp");
    // It should have a greater step increase
    cy.findAllByRole("slider").eq(0).should("have.value", "2");

    // Focus second thumb and press and Page Up key
    cy.findAllByRole("slider").eq(1).focus().realPress("PageDown");
    // It should have a greater step decrease
    cy.findAllByRole("slider").eq(1).should("have.value", "28");
  });

  it("should move the thumb in larger increments when step multiplier is increased", () => {
    cy.mount(
      <Default
        defaultValue={[0, 30]}
        min={0}
        max={30}
        stepMultiplier={10}
        style={{ width: "400px" }}
      />,
    );

    // Focus and move first thumb
    cy.findAllByRole("slider").eq(0).focus().realPress("PageUp");
    cy.findAllByRole("slider").eq(0).should("have.value", "10");

    // Focus and move second thumb
    cy.findAllByRole("slider").eq(1).focus().realPress("PageDown");
    cy.findAllByRole("slider").eq(1).should("have.value", "20");
  });

  it("should not allow thumbs to overlap", () => {
    cy.mount(<Default defaultValue={[4, 8]} style={{ width: "400px" }} />);

    // Focus first thumb and press and End key
    cy.findAllByRole("slider").eq(0).focus().realPress("End");
    cy.findAllByRole("slider").eq(0).should("have.value", "8");

    // Focus second thumb and press and Home key
    cy.findAllByRole("slider").eq(1).focus().realPress("Home");
    cy.findAllByRole("slider").eq(1).should("have.value", "8");
  });

  it("should not allow thumbs to go beyond min and max values", () => {
    cy.mount(
      <Default
        min={2}
        max={9}
        defaultValue={[4, 8]}
        style={{ width: "400px" }}
      />,
    );

    // Focus first thumb, press Home key and then Arrow Left
    cy.findAllByRole("slider").eq(0).focus().realPress("Home");
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowLeft");
    // Thumb shouldn't go less than min value
    cy.findAllByRole("slider").eq(0).should("have.value", "2");

    // Focus second thumb, press End key and then Arrow Right
    cy.findAllByRole("slider").eq(1).focus().realPress("End");
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
    // Thumb shouldn't go more than max value
    cy.findAllByRole("slider").eq(1).should("have.value", "9");
  });

  it("should display a tooltip with correct value only when thumb is hovered", () => {
    cy.mount(<Default style={{ width: "400px" }} defaultValue={[2, 5]} />);

    // Hover the first thumb
    cy.get(".saltSliderThumb").eq(0).trigger("pointerover");
    // First thumb's tooltip should be visible and have correct value
    cy.get(".saltSliderTooltip").eq(0).should("be.visible");
    cy.get(".saltSliderTooltip").eq(0).should("have.text", "2");
    // Second thumb's tooltip should not be visible
    cy.get(".saltSliderTooltip").eq(1).should("not.be.visible");

    cy.get(".saltSliderThumb").eq(0).trigger("pointerout");
    cy.wait(250);
    cy.get(".saltSliderTooltip").should("not.be.visible");

    // Hover the second thumb
    cy.get(".saltSliderThumb").eq(1).trigger("pointerover");
    // Second thumb's tooltip should be visible and have correct value
    cy.get(".saltSliderTooltip").eq(1).should("be.visible");
    cy.get(".saltSliderTooltip").eq(1).should("have.text", "5");
    // First thumb's tooltip should not be visible
    cy.get(".saltSliderTooltip").eq(0).should("not.be.visible");

    cy.get(".saltSliderThumb").eq(1).trigger("pointerout");
    cy.wait(250);
    cy.get(".saltSliderTooltip").should("not.be.visible");
  });

  it("should render markers when provided", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        markers={[
          { value: 2, label: "2" },
          { value: 3, label: "3" },
        ]}
      />,
    );

    cy.findAllByTestId("marker").eq(0).should("have.text", "2");
    cy.findAllByTestId("marker").eq(1).should("have.text", "3");
  });

  it("should not render inline min/max labels when markers are provided", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        markers={[
          { value: 2, label: "2" },
          { value: 3, label: "3" },
        ]}
      />,
    );

    cy.get(".saltSliderTrack").should(
      "not.have.class",
      ".saltSlider-inlineLabels",
    );
  });

  it("should render custom min max labels when passed", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        minLabel={"Custom Min Label"}
        maxLabel={"Custom Max Label"}
      />,
    );

    cy.findByText("Custom Min Label").should("exist");
    cy.findByText("Custom Max Label").should("exist");
  });

  it("should be disabled when set", () => {
    cy.mount(<Default disabled defaultValue={[2, 3]} />);

    cy.findAllByRole("slider").should("be.disabled");
  });

  it("should format the tooltip text and min/max labels when a format function is passed", () => {
    cy.mount(
      <Default defaultValue={[2, 4]} format={(value: number) => `${value}%`} />,
    );

    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerover");
    cy.findAllByTestId("sliderTooltip").eq(0).should("be.visible");
    cy.findAllByTestId("sliderTooltip").eq(0).should("have.text", "2%");

    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerout");

    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointerover");
    cy.findAllByTestId("sliderTooltip").eq(1).should("be.visible");
    cy.findAllByTestId("sliderTooltip").eq(1).should("have.text", "4%");
  });
});
