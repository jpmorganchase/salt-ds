import * as numberInputStories from "@stories/number-input/number-input.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(numberInputStories);

const {
  Default,
  ControlledFormatting,
  MinAndMaxValue,
  ResetAdornment,
  UncontrolledFormatting,
} = composedStories;

describe("Number Input", () => {
  it("renders with default props", () => {
    cy.mount(<Default />);
    // Component should render with two buttons - increment, and decrement
    cy.findAllByRole("button", { hidden: true }).should("have.length", 2);

    cy.findByRole("spinbutton").should("exist");
    cy.findByRole("spinbutton").should("have.value", "0");
  });

  it("increments the default value on button click", () => {
    cy.mount(<Default />);

    cy.findByLabelText("increment value").realClick({ clickCount: 2 });

    cy.findByRole("spinbutton").should("have.value", "2");
  });

  it("decrements the default value on button click", () => {
    cy.mount(<Default />);

    cy.findByLabelText("decrement value").realClick({ clickCount: 2 });

    cy.findByRole("spinbutton").should("have.value", "-2");
  });

  it("increments from an empty value on button click", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").clear();
    cy.findByRole("spinbutton").should("have.value", "");

    cy.findByLabelText("increment value").realClick();

    cy.findByRole("spinbutton").should("have.value", "1");
  });

  it("decrements from an empty value on button click", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").clear();
    cy.findByRole("spinbutton").should("have.value", "");

    cy.findByLabelText("decrement value").realClick();

    cy.findByRole("spinbutton").should("have.value", "-1");
  });

  it("increments to `1` from a minus symbol on button click", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-");
    cy.findByRole("spinbutton").should("have.value", "-");

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "1");
  });

  it("decrements to `-1` from a minus symbol on button click", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-");
    cy.findByRole("spinbutton").should("have.value", "-");

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "-1");
  });

  it("renders with specified `defaultValue`", () => {
    cy.mount(<Default defaultValue={10} />);
    cy.findByRole("spinbutton").should("have.value", "10");
  });

  it("increments specified `step` value when clicking increment button", () => {
    cy.mount(<Default defaultValue={10} step={10} />);

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "20");
  });

  it("increments specified floating point `step` value when clicking increment button by calculating decimal scale", () => {
    cy.mount(<Default defaultValue={3.14} step={0.01} />);

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "3.15");
  });

  it("increments specified `step` and `stepMultiplier` value when using keyboards", () => {
    cy.mount(
      <Default defaultValue={10} step={10} stepMultiplier={10} max={2000} />,
    );

    cy.findByRole("spinbutton").focus().realPress("ArrowUp");
    cy.findByRole("spinbutton").should("have.value", "20").realPress("PageUp");
    cy.findByRole("spinbutton")
      .should("have.value", "120")
      .realPress(["Shift", "ArrowUp"]);
    cy.findByRole("spinbutton").should("have.value", "220").realPress("End");
    cy.findByRole("spinbutton").should("have.value", "2000");
  });

  it("decrements specified `step` value when clicking decrement button", () => {
    cy.mount(<Default defaultValue={0} step={10} />);

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "-10");
  });

  it("decrements specified floating point `step` value when clicking decrement button by calculating decimal scale", () => {
    cy.mount(<Default defaultValue={0.0} step={0.01} />);

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "-0.01");
  });

  it("decrements specified `step` and `stepMultiplier` value when using keyboards", () => {
    cy.mount(
      <Default defaultValue={10} step={10} stepMultiplier={10} min={-2000} />,
    );

    cy.findByRole("spinbutton").focus().realPress("ArrowDown");
    cy.findByRole("spinbutton").should("have.value", "0").realPress("PageDown");
    cy.findByRole("spinbutton")
      .should("have.value", "-100")
      .realPress(["Shift", "ArrowDown"]);
    cy.findByRole("spinbutton").should("have.value", "-200").realPress("Home");
    cy.findByRole("spinbutton").should("have.value", "-2000");
  });

  it("disables the increment button at `max`", () => {
    cy.mount(<Default defaultValue={9} max={10} />);

    cy.findByLabelText("increment value").realClick();
    cy.findByLabelText("increment value").should("be.disabled");
  });

  it("disables the decrement button at `min`", () => {
    cy.mount(<Default defaultValue={1} min={0} />);

    cy.findByLabelText("decrement value").realClick();
    cy.findByLabelText("decrement value").should("be.disabled");
  });

  it("displays value with correct number of decimal places when decimal scale is set", () => {
    cy.mount(<Default decimalScale={2} />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("-12");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "-12.00");
  });

  it("calls the `onChange` callback when the value is decremented", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(<Default defaultValue={16} onChange={changeSpy} />);

    cy.findByLabelText("decrement value").realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      15,
    );
  });

  it("calls the `onChange` callback when the value is incremented", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <Default defaultValue={-109.46} onChange={changeSpy} step={0.02} />,
    );

    cy.findByLabelText("increment value").realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      -109.44,
    );
  });

  it("does not allow inputting non-numeric values", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default defaultValue={5} onChange={changeSpy} />);

    cy.findByRole("spinbutton").focus();
    cy.realType("abc");

    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", 5);
  });

  it("allows maximum safe integer", () => {
    cy.mount(<Default defaultValue={Number.MAX_SAFE_INTEGER} />);

    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MAX_SAFE_INTEGER.toString(),
    );
  });

  it("allows minimum safe integer", () => {
    cy.mount(<Default defaultValue={Number.MIN_SAFE_INTEGER} />);

    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MIN_SAFE_INTEGER.toString(),
    );
  });

  it("prevents incrementing beyond maximum safe integer", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <Default defaultValue={Number.MAX_SAFE_INTEGER} onChange={changeSpy} />,
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
      <Default defaultValue={Number.MIN_SAFE_INTEGER} onChange={changeSpy} />,
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
    cy.mount(<Default defaultValue={-1} min={-1} onChange={changeSpy} />);

    cy.findByRole("spinbutton").should("have.value", -1);

    cy.findByLabelText("decrement value").realClick();
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", -1);
  });

  it("does not increment above the maximum value", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default defaultValue={1} max={1} onChange={changeSpy} />);

    cy.findByRole("spinbutton").should("have.value", 1);

    cy.findByLabelText("increment value").realClick();
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", 1);
  });

  it("rounds up to correct number of decimal places when decimal scale is set", () => {
    cy.mount(<Default defaultValue={3.145} decimalScale={2} />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "3.15");
  });

  it("rounds down to correct number of decimal places when decimal scale is set", () => {
    cy.mount(<Default decimalScale={3} defaultValue={-12.3324} />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "-12.332");
  });

  it("pads with zeros to correct number of decimal places when decimal scale is set", () => {
    cy.mount(<Default decimalScale={3} defaultValue={-5.8} />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "-5.800");
  });

  it("increments the value on arrow up key press", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("ArrowUp");

    cy.findByRole("spinbutton").should("have.value", "1");
  });

  it("decrements the value on arrow down key press", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").focus();
    cy.realPress("ArrowDown");

    cy.findByRole("spinbutton").should("have.value", "-1");
  });

  it("is disabled when the `disabled` prop is true", () => {
    cy.mount(<Default disabled />);

    cy.findByRole("spinbutton").should("be.disabled");
    cy.findByLabelText("increment value").should("be.disabled");
    cy.findByLabelText("decrement value").should("be.disabled");
  });

  it("is controlled when the `value` prop is provided", () => {
    cy.mount(<Default value={5} />);

    cy.findByRole("spinbutton").should("have.value", "5");

    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "5");

    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "5");
  });

  it("sanitizes input to only allow numbers, decimal points, and plus/minus symbols", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("abc-12.3.+-def");

    cy.findByRole("spinbutton").should("have.value", "-12.3");
  });

  it("sanitizes default value in uncontrolled to only allow numbers, decimal points, and plus/minus symbols", () => {
    cy.mount(<Default defaultValue={"abc-12.3.+-def"} />);
    cy.findByRole("spinbutton").should("have.value", "-12.3");
  });

  it("sanitizes default value in controlled to only allow numbers, decimal points, and plus/minus symbols", () => {
    cy.mount(<Default value={"abc-12.3.+-def"} />);
    cy.findByRole("spinbutton").should("have.value", "-12.3");
  });

  it("ensures correct decimal places in default value of uncontrolled NumberInput when decimal scale is set", () => {
    cy.mount(<Default defaultValue={12.1111} decimalScale={2} />);

    cy.findByRole("spinbutton").should("have.value", "12.11");
    cy.findByRole("spinbutton").focus().blur();
    cy.findByRole("spinbutton").should("have.value", "12.11");
  });

  it("ensures correct decimal places in default value of controlled NumberInput when decimal scale is set", () => {
    cy.mount(<Default value={"1.111abxse"} decimalScale={2} />);
    cy.findByRole("spinbutton").should("have.value", "1.11");
    cy.findByRole("spinbutton").focus();
    // cy.findByRole("spinbutton").get()
  });

  it("sanitizes default value in controlled to only allow numbers, decimal points, and plus/minus symbols", () => {
    cy.mount(<Default value={"abc-12.3.+-def"} />);
    cy.findByRole("spinbutton").should("have.value", "-12.3");
  });

  it("resets to default value in ResetAdornment example", () => {
    cy.mount(<ResetAdornment />);

    cy.findByRole("spinbutton").focus().realPress("ArrowUp");
    cy.findByRole("spinbutton").should("have.value", "11");
    cy.findByRole("button", { name: "Reset Number Input" }).realClick();
    cy.findByRole("spinbutton").should("have.value", "10");
  });

  it("allows out of range input when clampValue is false", () => {
    cy.mount(<MinAndMaxValue />);
    cy.findByRole("spinbutton").focus();
    cy.realType("2");
    cy.realPress("Tab");

    cy.findByRole("spinbutton").should("have.value", "22");
    cy.findByLabelText("increment value").should("be.disabled");
    cy.findByTestId("ErrorSolidIcon").should("exist");
  });

  it("clamps out of range values on blur when clampValue is set to true", () => {
    cy.mount(<Default max={100} decimalScale={2} clampValue />);

    cy.findByRole("spinbutton").focus().clear();
    cy.realType("10000000");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "100.00");

    cy.findByRole("spinbutton").focus().clear();
    cy.realType("12.1234");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "12.12");
  });

  it("correctly formats a number starting with decimal point when decimal scale is set", () => {
    cy.mount(<Default decimalScale={1} />);

    cy.findByRole("spinbutton").focus().clear();
    cy.realType(".1");
    cy.realPress("Tab");

    cy.findByRole("spinbutton").should("have.value", 0.1);

    cy.findByRole("spinbutton").focus().clear();
    cy.realType("1.");
    cy.realPress("Tab");

    cy.findByRole("spinbutton").should("have.value", "1.0");
  });

  describe("Formatting a controlled NumberInput", () => {
    it("should allow formatting NumberInput via a format callback", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").should("have.value", "100K");
    });

    it("should parse the formatted NumberInput when editing", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").focus();
      cy.findByRole("spinbutton").should("have.value", "100000");
    });

    it("should increment and decrement parsed values using keyboard", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").focus();
      cy.realPress("ArrowUp");
      cy.findByRole("spinbutton").should("have.value", "100001");
      cy.realPress("ArrowDown");
      cy.findByRole("spinbutton").should("have.value", "100000");
    });

    it("should increment and decrement parsed values using buttons", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByLabelText("increment value").realClick({ clickCount: 2 });
      cy.findByRole("spinbutton").should("have.value", "100002");
      cy.findByLabelText("decrement value").realClick({ clickCount: 2 });
      cy.findByRole("spinbutton").should("have.value", "100000");
    });

    it("should format parsed values when editing is done", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").clear().focus();
      cy.realType("250000");
      cy.realPress("Tab");

      cy.findByRole("spinbutton").should("have.value", "250K");
    });

    it("should allow updating value externally and show correct formatting", () => {
      cy.mount(<ControlledFormatting />);

      // Click the update value button
      cy.findAllByRole("button").eq(0).click();
      cy.findByRole("spinbutton").should("have.value", "123.456K");

      // Click the increment value button
      cy.findAllByRole("button").eq(1).click();
      cy.findByRole("spinbutton").should("have.value", "123.556K");

      // Click the clear value button
      cy.findAllByRole("button").eq(2).click();
      cy.findByRole("spinbutton").should("have.value", "");
    });
  });

  describe("Formatting an uncontrolled NumberInput", () => {
    it("should allow formatting NumberInput via a format callback", () => {
      cy.mount(<UncontrolledFormatting />);

      cy.findAllByRole("spinbutton").eq(0).should("have.value", "12%");
      cy.findAllByRole("spinbutton").eq(1).should("have.value", "1,000,000");
      cy.findAllByRole("spinbutton").eq(2).should("have.value", "10.0");
      cy.findAllByRole("spinbutton").eq(3).should("have.value", "10.24");
    });

    it("should parse the formatted NumberInput when editing", () => {
      cy.mount(<UncontrolledFormatting />);

      cy.findAllByRole("spinbutton").eq(0).focus();
      cy.findAllByRole("spinbutton").eq(0).should("have.value", "12");

      cy.findAllByRole("spinbutton").eq(1).focus();
      cy.findAllByRole("spinbutton").eq(1).should("have.value", "1000000");

      cy.findAllByRole("spinbutton").eq(2).focus();
      cy.findAllByRole("spinbutton").eq(2).should("have.value", "10.0");

      cy.findAllByRole("spinbutton").eq(3).focus();
      cy.findAllByRole("spinbutton").eq(3).should("have.value", "10.24");
    });

    it("should increment and decrement parsed values using keyboard", () => {
      cy.mount(<UncontrolledFormatting />);

      cy.findAllByRole("spinbutton").eq(0).focus();
      cy.realPress("ArrowUp");
      cy.findAllByRole("spinbutton").should("have.value", "13");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findAllByRole("spinbutton").eq(0).should("have.value", "11");
      cy.realPress("Tab");
      cy.findAllByRole("spinbutton").eq(0).should("have.value", "11%");
    });

    it("should increment and decrement parsed values using buttons", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <Default
          defaultValue={12}
          format={(value) => `${value}%`}
          parse={(value) => String(value).replace(/%/g, "")}
          onChange={changeSpy}
        />,
      );

      cy.findByLabelText("increment value").realClick({ clickCount: 2 });
      cy.findByRole("spinbutton").should("have.value", "14");
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        14,
      );
      cy.realPress("Tab");
      cy.findByRole("spinbutton").should("have.value", "14%");
      cy.get("@changeSpy").should("have.callCount", 2);
    });
  });
});
