import * as rangeSliderStories from "@stories/range-slider/range-slider.stories";
import { composeStories } from "@storybook/react";
import { type ChangeEvent, useState } from "react";

const composedStories = composeStories(rangeSliderStories);

const { Default } = composedStories;

describe("Given a Range Slider", () => {
  it("should render with default props", () => {
    cy.mount(<Default />);

    cy.findAllByRole("slider").should("exist");
    cy.findAllByRole("slider").eq(0).should("have.value", "0");
    cy.findAllByRole("slider").eq(1).should("have.value", "5");
  });

  it("should trigger onChange when clicked on the track", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default
        style={{ width: "400px" }}
        defaultValue={[0, 2]}
        onChange={changeSpy}
      />,
    );
    cy.get(".saltSliderTrack-rail").trigger("pointerdown", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([0, 8]),
    );
    cy.get(".saltSliderTrack-rail").trigger("pointerup");
  });

  it("should trigger onChangeEnd with the final value when user stops dragging", () => {
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(
      <Default
        style={{ width: "400px" }}
        onChangeEnd={changeEndSpy}
        defaultValue={[0, 1]}
      />,
    );
    cy.get(".saltSliderTrack-rail").trigger("pointerdown", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    // onChangeEnd is not called when dragging
    cy.get("@changeEndSpy").should("have.callCount", 0);
    // onChangeEnd is called when dragging stops
    cy.get(".saltSliderTrack-rail").trigger("pointerup");
    cy.get("@changeEndSpy").should("have.callCount", 1);
    cy.get("@changeEndSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([0, 8]),
    );
  });

  it("should trigger onChangeEnd during keyboard navigation", () => {
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default style={{ width: "400px" }} onChangeEnd={changeEndSpy} />);

    // Focus second thumb and press ArrowRight key
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
    cy.get("@changeEndSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([0, 6]),
    );
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
    cy.findAllByRole("slider").eq(1).should("have.value", "8");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([0, 8]),
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
    cy.findAllByRole("slider").eq(0).should("have.value", "3");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals([3, 8]),
    );
  });

  it("should change thumb positions based on keyboard navigation", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default
        defaultValue={[4, 8]}
        min={0}
        max={30}
        onChange={changeSpy}
        style={{ width: "400px" }}
      />,
    );

    // Focus first thumb and press ArrowRight key
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(0).should("have.value", "5");
    cy.get("@changeSpy").should("have.callCount", 1);

    // Focus second thumb and press ArrowLeft key
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
    cy.findAllByRole("slider").eq(1).should("have.value", "7");
    cy.get("@changeSpy").should("have.callCount", 2);

    // Focus first thumb and press and Home key
    cy.findAllByRole("slider").eq(0).focus().realPress("Home");
    cy.findAllByRole("slider").eq(0).should("have.value", "0");
    cy.get("@changeSpy").should("have.callCount", 3);

    // Focus second thumb and press and End key
    cy.findAllByRole("slider").eq(1).focus().realPress("End");
    cy.findAllByRole("slider").eq(1).should("have.value", "30");
    cy.get("@changeSpy").should("have.callCount", 4);

    // Focus first thumb and press and Page Up key
    cy.findAllByRole("slider").eq(0).focus().realPress("PageUp");
    // It should have a greater step increase
    cy.findAllByRole("slider").eq(0).should("have.value", "2");
    cy.get("@changeSpy").should("have.callCount", 5);

    // Focus second thumb and press and Page Down key
    cy.findAllByRole("slider").eq(1).focus().realPress("PageDown");
    // It should have a greater step decrease
    cy.findAllByRole("slider").eq(1).should("have.value", "28");
    cy.get("@changeSpy").should("have.callCount", 6);
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

  it("should not allow thumbs to cross each other", () => {
    cy.mount(<Default defaultValue={[4, 8]} style={{ width: "400px" }} />);

    // Focus first thumb and press and End key
    cy.findAllByRole("slider").eq(0).focus().realPress("End");
    cy.findAllByRole("slider").eq(0).should("have.value", "8");

    // Focus second thumb and press and Home key
    cy.findAllByRole("slider").eq(1).focus().realPress("Home");
    cy.findAllByRole("slider").eq(1).should("have.value", "8");
  });

  it("should not allow thumbs to go beyond min and max values", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(
      <Default
        min={2}
        max={9}
        defaultValue={[4, 8]}
        onChange={changeSpy}
        onChangeEnd={changeEndSpy}
        style={{ width: "400px" }}
      />,
    );
    // Focus first thumb, press Home key and then Arrow Left
    cy.findAllByRole("slider").eq(0).focus().realPress("Home");
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowLeft");
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get("@changeEndSpy").should("have.callCount", 1);
    // Thumb shouldn't go less than min and onChange and onChangeEnd should not be called
    cy.findAllByRole("slider").eq(0).should("have.value", "2");
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get("@changeEndSpy").should("have.callCount", 1);

    // Focus second thumb, press End key and then Arrow Right
    cy.findAllByRole("slider").eq(1).focus().realPress("End");
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
    cy.get("@changeSpy").should("have.callCount", 2);
    cy.get("@changeEndSpy").should("have.callCount", 2);
    // Thumb shouldn't go more than max value and onChange and onChangeEnd should not be called
    cy.findAllByRole("slider").eq(1).should("have.value", "9");
    cy.get("@changeSpy").should("have.callCount", 2);
    cy.get("@changeEndSpy").should("have.callCount", 2);
  });

  it("should set range slider value to minimum if default value is less than minimum", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        min={0}
        max={10}
        defaultValue={[-10, 10]}
      />,
    );
    cy.findAllByRole("slider").eq(0).should("have.value", 0);
  });

  it("should set range slider value to maximum if default value is greater than maximum", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        min={0}
        max={10}
        defaultValue={[5, 100]}
      />,
    );
    cy.findAllByRole("slider").eq(1).should("have.value", 10);
  });

  it("should round the range slider value to the next step value if default value is not a multiple of the step", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        min={0}
        max={10}
        defaultValue={[1.5, 4.5]}
      />,
    );
    cy.findAllByRole("slider").eq(0).should("have.value", 2);
    cy.findAllByRole("slider").eq(1).should("have.value", 5);
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

  it("should not show tooltip when showTooltip is set to false", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        defaultValue={[2, 4]}
        showTooltip={false}
      />,
    );
    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("not.exist");
  });

  it("should confine slider values to marks when restrictToMarks is enabled", () => {
    cy.mount(
      <Default
        defaultValue={[0, 14]}
        style={{ width: "400px" }}
        restrictToMarks={true}
        max={20}
        marks={[
          { value: 1, label: "1" },
          { value: 3, label: "3" },
          { value: 5, label: "5" },
          { value: 7, label: "7" },
          { value: 9, label: "9" },
          { value: 15, label: "15" },
          { value: 17, label: "17" },
          { value: 20, label: "20" },
        ]}
      />,
    );

    // Default values of both thumbs should be the nearest mark
    cy.findAllByRole("slider").eq(0).should("have.value", "1");
    cy.findAllByRole("slider").eq(1).should("have.value", "15");

    // Navigate the first thumb, it should jump between marks
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(0).should("have.value", "3");
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(0).should("have.value", "5");
    cy.findAllByRole("slider").eq(0).focus().realPress("PageUp");
    cy.findAllByRole("slider").eq(0).should("have.value", "7");
    cy.findAllByRole("slider").eq(0).focus().realPress("PageDown");
    cy.findAllByRole("slider").eq(0).should("have.value", "5");
    cy.findAllByRole("slider").eq(0).focus().realPress("ArrowLeft");
    cy.findAllByRole("slider").eq(0).should("have.value", "3");

    // Navigate the second thumb, it should jump between marks
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(1).should("have.value", "17");
    cy.findAllByRole("slider").eq(1).focus().realPress("PageUp");
    cy.findAllByRole("slider").eq(1).should("have.value", "20");
    cy.findAllByRole("slider").eq(1).focus().realPress("PageDown");
    cy.findAllByRole("slider").eq(1).should("have.value", "17");
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
    cy.findAllByRole("slider").eq(1).should("have.value", "15");
  });

  it("should render inline min/max labels and marks when provided", () => {
    cy.mount(
      <Default
        style={{ width: "400px" }}
        marks={[
          { value: 2, label: "2" },
          { value: 3, label: "3" },
        ]}
        minLabel="Very low"
        maxLabel="Very high"
      />,
    );

    cy.findByText("Very low").should("exist");
    cy.findByText("Very high").should("exist");
    cy.findAllByTestId("mark").eq(0).should("have.text", "2");
    cy.findAllByTestId("mark").eq(1).should("have.text", "3");
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

  it("should round to the decimal places provided", () => {
    cy.mount(
      <Default
        min={0}
        max={4.3}
        step={0.375}
        decimalPlaces={2}
        defaultValue={[0, 0.375]}
      />,
    );

    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(1).should("have.attr", "value", 0.75);
    cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
    cy.findAllByRole("slider").eq(1).should("have.attr", "value", 1.13);
  });

  describe("WHEN it is mounted as a controlled component", () => {
    it("should set the specified value", () => {
      cy.mount(<Default min={0} max={10} value={[4, 6]} />);
      cy.findAllByRole("slider").eq(0).should("have.value", 4);
      cy.findAllByRole("slider").eq(1).should("have.value", 6);
    });

    it("should call onChange and onChangeEnd when updated", () => {
      const changeSpy = cy.stub().as("changeSpy");
      const changeEndSpy = cy.stub().as("changeEndSpy");

      function ControlledSlider() {
        const [value, setValue] = useState<[number, number]>([3, 5]);
        const onChange = (
          event: ChangeEvent<HTMLInputElement>,
          value: [number, number],
        ) => {
          setValue(value);
          changeSpy(event);
        };
        const onChangeEnd = (
          event: ChangeEvent<HTMLInputElement>,
          value: [number, number],
        ) => {
          changeEndSpy(event);
        };

        return (
          <Default
            value={value}
            onChange={onChange}
            onChangeEnd={onChangeEnd}
          />
        );
      }

      cy.mount(<ControlledSlider />);
      cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
      cy.get("@changeSpy").should("have.been.calledWithMatch", {
        target: { value: "4" },
      });
      cy.get("@changeEndSpy").should("have.been.calledWithMatch", {
        target: { value: "4" },
      });
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
      cy.get("@changeSpy").should("have.been.calledWithMatch", {
        target: { value: "6" },
      });
      cy.get("@changeEndSpy").should("have.been.calledWithMatch", {
        target: { value: "6" },
      });
    });
  });

  describe("WHEN step is not a multiple of the range", () => {
    it("should only have values that are allowed, multiple of steps", () => {
      cy.mount(<Default min={0} max={1} step={0.3} defaultValue={[0, 0.3]} />);

      // Keyboard navigation forward
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
      cy.findAllByRole("slider").eq(1).should("have.value", 0.6);
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
      cy.findAllByRole("slider").eq(1).should("have.value", 0.9);
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
      cy.findAllByRole("slider").eq(1).should("have.value", 0.9);

      // Keyboard navigation backward
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
      cy.findAllByRole("slider").eq(1).should("have.value", 0.6);
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
      cy.findAllByRole("slider").eq(1).should("have.value", 0.3);
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowLeft");
      cy.findAllByRole("slider").eq(1).should("have.value", 0);
    });
  });
});
