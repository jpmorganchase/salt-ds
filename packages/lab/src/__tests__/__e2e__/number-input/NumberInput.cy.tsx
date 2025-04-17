import * as numberInputStories from "@stories/number-input/number-input.stories";
import { composeStories } from "@storybook/react";
import { NumberInput, NumberInputProps } from "../../../number-input";
import { useCallback, useState } from "react";

const composedStories = composeStories(numberInputStories);

const { Default, MinAndMaxValue, ResetAdornment } = composedStories;

describe("Given a NumberInput", () => {
  it("renders with default props", () => {
    cy.mount(<Default />);
    // Verify render with two buttons - increment, and decrement
    cy.findAllByRole("button", { hidden: true }).should("have.length", 2);
    cy.findByRole("spinbutton").should("exist");
    cy.findByRole("spinbutton").should("have.value", "");
    cy.findByLabelText("increment value").should("exist");
    cy.findByLabelText("decrement value").should("exist");
  });

  it("renders with default value", () => {
    cy.mount(<Default defaultValue={"10"} />);
    // Verify render with two buttons - increment, and decrement
    cy.findAllByRole("button", { hidden: true }).should("have.length", 2);
    cy.findByRole("spinbutton").should("exist");
    cy.findByRole("spinbutton").should("have.value", "10");
    cy.findByLabelText("increment value").should("exist");
    cy.findByLabelText("decrement value").should("exist");
  });

  it("renders with no default value but a default start value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default defaultStartValue={99} onValueChange={valueChangeSpy} />);
    // Verify render with no value
    cy.findByRole("spinbutton").should("have.value", "");
    // Simulate clicking increment button
    cy.findByLabelText("increment value").realClick();
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 99, formattedValue: "99", value: "99" },
        { source: "increment" },
      );
    });
  });

  it("increments the default value on button click", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default defaultValue={1} onValueChange={valueChangeSpy} />);
    // Simulate clicking increment button twice
    cy.findByLabelText("increment value").realClick({ clickCount: 2 });
    // Verify the value increments twice
    cy.findByRole("spinbutton").should("have.value", "3");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledTwice");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 2, formattedValue: "2", value: "2" },
        { source: "increment" },
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: 3, formattedValue: "3", value: "3" },
        { source: "increment" },
      );
    });
  });

  it("decrements the default value on button click", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default defaultValue={-1} onValueChange={valueChangeSpy} />);
    // Simulate clicking decrement button twice
    cy.findByLabelText("decrement value").realClick({ clickCount: 2 });
    // Verify the value decrements twice
    cy.findByRole("spinbutton").should("have.value", "-3");
    cy.get("@valueChangeSpy").should("have.been.calledTwice");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: -2, formattedValue: "-2", value: "-2" },
        { source: "decrement" },
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: -3, formattedValue: "-3", value: "-3" },
        { source: "decrement" },
      );
    });
  });

  it("increments from an empty value on button click", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default onValueChange={valueChangeSpy} />);
    // Simulate clearing the value
    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    // Verify the value clears
    cy.findByRole("spinbutton").should("have.value", "");
    // Simulate incrementing the value
    cy.findByLabelText("increment value").realClick({ clickCount: 2 });
    // Verify the value increments
    cy.findByRole("spinbutton").should("have.value", "1");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledTwice");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 0, formattedValue: "0", value: "0" },
        { source: "increment" },
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: 1, formattedValue: "1", value: "1" },
        { source: "increment" },
      );
    });
  });

  it("decrements from an empty value on button click", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default onValueChange={valueChangeSpy} />);
    // Simulate clearing the value
    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    // Verify the value clears
    cy.findByRole("spinbutton").should("have.value", "");
    // Simulate decrementing the value
    cy.findByLabelText("decrement value").realClick({ clickCount: 2 });
    // Verify the value decrements
    cy.findByRole("spinbutton").should("have.value", "-1");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledTwice");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 0, formattedValue: "0", value: "0" },
        { source: "decrement" },
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: -1, formattedValue: "-1", value: "-1" },
        { source: "decrement" },
      );
    });
  });

  it("increments to `1` from an incomplete negative value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default onValueChange={valueChangeSpy} />);
    // Simulate clearing the value
    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    // Simulate typing minus
    cy.realType("-");
    cy.findByRole("spinbutton").should("have.value", "-");
    // Simulate incrementing incomplete value
    cy.findByLabelText("increment value").realClick();
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: undefined, formattedValue: "-", value: "-" },
        { source: "event", event: Cypress.sinon.match.any },
      );
    });
    // Simulate completing the value
    cy.realType("0");
    // Simulate incrementing the complete value
    cy.findByLabelText("increment value").realClick();
    // Verify the value increments
    cy.findByRole("spinbutton").should("have.value", "1");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 3);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: 0, formattedValue: "0", value: "0" },
        { source: "event", event: Cypress.sinon.match.any },
      );
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: 1, formattedValue: "1", value: "1" },
        { source: "increment" },
      );
    });
  });

  it("decrements to `-1` from an incomplete negative value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default onValueChange={valueChangeSpy} />);
    // Simulate clearing the value
    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    // Simulate typing minus
    cy.realType("-");
    cy.findByRole("spinbutton").should("have.value", "-");
    // Simulate decrementing incomplete value
    cy.findByLabelText("decrement value").realClick();
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: undefined, formattedValue: "-", value: "-" },
        { source: "event", event: Cypress.sinon.match.any },
      );
    });
    // Simulate completing the value
    cy.realType("0");
    // Simulate decrementing the complete value
    cy.findByLabelText("decrement value").realClick();
    // Verify the value decrements
    cy.findByRole("spinbutton").should("have.value", "-1");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 3);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: 0, formattedValue: "0", value: "0" },
        { source: "event", event: Cypress.sinon.match.any },
      );
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: -1, formattedValue: "-1", value: "-1" },
        { source: "decrement" },
      );
    });
  });

  it("renders a default value with a specified number of decimal places", () => {
    cy.mount(<Default decimalScale={12} fixedDecimalScale defaultValue={10} />);
    // Verify supports the specified number of decimal places
    cy.findByRole("spinbutton").should("have.value", "10.000000000000");
  });

  it("increments integer value by specified step value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default defaultValue={10} step={10} onValueChange={valueChangeSpy} />,
    );
    // Simulate incrementing the integer value by a specified step
    cy.findByLabelText("increment value").realClick();
    // Verify the integer value increments
    cy.findByRole("spinbutton").should("have.value", "20");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 20, formattedValue: "20", value: "20" },
        { source: "increment" },
      );
    });
  });

  it("increments integer value by specified step value, when value is 0", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={0}
        decimalScale={8}
        fixedDecimalScale
        step={10}
        onValueChange={valueChangeSpy}
      />,
    );
    cy.findByRole("spinbutton").should("have.value", "0.00000000");
    // Simulate incrementing the integer value by a specified step
    cy.findByLabelText("increment value").realClick();
    // Verify the integer value increments
    cy.findByRole("spinbutton").should("have.value", "10.00000000");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        {
          floatValue: 10.0,
          formattedValue: "10.00000000",
          value: "10.00000000",
        },
        { source: "increment" },
      );
    });
  });

  it("increments decimal by specified step value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        decimalScale={8}
        defaultValue={3.15}
        fixedDecimalScale
        step={0.000001}
        onValueChange={valueChangeSpy}
      />,
    );
    // Simulate incrementing the decimal value by a specified step
    cy.findByLabelText("increment value").realClick();
    // Verify the decimal value increments
    cy.findByRole("spinbutton").should("have.value", "3.15000100");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 3.15000100, formattedValue: "3.15000100", value: "3.15000100" },
        { source: "increment" },
      );
    });
  });

  it("increments the value with keyboard controls", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={10}
        step={10}
        stepMultiplier={10}
        min={-2000}
        max={2000}
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate incrementing the value with up arrow
    cy.findByRole("spinbutton").focus().realPress("ArrowUp");
    // verify the step is incremented by step
    cy.findByRole("spinbutton").should("have.value", "20");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 1);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 20, formattedValue: "20", value: "20" },
        { source: "keyboard" },
      );
    });
    // Simulate incrementing the value with page up
    cy.findByRole("spinbutton").realPress("PageUp");
    // verify the step is incremented by step * stepMultiplier
    cy.findByRole("spinbutton").should("have.value", "120");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 2);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: 120, formattedValue: "120", value: "120" },
        { source: "keyboard" },
      );
    });
    // Simulate incrementing the value with shift+arrow up, equivalent to page up
    cy.findByRole("spinbutton").realPress(["Shift", "ArrowUp"]);
    // Verify the step is incremented by step * stepMultiplier
    cy.findByRole("spinbutton").should("have.value", "130");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 3);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: 130, formattedValue: "130", value: "130" },
        { source: "keyboard" },
      );
    });
    // Simulate incrementing the value with end
    cy.findByRole("spinbutton").realPress("End");
    // Verify the step is incremented to the max
    cy.findByRole("spinbutton").should("have.value", "2000");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 4);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(3)).to.have.been.calledWith(
        { floatValue: 2000, formattedValue: "2000", value: "2000" },
        { source: "keyboard" },
      );
    });
  });

  it("decrements integer value by specified step value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default defaultValue={0} step={10} onValueChange={valueChangeSpy} />,
    );
    // Simulate decrementing the integer value by a specified step
    cy.findByLabelText("decrement value").realClick();
    // Verify the integer value decrements
    cy.findByRole("spinbutton").should("have.value", "-10");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: -10, formattedValue: "-10", value: "-10" },
        { source: "decrement" },
      );
    });
  });

  it("decrements decimal by specified step value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        decimalScale={8}
        defaultValue={3.15}
        fixedDecimalScale
        step={0.000001}
        onValueChange={valueChangeSpy}
      />,
    );
    // Simulate decrementing the decimal value by a specified step
    cy.findByLabelText("decrement value").realClick();
    // Verify the decimal value decrements
    cy.findByRole("spinbutton").should("have.value", "3.14999900");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 3.149999, formattedValue: "3.14999900", value: "3.14999900" },
        { source: "decrement" },
      );
    });
  });

  it("decrements decimal by specified step value, when value is 0", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        decimalScale={8}
        defaultValue={0}
        fixedDecimalScale
        step={0.000001}
        onValueChange={valueChangeSpy}
      />,
    );
    cy.findByRole("spinbutton").should("have.value", "0.00000000");
    // Simulate decrementing the decimal value by a specified step
    cy.findByLabelText("decrement value").realClick();
    // Verify the decimal value decrements
    cy.findByRole("spinbutton").should("have.value", "-0.00000100");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: -0.00000100, formattedValue: "-0.00000100", value: "-0.00000100" },
        { source: "decrement" },
      );
    });
  });

  it("decrements the value with keyboard controls", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={20}
        step={10}
        stepMultiplier={10}
        min={-2000}
        max={2000}
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate decrementing the value with up arrow
    cy.findByRole("spinbutton").focus().realPress("ArrowDown");
    cy.findByRole("spinbutton").should("have.value", "10");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 1);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 10, formattedValue: "10", value: "10" },
        { source: "keyboard" },
      );
    });
    // Simulate decrementing the value with page up
    cy.findByRole("spinbutton").realPress("PageDown");
    // verify the step is decremented by step * stepMultiplier
    cy.findByRole("spinbutton").should("have.value", "-90");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 2);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: -90, formattedValue: "-90", value: "-90" },
        { source: "keyboard" },
      );
    });
    // Simulate decrementing the value with shift+arrow down, equivalent to page up
    cy.findByRole("spinbutton").realPress(["Shift", "ArrowDown"]);
    // Verify the step is decremented by step * stepMultiplier
    cy.findByRole("spinbutton").should("have.value", "-100");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 3);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: -100, formattedValue: "-100", value: "-100" },
        { source: "keyboard" },
      );
    });
    // Simulate decrementing the value with home
    cy.findByRole("spinbutton").realPress("Home");
    // Verify the step is incremented to the min
    cy.findByRole("spinbutton").should("have.value", "-2000");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 4);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(3)).to.have.been.calledWith(
        { floatValue: -2000, formattedValue: "-2000", value: "-2000" },
        { source: "keyboard" },
      );
    });
  });

  it("increment to the maximum value and beyond`", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={9}
        max={10}
        step={10}
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate exceeding the max value
    cy.findByLabelText("increment value").realClick();
    cy.findByLabelText("increment value").realClick();
    // Verify the max value is not exceeded
    cy.findByRole("spinbutton").should("have.value", "10");
    // Verify the increment button is disabled
    cy.findByLabelText("increment value").should("be.disabled");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 10, formattedValue: "10", value: "10" },
        { source: "increment" },
      );
    });
  });

  it("decrement to the minimum value and beyond`", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={0}
        min={-1}
        step={10}
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate exceeding the min value
    cy.findByLabelText("decrement value").realClick();
    // Verify the min value is not exceeded
    cy.findByRole("spinbutton").should("have.value", "-1");
    // Verify the decrement button is disabled
    cy.findByLabelText("decrement value").should("be.disabled");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.been.calledOnce");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: -1, formattedValue: "-1", value: "-1" },
        { source: "decrement" },
      );
    });
  });

  it("displays value with correct number of decimal places on blur", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default decimalScale={2} fixedDecimalScale onValueChange={valueChangeSpy} />);

    // Simulate the value is changed and focus is lost
    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-12.235");
    cy.realPress("Tab");
    // Verify the value is formatted after rendering
    cy.findByRole("spinbutton").should("have.value", "-12.23");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 5);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: undefined, formattedValue: "-", value: "-" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: -1.00, formattedValue: "-1.00", value: "-1.00" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: -12.00, formattedValue: "-12.00", value: "-12.00" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(3)).to.have.been.calledWith(
        { floatValue: -12.2, formattedValue: "-12.20", value: "-12.20" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(4)).to.have.been.calledWith(
        { floatValue: -12.23, formattedValue: "-12.23", value: "-12.23" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
    });
  });

  it("limits values to maximum safe integer", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={Number.MAX_SAFE_INTEGER}
        onValueChange={valueChangeSpy}
      />,
    );

    // Verify the max safe integer is shown
    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MAX_SAFE_INTEGER.toString(),
    );
    // Simulate exceeding max safe integer
    cy.findByLabelText("increment value").realClick();
    // Verify there is no change
    cy.findByLabelText("increment value").should("be.disabled");
    cy.get("@valueChangeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MAX_SAFE_INTEGER.toString(),
    );
  });

  it("limits values to min safe integer", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        defaultValue={Number.MIN_SAFE_INTEGER}
        onValueChange={valueChangeSpy}
      />,
    );
    // Verify the min safe integer is shown
    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MIN_SAFE_INTEGER.toString(),
    );
    // Simulate exceeding max safe integer
    cy.findByLabelText("decrement value").realClick();
    // Verify there is no change
    cy.findByLabelText("decrement value").should("be.disabled");
    cy.get("@valueChangeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MIN_SAFE_INTEGER.toString(),
    );
  });

  it("does not decrement below the minimum value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default defaultValue={-1} min={-1} onValueChange={valueChangeSpy} />,
    );

    cy.findByRole("spinbutton").should("have.value", -1);
    // Simulate exceeding minimum value
    cy.findByLabelText("decrement value").realClick();
    // Verify no change
    cy.get("@valueChangeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", -1);
  });

  it("does not increment above the maximum value", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default defaultValue={1} max={1} onValueChange={valueChangeSpy} />,
    );

    cy.findByRole("spinbutton").should("have.value", 1);
    // Simulate exceeding maximum value
    cy.findByLabelText("increment value").realClick();
    // Verify no change
    cy.get("@valueChangeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", 1);
  });

  it("rounds up to correct number of decimal places", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        decimalScale={2}
        defaultValue={3.146}
        fixedDecimalScale
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate changing the value to a decimal value
    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    // Verify rounds up to the specified decimal places
    cy.findByRole("spinbutton").should("have.value", "3.15");
    // Verify there are no calls to changeSpy
    cy.get("@valueChangeSpy").should("not.have.been.called");
  });

  it("rounds down to correct number of decimal places", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        decimalScale={2}
        defaultValue={3.145}
        fixedDecimalScale
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate changing the value to a decimal value
    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    // Verify rounds down to the specified decimal places
    cy.findByRole("spinbutton").should("have.value", "3.14");
    // Verify there are no calls to changeSpy
    cy.get("@valueChangeSpy").should("not.have.been.called");
  });

  it("pads with zeros to correct number of decimal places", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(
      <Default
        decimalScale={3}
        defaultValue={-5.8}
        fixedDecimalScale
        onValueChange={valueChangeSpy}
      />,
    );

    // Simulate changing the value to a decimal value
    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    // Verify the value is padded with zero to fill the number of decimal places
    cy.findByRole("spinbutton").should("have.value", "-5.800");
    // Verify there are no calls to changeSpy
    cy.get("@valueChangeSpy").should("not.have.been.called");
  });

  it("is disabled when the `disabled` prop is true", () => {
    cy.mount(<Default disabled />);
    // Verify disabled state
    cy.findByRole("spinbutton").should("be.disabled");
    cy.findByLabelText("increment value").should("be.disabled");
    cy.findByLabelText("decrement value").should("be.disabled");
  });

  it("is controlled when the `value` prop is provided", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    function ControlledNumberInput() {
      const [value, setValue] = useState<number | string>(10);
      const onValueChange: NumberInputProps["onValueChange"] = (
        values,
        source,
      ) => {
        // React 16 backwards compatibility
        source.event?.persist();
        if (values.floatValue) {
          setValue(values.floatValue);
        }
        valueChangeSpy(values, source);
      };
      return <NumberInput value={value} onValueChange={onValueChange} />;
    }

    cy.mount(<ControlledNumberInput />);
    cy.findByRole("spinbutton").should("have.value", "10");
    // Verify decrement is controlled
    cy.findByLabelText("decrement value").realClick();
    cy.get("@valueChangeSpy").should("have.callCount", 1);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: 9, formattedValue: "9", value: "9" },
        { source: "decrement" },
      );
    });
    cy.findByRole("spinbutton").should("have.value", "9");
    // Verify the input is controlled
    cy.findByRole("spinbutton").clear();
    cy.findByRole("spinbutton").focus();
    cy.realType("50");
    cy.findByRole("spinbutton").should("have.value", "50");
    cy.get("@valueChangeSpy").should("have.callCount", 4);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: undefined, formattedValue: "", value: "" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: 5, formattedValue: "5", value: "5" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(3)).to.have.been.calledWith(
        { floatValue: 50, formattedValue: "50", value: "50" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
    });
    // Verify increment is controlled
    cy.findByLabelText("increment value").realClick();
    cy.get("@valueChangeSpy").should("have.callCount", 5);
    cy.findByRole("spinbutton").should("have.value", "51");
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(4)).to.have.been.calledWith(
        { floatValue: 51, formattedValue: "51", value: "51" },
        { source: "increment" },
      );
    });
  });

  it("sanitizes input to only allow numbers, decimal points, and plus/minus symbols", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<Default onValueChange={valueChangeSpy} decimalScale={2} fixedDecimalScale />);

    // Simulate invalid characters
    cy.findByRole("spinbutton").clear();
    cy.findByRole("spinbutton").focus();
    cy.realType("abc-12.3.+-def");
    // Verify the order of calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 5);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        {floatValue: undefined, formattedValue: "-", value: "-"},
        {event: Cypress.sinon.match.any, source: "event"},
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        {floatValue: -1, formattedValue: "-1.00", value: "-1.00"},
        {event: Cypress.sinon.match.any, source: "event"},
      );
      expect(spy.getCall(2)).to.have.been.calledWith(
        {floatValue: -12, formattedValue: "-12.00", value: "-12.00"},
        {event: Cypress.sinon.match.any, source: "event"},
      );
      expect(spy.getCall(3)).to.have.been.calledWith(
        { floatValue: -12.3, formattedValue: "-12.30", value: "-12.30" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(4)).to.have.been.calledWith(
        { floatValue: 12.3, formattedValue: "12.30", value: "12.30" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
    });
    // Verify only valid characters cause a change
    cy.findByRole("spinbutton").should("have.value", "12.30");
    // Simulate blur
    cy.realPress("Tab");
    // Verify the verify is re-formatted with the number of decimal places
    cy.findByRole("spinbutton").should("have.value", "12.30");
  });

  it("allows out of range input remains in the input and show status by the user", () => {
    const valueChangeSpy = cy.stub().as("valueChangeSpy");
    cy.mount(<MinAndMaxValue onValueChange={valueChangeSpy} />);
    // Simulate typing a value that exceeds the maximum
    cy.findByRole("spinbutton").clear().focus();
    cy.realType("22");
    cy.realPress("Tab");
    // Verify typed values can exceed maximum and are preserved so error can be shown
    cy.findByRole("spinbutton").should("have.value", "22");
    cy.findByLabelText("increment value").should("be.disabled");
    // Verify error is shown
    cy.findByTestId("ErrorSolidIcon").should("exist");
    // Verify the calls to changeSpy
    cy.get("@valueChangeSpy").should("have.callCount", 3);
    cy.get("@valueChangeSpy").should((spy: any) => {
      expect(spy.getCall(0)).to.have.been.calledWith(
        { floatValue: undefined, formattedValue: "", value: "" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(1)).to.have.been.calledWith(
        { floatValue: 2, formattedValue: "2", value: "2" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
      expect(spy.getCall(2)).to.have.been.calledWith(
        { floatValue: 22, formattedValue: "22", value: "22" },
        { event: Cypress.sinon.match.any, source: "event" },
      );
    });
  });

  it("resets to default value in ResetAdornment example", () => {
    cy.mount(<ResetAdornment />);
    // Simulate changing the value
    cy.findByRole("spinbutton").focus().realPress("ArrowUp");
    cy.findByRole("spinbutton").should("have.value", "11");
    // Simulate reseting the value
    cy.findByRole("button", { name: "Reset Number Input" }).realClick();
    // Verify the value is reset
    cy.findByRole("spinbutton").should("have.value", "10");
  });
});
