import * as sliderStories from "@stories/slider/slider.stories";
import { composeStories } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

const composedStories = composeStories(sliderStories);

const { Default } = composedStories;

describe("Given a Slider", () => {
  it("should render with the default props", () => {
    cy.mount(<Default />);

    cy.findByRole("slider").should("exist");
    cy.findByRole("slider").should("have.value", "50");
  });

  it("should fire onChange on pointer down on slider track", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default defaultValue={0} onChange={changeSpy} min={0} max={10} />,
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
      8,
    );
  });

  it("should fire onChangeEnd when user stops dragging", () => {
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default onChangeEnd={changeEndSpy} min={0} max={10} />);
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
      5,
    );
  });

  it("should trigger onChangeEnd during keyboard navigation", () => {
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default onChangeEnd={changeEndSpy} min={0} max={10} />);

    // Focus and press ArrowRight key
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.get("@changeEndSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      6,
    );
  });

  it("should change the thumb position on slider based on keyboard navigation", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Default
        min={5}
        max={125}
        step={5}
        defaultValue={100}
        onChange={changeSpy}
      />,
    );
    // Focus and press ArrowRight key
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.value", "105");
    cy.get("@changeSpy").should("have.callCount", 1);

    // Press ArrowLeft key
    cy.findByRole("slider").realPress("ArrowLeft");
    cy.findByRole("slider").should("have.value", "100");
    cy.get("@changeSpy").should("have.callCount", 2);

    // Press PageUp key
    cy.findByRole("slider").focus().realPress("PageUp");
    // It should have a greater step increase
    cy.findByRole("slider").should("have.value", "110");
    cy.get("@changeSpy").should("have.callCount", 3);

    // Press PageDown key
    cy.findByRole("slider").focus().realPress("PageDown");
    // It should have a greater step decrease
    cy.findByRole("slider").should("have.value", "100");
    cy.get("@changeSpy").should("have.callCount", 4);

    // Press Home key
    cy.findByRole("slider").realPress("Home");
    cy.findByRole("slider").should("have.value", "5");
    cy.get("@changeSpy").should("have.callCount", 5);

    // // Press End key
    cy.findByRole("slider").realPress("End");
    cy.findByRole("slider").should("have.value", "125");
    cy.get("@changeSpy").should("have.callCount", 6);
  });

  it("should not trigger change events if non-interactive keyboard keys are pressed", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default onChange={changeSpy} onChangeEnd={changeEndSpy} />);

    cy.findByRole("slider").focus().realPress("Space");
    cy.get("@changeSpy").should("not.have.been.called");
    cy.get("@changeEndSpy").should("not.have.been.called");
  });

  it("should move the thumb in larger increments when step multiplier is increased", () => {
    cy.mount(
      <Default defaultValue={10} min={0} max={30} stepMultiplier={10} />,
    );

    // Focus and move first thumb
    cy.findByRole("slider").focus().realPress("PageUp");
    cy.findByRole("slider").should("have.value", "20");
  });

  it("should allow dragging to change values", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default min={0} max={10} default={5} onChange={changeSpy} />);
    // Drag the thumb
    cy.findByTestId("sliderThumb").trigger("pointerdown");
    cy.findByTestId("sliderThumb").trigger("pointermove", {
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.findByTestId("sliderThumb").trigger("pointerup");
    // Value should be updated
    cy.findByRole("slider").should("have.value", "8");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      8,
    );
  });

  it("should display a tooltip on pointerover with correct value", () => {
    cy.mount(<Default defaultValue={2} min={0} max={10} />);
    cy.findByTestId("sliderThumb").trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("be.visible");
    cy.findByTestId("sliderTooltip").should("have.text", "2");
    // And hide tooltip on pointerout
    cy.findByTestId("sliderThumb").trigger("pointerout");
    cy.findByTestId("sliderTooltip").should("not.be.visible");
  });

  it("should not show tooltip when showTooltip is set to false", () => {
    cy.mount(<Default defaultValue={2} showTooltip={false} />);
    cy.findByTestId("sliderThumb").trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("not.exist");
  });

  it("should confine slider values to marks when restrictToMarks is enabled", () => {
    cy.mount(
      <Default
        defaultValue={0}
        min={0}
        max={10}
        restrictToMarks={true}
        marks={[
          { value: 2, label: "2" },
          { value: 5, label: "5" },
          { value: 9, label: "9" },
        ]}
      />,
    );

    cy.findByRole("slider").should("have.value", "2");
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.value", "5");
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.value", "9");

    // Reverse
    cy.findByRole("slider").focus().realPress("ArrowLeft");
    cy.findByRole("slider").should("have.value", "5");
    cy.findByRole("slider").focus().realPress("ArrowLeft");
    cy.findByRole("slider").should("have.value", "2");
    cy.findByRole("slider").focus().realPress("ArrowLeft");
    cy.findByRole("slider").should("have.value", "2");
  });

  it("should render inline min/max labels and marks when provided", () => {
    cy.mount(
      <Default
        min={0}
        max={10}
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

  it("should not allow the thumb to go beyond min and max values", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(
      <Default
        min={5}
        max={20}
        onChange={changeSpy}
        onChangeEnd={changeEndSpy}
      />,
    );
    // Focus the thumb, press the Home key and then Arrow Left.
    cy.findByRole("slider").focus().realPress("Home");
    cy.findByRole("slider").focus().realPress("ArrowLeft");
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get("@changeEndSpy").should("have.callCount", 1);
    // Thumb shouldn't go less than min and onChange and onChangeEnd should not be called
    cy.findByRole("slider").should("have.attr", "aria-valuenow", "5");
    cy.get("@changeSpy").should("have.callCount", 1);
    cy.get("@changeEndSpy").should("have.callCount", 1);

    // Focus the thumb, press the End key and then Arrow Right
    cy.findByRole("slider").focus().realPress("End");
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.get("@changeSpy").should("have.callCount", 2);
    cy.get("@changeEndSpy").should("have.callCount", 2);
    // Thumb shouldn't go less than min and onChange and onChangeEnd should not be called
    cy.findByRole("slider").should("have.attr", "aria-valuenow", "20");
    cy.get("@changeSpy").should("have.callCount", 2);
    cy.get("@changeEndSpy").should("have.callCount", 2);
  });

  it("should set slider value to minimum if default value is less than minimum", () => {
    cy.mount(<Default min={0} max={10} defaultValue={-10} />);
    cy.findByRole("slider").should("have.value", 0);
  });

  it("should set slider value to maximum if default value is greater than maximum", () => {
    cy.mount(<Default min={0} max={10} defaultValue={100} />);
    cy.findByRole("slider").should("have.value", 10);
  });

  it("should round the slider value to the next step value if default value is not a multiple of the step", () => {
    cy.mount(<Default min={0} max={10} defaultValue={1.5} />);
    cy.findByRole("slider").should("have.value", 2);
  });

  it("should render min max labels when passed", () => {
    cy.mount(
      <Default minLabel={"Custom Min Label"} maxLabel={"Custom Max Label"} />,
    );

    cy.findByText("Custom Min Label").should("exist");
    cy.findByText("Custom Max Label").should("exist");
  });

  it("should be disabled when set and should not receive focus when disabled", () => {
    cy.mount(<Default disabled defaultValue={2} />);

    cy.findByRole("slider").should("be.disabled");
    cy.realPress("Tab");
    cy.findByRole("slider").should("not.be.focused");
  });

  it("should format the tooltip text when a format function is passed", () => {
    cy.mount(
      <Default defaultValue={2} format={(value: number) => `${value}%`} />,
    );

    cy.findByTestId("sliderThumb").trigger("pointerover");
    cy.findByTestId("sliderTooltip").should("be.visible");
    cy.findByTestId("sliderTooltip").should("have.text", "2%");
  });

  it("should round to the decimal places provided", () => {
    cy.mount(
      <Default
        min={0}
        max={4.3}
        step={0.375}
        decimalPlaces={2}
        defaultValue={0}
      />,
    );

    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.attr", "value", 0.38);
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.attr", "value", 0.75);
    cy.findByRole("slider").focus().realPress("ArrowRight");
    cy.findByRole("slider").should("have.attr", "value", 1.13);
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

    it("should call onChange and onChangeEnd when updated", () => {
      const changeSpy = cy.stub().as("changeSpy");
      const changeEndSpy = cy.stub().as("changeEndSpy");

      function ControlledSlider() {
        const [value, setValue] = useState<number>(3);
        const onChange = (
          event: ChangeEvent<HTMLInputElement>,
          value: number,
        ) => {
          setValue(value);
          changeSpy(event, value);
        };
        const onChangeEnd = (
          event: ChangeEvent<HTMLInputElement>,
          value: number,
        ) => {
          setValue(value);
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
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        4,
      );
      cy.get("@changeEndSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        4,
      );
    });
  });

  describe("WHEN step is not a multiple of the range", () => {
    it("should only have values that are allowed, multiple of steps", () => {
      cy.mount(<Default min={0} max={1} step={0.3} defaultValue={0} />);

      // Keyboard navigation forward
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.findByRole("slider").should("have.value", 0.3);
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.findByRole("slider").should("have.value", 0.6);
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.findByRole("slider").should("have.value", 0.9);
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.findByRole("slider").should("have.value", 0.9);

      // Keyboard navigation backward
      cy.findByRole("slider").focus().realPress("ArrowLeft");
      cy.findByRole("slider").should("have.value", 0.6);
      cy.findByRole("slider").focus().realPress("ArrowLeft");
      cy.findByRole("slider").should("have.value", 0.3);
      cy.findByRole("slider").focus().realPress("ArrowLeft");
      cy.findByRole("slider").should("have.value", 0);
    });
  });

  describe("WHEN focused", () => {
    it("should display a focus ring when focused via Tab key", () => {
      cy.mount(<Default />);
      cy.realPress("Tab");
      cy.findByRole("slider").should("have.focus");
      cy.findByTestId("sliderThumb").should(
        "have.class",
        "saltSliderThumb-focusVisible",
      );
    });

    it("should display a focus ring after losing and regaining focus", () => {
      cy.mount(<Default />);
      cy.findByRole("slider").focus();
      cy.findByTestId("sliderThumb").should(
        "have.class",
        "saltSliderThumb-focusVisible",
      );
      cy.realPress("Tab");
      cy.findByRole("slider").should("not.have.focus");
      cy.findByTestId("sliderThumb").should(
        "not.have.class",
        "saltSliderThumb-focusVisible",
      );
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("slider").should("have.focus");
      cy.findByTestId("sliderThumb").should(
        "have.class",
        "saltSliderThumb-focusVisible",
      );
    });

    it("should have a focus ring when focused and navigated via keyboard", () => {
      cy.mount(<Default />);

      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.findByTestId("sliderThumb").should(
        "have.class",
        "saltSliderThumb-focusVisible",
      );
    });

    it("should have focus but not display a focus ring when clicked and dragged via mouse", () => {
      cy.mount(<Default min={0} max={10} />);

      cy.findByTestId("sliderThumb").trigger("pointerdown");
      cy.findByTestId("sliderThumb").trigger("pointermove", {
        button: 0,
        clientX: 750,
        clientY: 50,
      });
      cy.findByRole("slider").should("have.focus");
      cy.findByTestId("sliderThumb").should(
        "not.have.class",
        "saltSliderThumb-focusVisible",
      );
    });

    it("should have focus but not display a focus ring when clicked without dragging", () => {
      cy.mount(<Default />);
      cy.findByTestId("sliderThumb").trigger("pointerdown");
      cy.findByRole("slider").should("have.focus");
      cy.findByTestId("sliderThumb").should(
        "not.have.class",
        "saltSliderThumb-focusVisible",
      );
    });

    it("should allow keyboard navigation after mouse interaction with correct focus visible behaviour", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<Default onChange={changeSpy} min={0} max={10} />);

      // Click and drag slider via mouse
      cy.findByTestId("sliderThumb").trigger("pointerdown");
      cy.findByTestId("sliderThumb").trigger("pointermove", {
        button: 0,
        clientX: 700,
        clientY: 50,
      });
      cy.findByTestId("sliderThumb").trigger("pointerup");
      // Slider should retain focus
      cy.findByRole("slider").should("have.focus");
      // onChange should be called
      cy.get("@changeSpy").should("have.callCount", 1);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        7,
      );
      // Focus ring should not be visible
      cy.findByTestId("sliderThumb").should(
        "not.have.class",
        "saltSliderThumb-focusVisible",
      );
      // Tooltip should not be visible
      cy.findByTestId("sliderTooltip").should("not.be.visible");

      // Navigate via keyboard without manually focusing
      cy.realPress("ArrowRight");
      // onChange should be called
      cy.get("@changeSpy").should("have.callCount", 2);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        8,
      );
      // Focus ring should be visible
      cy.findByTestId("sliderThumb").should(
        "have.class",
        "saltSliderThumb-focusVisible",
      );
      // Tab away from the slider
      cy.realPress("Tab");
      // Tab back to the slider
      cy.realPress(["Shift", "Tab"]);
      cy.realPress("ArrowRight");
      cy.get("@changeSpy").should("have.callCount", 3);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        9,
      );
      // Tooltip should be visible
      cy.findByTestId("sliderTooltip").should("be.visible");
    });
  });

  it("should update value while dragging with left mouse and stop after pointerup", () => {
    cy.mount(<Default min={0} max={10} defaultValue={1} />);
    cy.findByTestId("sliderThumb").trigger("pointerdown", {
      pointerType: "mouse",
      button: 0,
    });
    cy.findByTestId("sliderThumb").trigger("pointermove", {
      pointerType: "mouse",
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.wait(100);
    cy.findByTestId("sliderThumb").trigger("pointerup", {
      pointerType: "mouse",
      button: 0,
    });
    cy.findByRole("slider")
      .invoke("val")
      .then((valAfterDrag) => {
        cy.findByTestId("sliderThumb").trigger("pointermove", {
          pointerType: "mouse",
          button: 0,
          clientX: 800,
          clientY: 50,
        });
        cy.wait(100);
        cy.findByRole("slider").invoke("val").should("eq", valAfterDrag);
        expect(Number(valAfterDrag)).to.be.greaterThan(1);
      });
  });

  it("should update value while dragging with touch and stop after pointerup", () => {
    cy.mount(<Default min={0} max={10} defaultValue={1} />);
    cy.findByTestId("sliderThumb").trigger("pointerdown", {
      pointerType: "touch",
    });
    cy.findByTestId("sliderThumb").trigger("pointermove", {
      pointerType: "touch",
      clientX: 750,
      clientY: 50,
    });
    cy.wait(100);
    cy.findByTestId("sliderThumb").trigger("pointerup", {
      pointerType: "touch",
    });
    cy.findByRole("slider")
      .invoke("val")
      .then((valAfterDrag) => {
        cy.findByTestId("sliderThumb").trigger("pointermove", {
          pointerType: "touch",
          clientX: 800,
          clientY: 50,
        });
        cy.wait(100);
        cy.findByRole("slider").invoke("val").should("eq", valAfterDrag);
        expect(Number(valAfterDrag)).to.be.greaterThan(1);
      });
  });

  it("should stop updating value after pointerup", () => {
    cy.mount(<Default min={0} max={10} defaultValue={1} />);
    cy.findByTestId("sliderThumb").trigger("pointerdown", {
      pointerType: "mouse",
      button: 0,
    });
    cy.findByTestId("sliderThumb").trigger("pointermove", {
      pointerType: "mouse",
      button: 0,
      clientX: 750,
      clientY: 50,
    });
    cy.findByTestId("sliderThumb").trigger("pointerup", {
      pointerType: "mouse",
      button: 0,
    });
    cy.findByRole("slider")
      .invoke("val")
      .then((valAfterDrag) => {
        cy.findByTestId("sliderThumb").trigger("pointermove", {
          pointerType: "mouse",
          button: 0,
          clientX: 800,
          clientY: 50,
        });
        cy.wait(100);
        cy.findByRole("slider").invoke("val").should("eq", valAfterDrag);
      });
  });
});
