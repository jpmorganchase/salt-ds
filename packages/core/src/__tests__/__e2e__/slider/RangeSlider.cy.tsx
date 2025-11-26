import * as rangeSliderStories from "@stories/range-slider/range-slider.stories";
import { composeStories } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

const composedStories = composeStories(rangeSliderStories);

const { Default } = composedStories;

describe("Given a Range Slider", () => {
  it("should render with default props", () => {
    cy.mount(<Default />);

    cy.findAllByRole("slider").should("exist");
    cy.findAllByRole("slider").eq(0).should("have.value", "0");
    cy.findAllByRole("slider").eq(1).should("have.value", "50");
  });

  it("should trigger onChange when clicked on the track", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default defaultValue={[0, 2]} onChange={changeSpy} min={0} max={10} />,
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
        onChangeEnd={changeEndSpy}
        defaultValue={[0, 1]}
        min={0}
        max={10}
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
    cy.mount(<Default onChangeEnd={changeEndSpy} min={0} max={10} />);

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
      <Default min={0} max={10} default={[0, 1]} onChange={changeSpy} />,
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
      clientX: 540,
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
      <Default defaultValue={[4, 8]} min={0} max={30} onChange={changeSpy} />,
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

  it("should not trigger change events if non-interactive keyboard keys are pressed", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default onChange={changeSpy} onChangeEnd={changeEndSpy} />);

    cy.findAllByRole("slider").eq(0).focus().realPress("Space");
    cy.get("@changeSpy").should("not.have.been.called");
    cy.get("@changeEndSpy").should("not.have.been.called");
  });

  it("should move the thumb in larger increments when step multiplier is increased", () => {
    cy.mount(
      <Default defaultValue={[0, 30]} min={0} max={30} stepMultiplier={10} />,
    );

    // Focus and move first thumb
    cy.findAllByRole("slider").eq(0).focus().realPress("PageUp");
    cy.findAllByRole("slider").eq(0).should("have.value", "10");

    // Focus and move second thumb
    cy.findAllByRole("slider").eq(1).focus().realPress("PageDown");
    cy.findAllByRole("slider").eq(1).should("have.value", "20");
  });

  it("should not allow thumbs to cross each other", () => {
    cy.mount(<Default defaultValue={[4, 8]} min={0} max={10} />);

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
    cy.mount(<Default min={0} max={10} defaultValue={[-10, 10]} />);
    cy.findAllByRole("slider").eq(0).should("have.value", 0);
  });

  it("should set range slider value to maximum if default value is greater than maximum", () => {
    cy.mount(<Default min={0} max={10} defaultValue={[5, 100]} />);
    cy.findAllByRole("slider").eq(1).should("have.value", 10);
  });

  it("should round the range slider value to the next step value if default value is not a multiple of the step", () => {
    cy.mount(<Default min={0} max={10} defaultValue={[1.5, 4.5]} />);
    cy.findAllByRole("slider").eq(0).should("have.value", 2);
    cy.findAllByRole("slider").eq(1).should("have.value", 5);
  });

  it("should display a tooltip with correct value only when thumb is hovered", () => {
    cy.mount(<Default defaultValue={[2, 5]} min={0} max={10} />);

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
      <Default defaultValue={[2, 4]} min={0} max={10} showTooltip={false} />,
    );
    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("not.exist");
  });

  it("should confine slider values to marks when restrictToMarks is enabled", () => {
    cy.mount(
      <Default
        defaultValue={[0, 14]}
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
        marks={[
          { value: 2, label: "2" },
          { value: 3, label: "3" },
        ]}
        minLabel="Very low"
        maxLabel="Very high"
        min={0}
        max={10}
      />,
    );

    cy.findByText("Very low").should("exist");
    cy.findByText("Very high").should("exist");
    cy.findAllByTestId("mark").eq(0).should("have.text", "2");
    cy.findAllByTestId("mark").eq(1).should("have.text", "3");
  });

  it("should render custom min max labels when passed", () => {
    cy.mount(
      <Default minLabel={"Custom Min Label"} maxLabel={"Custom Max Label"} />,
    );

    cy.findByText("Custom Min Label").should("exist");
    cy.findByText("Custom Max Label").should("exist");
  });

  it("should be disabled when set and should not receive focus when disabled", () => {
    cy.mount(<Default disabled />);

    cy.findAllByRole("slider").should("be.disabled");
    cy.realPress("Tab");
    cy.findAllByRole("slider").eq(0).should("not.be.focused");
    cy.findAllByRole("slider").eq(1).should("not.be.focused");
  });

  it("should format the tooltip text and min/max labels when a format function is passed", () => {
    cy.mount(<Default format={(value: number) => `${value}%`} />);

    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerover");
    cy.findAllByTestId("sliderTooltip").eq(0).should("be.visible");
    cy.findAllByTestId("sliderTooltip").eq(0).should("have.text", "0%");

    cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerout");

    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointerover");
    cy.findAllByTestId("sliderTooltip").eq(1).should("be.visible");
    cy.findAllByTestId("sliderTooltip").eq(1).should("have.text", "50%");
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
          changeSpy(event, value);
        };
        const onChangeEnd = (
          event: ChangeEvent<HTMLInputElement>,
          value: [number, number],
        ) => {
          changeEndSpy(event, value);
        };

        return (
          <Default
            value={value}
            onChange={onChange}
            onChangeEnd={onChangeEnd}
            min={0}
            max={10}
          />
        );
      }

      cy.mount(<ControlledSlider />);
      cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
      cy.get("@changeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match.any,
        [4, 5],
      );
      cy.get("@changeEndSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match.any,
        [4, 5],
      );
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
      cy.get("@changeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match.any,
        [4, 6],
      );
      cy.get("@changeEndSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match.any,
        [4, 6],
      );
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

  describe("WHEN focused", () => {
    it("should display a focus ring on the first thumb when focused via Tab key", () => {
      cy.mount(<Default />);
      // First tab
      cy.realPress("Tab");
      // First thumb focused
      cy.findAllByRole("slider").eq(0).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("have.class", "saltSliderThumb-focusVisible");
      // Second tab
      cy.realPress("Tab");
      // Second thumb focused
      cy.findAllByRole("slider").eq(1).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("have.class", "saltSliderThumb-focusVisible");
    });

    it("should display a focus ring after losing and regaining focus", () => {
      cy.mount(<Default />);

      // Focus first thumb
      cy.findAllByRole("slider").eq(0).focus();
      // Should display focus ring
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("have.class", "saltSliderThumb-focusVisible");
      // Focus away from first thumb
      cy.realPress("Tab");
      // Should not display focus ring on first thumb
      cy.findAllByRole("slider").eq(0).should("not.have.focus");
      // Focus back to first thumb
      cy.realPress(["Shift", "Tab"]);
      // Should display focus ring on first thumb again
      cy.findAllByRole("slider").eq(0).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("have.class", "saltSliderThumb-focusVisible");
    });

    it("should have a focus ring when focused and navigated via keyboard", () => {
      const changeSpy = cy.stub().as("changeSpy");

      cy.mount(<Default onChange={changeSpy} min={0} max={10} />);

      // Focus and navigate first thumb
      cy.findAllByRole("slider").eq(0).focus().realPress("ArrowRight");
      // First thumb should display focus ring
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("have.class", "saltSliderThumb-focusVisible");
      // Second thumb should not display focus ring
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      cy.get("@changeSpy").should("have.callCount", 1);

      // Focus and navigate second thumb
      cy.findAllByRole("slider").eq(1).focus().realPress("ArrowRight");
      // Second thumb should display focus ring
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("have.class", "saltSliderThumb-focusVisible");
      // First thumb should not display focus ring
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      cy.get("@changeSpy").should("have.callCount", 2);
    });

    it("should have focus but not display a focus ring when clicked and dragged via mouse", () => {
      cy.mount(<Default min={0} max={10} />);

      // Click and drag first thumb
      cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerdown");
      cy.findAllByTestId("sliderThumb").eq(0).trigger("pointermove", {
        button: 0,
        clientX: 750,
        clientY: 50,
      });
      // First thumb should be focused but should not display a focus ring
      cy.findAllByRole("slider").eq(0).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      // Second thumb should not be focused nor should it display a focus ring
      cy.findAllByRole("slider").eq(1).should("not.have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
    });

    it("should have focus but not display a focus ring when clicked on the thumb without dragging", () => {
      const changeSpy = cy.stub().as("changeSpy");

      cy.mount(<Default onChange={changeSpy} />);
      // Click on the first thumb
      cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerdown");
      // First thumb should have focus but should not display a focus ring
      cy.findAllByRole("slider").eq(0).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      // Second thumb should not have focus nor should it display a focus ring
      cy.findAllByRole("slider").eq(1).should("not.have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      cy.get("@changeSpy").should("have.callCount", 0);

      // Click on the second thumb
      cy.findAllByTestId("sliderThumb").eq(1).trigger("pointerdown");
      // Second thumb should have focus but should not display a focus ring
      cy.findAllByRole("slider").eq(1).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      // First thumb should not have focus nor should it display a focus ring
      cy.findAllByRole("slider").eq(0).should("not.have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      cy.get("@changeSpy").should("have.callCount", 0);
    });

    it("should have focus on closest thumb but not display a focus ring when clicked on the track without dragging", () => {
      const changeSpy = cy.stub().as("changeSpy");

      cy.mount(<Default onChange={changeSpy} />);
      // Click on the track
      cy.get(".saltSliderTrack-rail").trigger("pointerdown", {
        button: 0,
        clientX: 750,
        clientY: 50,
      });
      // Second thumb should have focus but should not display a focus ring
      cy.findAllByRole("slider").eq(1).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      cy.get("@changeSpy").should("have.callCount", 0);
    });

    it("should allow keyboard navigation after mouse interaction with correct focus visible behaviour", () => {
      const changeSpy = cy.stub().as("changeSpy");

      cy.mount(
        <Default onChange={changeSpy} defaultValue={[0, 8]} min={0} max={10} />,
      );
      // Click and drag first thumb
      cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerdown");
      cy.findAllByTestId("sliderThumb").eq(0).trigger("pointermove", {
        button: 0,
        clientX: 650,
        clientY: 50,
      });
      cy.findAllByTestId("sliderThumb").eq(0).trigger("pointerup");
      // First thumb should retain focus
      cy.findAllByRole("slider").eq(0).should("have.focus");
      // Second thumb should not have focus
      cy.findAllByRole("slider").eq(1).should("not.have.focus");
      // onChange should be called
      cy.get("@changeSpy").should("have.callCount", 1);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        Cypress.sinon.match.array.deepEquals([5, 8]),
      );
      // Focus ring should not be visible on both thumbs
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      // Tooltip should not be visible
      cy.findAllByTestId("sliderTooltip").eq(0).should("not.be.visible");
      cy.findAllByTestId("sliderTooltip").eq(1).should("not.be.visible");

      // Navigate via keyboard without manually focusing
      cy.realPress("ArrowRight");
      // onChange should be called
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        Cypress.sinon.match.array.deepEquals([6, 8]),
      );
      cy.get("@changeSpy").should("have.callCount", 2);
      // Focus ring should be visible on first thumb but not on the second thumb
      cy.findAllByTestId("sliderThumb")
        .eq(0)
        .should("have.class", "saltSliderThumb-focusVisible");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("not.have.class", "saltSliderThumb-focusVisible");
      // Tooltip for first thumb should be visible
      cy.findAllByTestId("sliderTooltip").eq(0).should("be.visible");
      cy.findAllByTestId("sliderTooltip").eq(1).should("not.be.visible");

      // Pressing Tab should focus the second thumb
      cy.realPress("Tab");
      cy.findAllByRole("slider").eq(1).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("have.class", "saltSliderThumb-focusVisible");
      // Tooltip for second thumb should be visible
      cy.findAllByTestId("sliderTooltip").eq(1).should("be.visible");
      cy.findAllByTestId("sliderTooltip").eq(0).should("not.be.visible");
      // Second thumb be focused and updated via keyboard navigation
      cy.realPress("ArrowRight");
      cy.findAllByRole("slider").eq(1).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("have.class", "saltSliderThumb-focusVisible");
      cy.get("@changeSpy").should("have.callCount", 3);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        Cypress.sinon.match.array.deepEquals([6, 9]),
      );

      // Tab away from the slider
      cy.realPress("Tab");
      // Tab back to the slider on the second thumb
      cy.realPress(["Shift", "Tab"]);
      cy.findAllByRole("slider").eq(1).should("have.focus");
      cy.findAllByTestId("sliderThumb")
        .eq(1)
        .should("have.class", "saltSliderThumb-focusVisible");
      // Navigate the second thumb
      cy.realPress("ArrowLeft");
      cy.get("@changeSpy").should("have.callCount", 4);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        Cypress.sinon.match.array.deepEquals([6, 8]),
      );
    });
  });

  it("should update value while dragging second thumb with left mouse and stop after pointerup", () => {
    cy.mount(<Default min={0} max={10} defaultValue={[0, 1]} />);
    cy.findAllByTestId("sliderThumb")
      .eq(1)
      .trigger("pointerdown", { pointerType: "mouse", button: 0 });
    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
      pointerType: "mouse",
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.wait(100);
    cy.findAllByTestId("sliderThumb")
      .eq(1)
      .trigger("pointerup", { pointerType: "mouse", button: 0 });
    cy.findAllByRole("slider")
      .eq(1)
      .invoke("val")
      .then((valAfterDrag) => {
        cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
          pointerType: "mouse",
          button: 0,
          clientX: 800,
          clientY: 50,
        });
        cy.wait(100);
        cy.findAllByRole("slider")
          .eq(1)
          .invoke("val")
          .should("eq", valAfterDrag);
        expect(Number(valAfterDrag)).to.be.greaterThan(1);
      });
  });

  it("should update value while dragging second thumb with touch and stop after pointerup", () => {
    cy.mount(<Default min={0} max={10} defaultValue={[0, 1]} />);
    cy.findAllByTestId("sliderThumb")
      .eq(1)
      .trigger("pointerdown", { pointerType: "touch" });
    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
      pointerType: "touch",
      clientX: 750,
      clientY: 50,
    });
    cy.wait(100);
    cy.findAllByTestId("sliderThumb")
      .eq(1)
      .trigger("pointerup", { pointerType: "touch" });
    cy.findAllByRole("slider")
      .eq(1)
      .invoke("val")
      .then((valAfterDrag) => {
        cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
          pointerType: "touch",
          clientX: 800,
          clientY: 50,
        });
        cy.wait(100);
        cy.findAllByRole("slider")
          .eq(1)
          .invoke("val")
          .should("eq", valAfterDrag);
        expect(Number(valAfterDrag)).to.be.greaterThan(1);
      });
  });

  it("should stop updating value after pointerup for second thumb", () => {
    cy.mount(<Default min={0} max={10} defaultValue={[0, 1]} />);
    cy.findAllByTestId("sliderThumb")
      .eq(1)
      .trigger("pointerdown", { pointerType: "mouse", button: 0 });
    cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
      pointerType: "mouse",
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.findAllByTestId("sliderThumb")
      .eq(1)
      .trigger("pointerup", { pointerType: "mouse", button: 0 });
    cy.findAllByRole("slider")
      .eq(1)
      .invoke("val")
      .then((valAfterDrag) => {
        cy.findAllByTestId("sliderThumb").eq(1).trigger("pointermove", {
          pointerType: "mouse",
          button: 0,
          clientX: 800,
          clientY: 50,
        });
        cy.wait(100);
        cy.findAllByRole("slider")
          .eq(1)
          .invoke("val")
          .should("eq", valAfterDrag);
      });
  });
});
