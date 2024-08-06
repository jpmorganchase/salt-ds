import { StepperInput } from "@salt-ds/lab";

describe("Stepper Input", () => {
  it("renders with default props", () => {
    cy.mount(<StepperInput />);
    // Component should render with two buttons - increment, and decrement
    cy.findAllByRole("button", { hidden: true }).should("have.length", 2);

    cy.findByRole("spinbutton").should("exist");
    cy.findByRole("spinbutton").should("have.value", "0");
  });

  it("increments the default value on button click", () => {
    cy.mount(<StepperInput />);

    cy.findByLabelText("increment value").realClick({ clickCount: 2 });

    cy.findByRole("spinbutton").should("have.value", "2");
  });

  it("decrements the default value on button click", () => {
    cy.mount(<StepperInput />);

    cy.findByLabelText("decrement value").realClick({ clickCount: 2 });

    cy.findByRole("spinbutton").should("have.value", "-2");
  });

  it("increments from an empty value on button click", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").clear();
    cy.findByRole("spinbutton").should("have.value", "");

    cy.findByLabelText("increment value").realClick();

    cy.findByRole("spinbutton").should("have.value", "1");
  });

  it("decrements from an empty value on button click", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").clear();
    cy.findByRole("spinbutton").should("have.value", "");

    cy.findByLabelText("decrement value").realClick();

    cy.findByRole("spinbutton").should("have.value", "-1");
  });

  it("increments to `1` from a minus symbol on button click", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-");
    cy.findByRole("spinbutton").should("have.value", "-");

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "1");
  });

  it("decrements to `-1` from a minus symbol on button click", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-");
    cy.findByRole("spinbutton").should("have.value", "-");

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "-1");
  });

  it("renders with specified `defaultValue` and number of `decimalPlaces`", () => {
    cy.mount(<StepperInput decimalPlaces={4} defaultValue={10} />);
    cy.findByRole("spinbutton").should("have.value", "10.0000");
  });

  it("increments by specified `step` value", () => {
    cy.mount(<StepperInput defaultValue={10} step={10} />);

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "20");
  });

  it("increments by specified floating point `step` value", () => {
    cy.mount(
      <StepperInput decimalPlaces={2} defaultValue={3.14} step={0.01} />,
    );

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "3.15");
  });

  it("decrements by specified `step` value", () => {
    cy.mount(<StepperInput defaultValue={0} step={10} />);

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "-10");
  });

  it("decrements by specified floating point `step` value", () => {
    cy.mount(<StepperInput decimalPlaces={2} defaultValue={0.0} step={0.01} />);

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "-0.01");
  });

  it("disables the increment button at `max`", () => {
    cy.mount(<StepperInput defaultValue={9} max={10} />);

    cy.findByLabelText("increment value").realClick();
    cy.findByLabelText("increment value").should("be.disabled");
  });

  it("disables the decrement button at `min`", () => {
    cy.mount(<StepperInput defaultValue={1} min={0} />);

    cy.findByLabelText("decrement value").realClick();
    cy.findByLabelText("decrement value").should("be.disabled");
  });

  it("displays value with correct number of decimal places on blur", () => {
    cy.mount(<StepperInput decimalPlaces={2} />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-12");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "-12.00");
  });

  it("calls the `onChange` callback when the value is decremented", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(<StepperInput defaultValue={16} onChange={changeSpy} />);

    cy.findByLabelText("decrement value").realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "15"
    );
  });

  it("calls the `onChange` callback when the value is incremented", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <StepperInput
        decimalPlaces={2}
        defaultValue={-109.46}
        onChange={changeSpy}
        step={0.02}
      />,
    );

    cy.findByLabelText("increment value").realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "-109.44"
    );
  });

  it("allows maximum safe integer", () => {
    cy.mount(<StepperInput defaultValue={Number.MAX_SAFE_INTEGER} />);

    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MAX_SAFE_INTEGER.toString(),
    );
  });

  it("allows minimum safe integer", () => {
    cy.mount(<StepperInput defaultValue={Number.MIN_SAFE_INTEGER} />);

    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MIN_SAFE_INTEGER.toString(),
    );
  });

  it("prevents incrementing beyond maximum safe integer", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <StepperInput
        defaultValue={Number.MAX_SAFE_INTEGER}
        onChange={changeSpy}
      />,
    );

    cy.findByLabelText("increment value").realClick();

    cy.findByLabelText("increment value").should("be.disabled");
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MAX_SAFE_INTEGER.toString(),
    );
  });

  it("prevents decrementing beyond minimum safe integer", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <StepperInput
        defaultValue={Number.MIN_SAFE_INTEGER}
        onChange={changeSpy}
      />,
    );

    cy.findByLabelText("decrement value").realClick();

    cy.findByLabelText("decrement value").should("be.disabled");
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MIN_SAFE_INTEGER.toString(),
    );
  });

  it("does not decrement below the minimum value", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<StepperInput defaultValue={-1} min={-1} onChange={changeSpy} />);

    cy.findByRole("spinbutton").should("have.value", -1);

    cy.findByLabelText("decrement value").realClick();
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", -1);
  });

  it("does not increment above the maximum value", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<StepperInput defaultValue={1} max={1} onChange={changeSpy} />);

    cy.findByRole("spinbutton").should("have.value", 1);

    cy.findByLabelText("increment value").realClick();
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", 1);
  });

  it("rounds up to correct number of decimal places", () => {
    cy.mount(<StepperInput decimalPlaces={2} defaultValue={3.145} />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "3.15");
  });

  it("rounds down to correct number of decimal places", () => {
    cy.mount(<StepperInput decimalPlaces={3} defaultValue={-12.3324} />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "-12.332");
  });

  it("pads with zeros to correct number of decimal places", () => {
    cy.mount(<StepperInput decimalPlaces={3} defaultValue={-5.8} />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "-5.800");
  });

  it("increments the value on arrow up key press", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("ArrowUp");

    cy.findByRole("spinbutton").should("have.value", "1");
  });

  it("decrements the value on arrow down key press", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("ArrowDown");

    cy.findByRole("spinbutton").should("have.value", "-1");
  });

  it("is disabled when the `disabled` prop is true", () => {
    cy.mount(<StepperInput disabled />);

    cy.findByRole("spinbutton").should("be.disabled");
    cy.findByLabelText("increment value").should("be.disabled");
    cy.findByLabelText("decrement value").should("be.disabled");
  });

  it("is controlled when the `value` prop is provided", () => {
    cy.mount(<StepperInput value={5} />);

    cy.findByRole("spinbutton").should("have.value", "5");

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "5");

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "5");
  });

  it("sanitizes input to only allow numbers, decimal points, and plus/minus symbols", () => {
    cy.mount(<StepperInput />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("abc-12.3.+-def");

    cy.findByRole("spinbutton").should("have.value", "-12.3");
  });
});
