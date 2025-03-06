import * as sliderStories from "@stories/slider/slider.stories";
import { composeStories } from "@storybook/react";
import { type ChangeEvent, useState } from "react";

const composedStories = composeStories(sliderStories);

const { Default } = composedStories;

describe("Given a Slider", () => {
  it("should render with the default props", () => {
    cy.mount(<Default />);

    cy.findByRole("slider").should("exist");
    cy.findByRole("slider").should("have.value", "0");
  });

  it("should fire onChange on pointer down on slider track", () => {
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
      9,
    );
  });

  it("should change the thumb position on slider based on keyboard navigation", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default
        style={{ width: "400px" }}
        min={5}
        max={125}
        step={5}
        defaultValue={100}
        onChange={changeSpy}
      />,
    );
    // Focus and press and ArrowRight key
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.value", "105");
    cy.get("@changeSpy").should("have.callCount", 1);

    // Press ArrowLeft key
    cy.findByRole("slider").realPress("ArrowLeft");
    cy.findByRole("slider").should("have.value", "100");
    cy.get("@changeSpy").should("have.callCount", 2);
    // Try to change the previous/previous value
    cy.findByRole("slider").realPress("ArrowLeft");
    cy.findByRole("slider").should("have.value", "100");
    cy.get("@changeSpy").should("have.callCount", 2);

    // Press End key
    cy.findByRole("slider").realPress("End");
    cy.findByRole("slider").should("have.value", "125");
    cy.get("@changeSpy").should("have.callCount", 3);
    // Try to change the maximum/previous value
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.value", "125");
    cy.get("@changeSpy").should("have.callCount", 3);

    // Press Home key
    cy.findByRole("slider").realPress("Home");
    cy.findByRole("slider").should("have.value", "5");
    cy.get("@changeSpy").should("have.callCount", 4);

    // Press PageUp key
    cy.findByRole("slider").focus().realPress("PageUp");
    // It should have a greater step increase
    cy.findByRole("slider").should("have.value", "15");

    // Press PageDown key
    cy.findByRole("slider").focus().realPress("PageDown");
    // It should have a greater step decrease
    cy.findByRole("slider").should("have.value", "5");
  });

  it("should move the thumb in larger increments when step multiplier is increased", () => {
    cy.mount(
      <Default
        defaultValue={10}
        min={0}
        max={30}
        stepMultiplier={10}
        style={{ width: "400px" }}
      />,
    );

    // Focus and move first thumb
    cy.findByRole("slider").focus().realPress("PageUp");
    cy.findByRole("slider").should("have.value", "20");
  });

  it("should allow dragging to change values", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default
        style={{ width: "400px" }}
        min={0}
        max={10}
        default={5}
        onChange={changeSpy}
      />,
    );

    // Drag the thumb
    cy.findByTestId("sliderThumb").trigger("pointerdown");
    cy.findByTestId("sliderThumb").trigger("pointermove", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.findByTestId("sliderThumb").trigger("pointerup");
    // Value should be updated
    cy.findByRole("slider").should("have.value", "9");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      9,
    );
  });

  it("should display a tooltip on pointerover with correct value", () => {
    cy.mount(<Default style={{ width: "400px" }} defaultValue={2} />);
    cy.findByTestId("sliderThumb").trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("be.visible");
    cy.findByTestId("sliderTooltip").should("have.text", "2");
    // And hide tooltip on pointerout
    cy.findByTestId("sliderThumb").trigger("pointerout");
    cy.findByTestId("sliderTooltip").should("not.be.visible");
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

    cy.findByTestId("sliderTrack").should(
      "not.have.class",
      ".saltSlider-inlineLabels",
    );
  });

  it("should not allow the thumb to go beyond min and max values", () => {
    cy.mount(<Default style={{ width: "400px" }} min={5} max={20} />);

    // Focus the thumb, press the Home key and then Arrow Left
    cy.findByRole("slider").focus().realPress("Home");
    cy.findByRole("slider").focus().realPress("ArrowLeft");
    // Thumb shouldn't go less than min
    cy.findByRole("slider").should("have.attr", "aria-valuenow", "5");

    // Focus the thumb, press the End key and then Arrow Right
    cy.findByRole("slider").focus().realPress("End");
    cy.findByRole("slider").focus().realPress("ArrowRight");
    // Thumb shouldn't go less than min
    cy.findByRole("slider").should("have.attr", "aria-valuenow", "20");
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
    cy.mount(<Default disabled defaultValue={2} />);

    cy.findByRole("slider").should("be.disabled");
  });

  it("should format the tooltip text and min/max labels when a format function is passed", () => {
    cy.mount(
      <Default defaultValue={2} format={(value: number) => `${value}%`} />,
    );

    cy.findByTestId("sliderThumb").trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("be.visible");
    cy.findByTestId("sliderTooltip").should("have.text", "2%");
  });

  describe("WHEN it is mounted as an uncontrolled component", () => {
    it("should respect the default values", () => {
      cy.mount(<Default min={0} max={10} defaultValue={4} />);
      cy.findByRole("slider").should("have.value", 4);
    });

    it("should update value when the thumb is moved", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <Default min={0} max={10} defaultValue={4} onChange={changeSpy} />,
      );

      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        5,
      );
      cy.findByRole("slider").should("have.value", 5);
    });
  });

  describe("WHEN it is mounted as a controlled component", () => {
    it("should set the specified value", () => {
      cy.mount(<Default min={0} max={10} value={4} />);
      cy.findByRole("slider").should("have.value", 4);
    });

    it("should call onChange when updated", () => {
      const changeSpy = cy.stub().as("changeSpy");

      function ControlledSlider() {
        const [value, setValue] = useState<number>(3);
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          setValue(Number.parseFloat(event.target.value));
          changeSpy(event);
        };
        return <Default value={value} onChange={onChange} />;
      }

      cy.mount(<ControlledSlider />);
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.get("@changeSpy").should("have.been.calledWithMatch", {
        target: { value: "4" },
      });
    });
  });
});
