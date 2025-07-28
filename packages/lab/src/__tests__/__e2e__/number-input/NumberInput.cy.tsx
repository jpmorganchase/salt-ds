import { FormField, FormFieldLabel } from "@salt-ds/core";
import * as numberInputStories from "@stories/number-input/number-input.stories";
import { composeStories } from "@storybook/react-vite";
import { toFloat } from "packages/core/src/slider/internal/utils";
import { NumberInput } from "packages/lab/src/number-input";
import { type SyntheticEvent, useState } from "react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(numberInputStories);

const {
  Default,
  ControlledFormatting,
  MinAndMaxValue,
  ResetAdornment,
  ReadOnly,
  UncontrolledFormatting,
} = composedStories;

describe("Number Input", () => {
  checkAccessibility(composedStories);
  it("renders with default props", () => {
    cy.mount(<Default />);
    // Component should render with two buttons - increment, and decrement
    cy.findAllByRole("button", { hidden: true }).should("have.length", 2);

    cy.findByRole("spinbutton").should("exist");
    cy.findByRole("spinbutton").should("have.value", "");
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
    cy.findByRole("spinbutton").should("have.value", "0");
    cy.findByRole("spinbutton").realPress("PageDown");
    cy.findByRole("spinbutton").should("have.value", "-100");
    cy.findByRole("spinbutton").realPress(["Shift", "ArrowDown"]);
    cy.findByRole("spinbutton").should("have.value", "-200");
    cy.findByRole("spinbutton").realPress(["Home"]);
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

  it("calls the `onChangeEnd` callback with the final value after continuous increments/decrements", () => {
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default onChangeEnd={changeEndSpy} />);
    cy.findByLabelText("increment value")
      .realMouseDown()
      .wait(1000)
      .realMouseUp();

    cy.get("@changeEndSpy").should(
      "have.been.calledOnceWith",
      Cypress.sinon.match.any,
      7,
    );
  });

  it("calls the `onChangeEnd` callback with the final value after keyboard changes", () => {
    const changeEndSpy = cy.stub().as("changeEndSpy");
    cy.mount(<Default onChangeEnd={changeEndSpy} />);

    cy.findByRole("spinbutton").focus().realType("7");

    cy.get("@changeEndSpy").should(
      "have.been.calledOnceWith",
      Cypress.sinon.match.any,
      7,
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

  it("clamps values outside the range of `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`", () => {
    const changeSpy = cy.stub().as("changeSpy");

    cy.mount(
      <Default
        defaultValue={Number.MAX_SAFE_INTEGER + 1}
        onChange={changeSpy}
      />,
    );

    cy.findByRole("spinbutton").should(
      "have.value",
      Number.MAX_SAFE_INTEGER.toString(),
    );
    cy.get("@changeSpy").should("not.have.been.called");

    cy.findByRole("spinbutton")
      .clear()
      .focus()
      .realType("-83491232183712983713791237");
    cy.realPress("Tab");
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
    cy.mount(<Default defaultValue={0.9} min={0} onChange={changeSpy} />);

    cy.findByRole("spinbutton").should("have.value", 0.9);

    cy.findByLabelText("decrement value").realClick();
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", 0.9);
  });

  it("does not increment above the maximum value", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Default defaultValue={0.5} max={1} onChange={changeSpy} />);

    cy.findByRole("spinbutton").should("have.value", 0.5);

    cy.findByLabelText("increment value").realClick();
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("spinbutton").should("have.value", 0.5);
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

    cy.findByRole("spinbutton").focus();
    cy.findByRole("spinbutton").clear();
    cy.realType("2");
    cy.findByRole("spinbutton").should("have.value", "5");
  });

  it("sanitizes input to only allow numbers, decimal points, and plus/minus symbols", () => {
    cy.mount(<Default />);

    cy.findByRole("spinbutton").focus().realType("abc-12.3.+-def");
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

  it("allows out of range input when clamp is false", () => {
    cy.mount(<MinAndMaxValue />);
    cy.findByRole("spinbutton").focus();
    cy.realType("2");
    cy.realPress("Tab");

    cy.findByRole("spinbutton").should("have.value", "22");
    cy.findByLabelText("increment value").should("be.disabled");
    cy.findByTestId("ErrorSolidIcon").should("exist");
  });

  it("clamps default value if out of range and clamp is set to true", () => {
    cy.mount(<Default max={50} defaultValue={60} clamp />);

    cy.findByRole("spinbutton").should("have.value", "50");
  });

  it("clamps out of range values on blur when clamp is set to true", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const changeEndSpy = cy.stub().as("changeEndSpy");

    cy.mount(
      <Default
        max={100}
        decimalScale={2}
        clamp
        defaultValue={""}
        onChange={changeSpy}
        onChangeEnd={changeEndSpy}
      />,
    );

    cy.findByRole("spinbutton").focus();
    cy.realType("10000000");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "100");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      100,
    );
    cy.get("@changeEndSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      100,
    );

    cy.findByRole("spinbutton").focus().clear();
    cy.realType("12.1234");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "12.12");
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      12.12,
    );
    cy.get("@changeEndSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      12.12,
    );
  });

  it("increments and decrements from the correct value when value gets clamped", () => {
    cy.mount(<Default max={100} min={10} clamp defaultValue={""} />);

    cy.findByRole("spinbutton").focus();
    cy.realType("10000000");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "100");
    cy.findByLabelText("increment value").should("be.disabled");
    cy.findByLabelText("decrement value").realClick();
    cy.findByRole("spinbutton").should("have.value", "99");
    cy.findByRole("spinbutton").focus().clear();
    cy.realType("1");
    cy.realPress("Tab");
    cy.findByRole("spinbutton").should("have.value", "10");
    cy.findByLabelText("decrement value").should("be.disabled");
    cy.findByLabelText("increment value").realClick();
    cy.findByRole("spinbutton").should("have.value", "11");
  });

  it("should increment or decrement from correct value before clamp is applied", () => {
    cy.mount(<Default max={100} min={10} clamp />);

    cy.findByRole("spinbutton").focus().realType("1000000");
    cy.realPress("ArrowDown");
    cy.findByRole("spinbutton").should("have.value", 100);
    cy.realPress("ArrowDown");
    cy.findByRole("spinbutton").should("have.value", 99);
  });

  it("should hide increment/decrement buttons when hideButtons is true", () => {
    cy.mount(<Default hideButtons />);
    cy.findByLabelText("increment value").should("not.be.visible");
    cy.findByLabelText("decrement value").should("not.be.visible");
  });

  describe("WHEN formatting a controlled NumberInput", () => {
    it("should allow formatting NumberInput via a format callback", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").should("have.value", "100K");
    });

    it("should not allow invalid input values", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").focus().realType("ABC");
      cy.findByRole("spinbutton").should("have.value", "100K");
    });

    it("should allow updating formatted input", () => {
      cy.mount(<ControlledFormatting />);
      cy.findByRole("spinbutton").clear().focus().realType("2.5M");
      cy.findByRole("spinbutton").should("have.value", "2.5M");
    });

    it("should increment and decrement formatted values using keyboard", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByRole("spinbutton").focus();
      cy.realPress("ArrowUp");
      cy.findByRole("spinbutton").should("have.value", "100.001K");
      cy.realPress("ArrowDown");
      cy.findByRole("spinbutton").should("have.value", "100K");
    });

    it("should increment and decrement parsed values using buttons", () => {
      cy.mount(<ControlledFormatting />);

      cy.findByLabelText("increment value").realClick({ clickCount: 2 });
      cy.findByRole("spinbutton").should("have.value", "100.002K");
      cy.findByLabelText("decrement value").realClick({ clickCount: 2 });
      cy.findByRole("spinbutton").should("have.value", "100K");
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
      cy.findByRole("spinbutton").should("have.value", "0");
    });

    it("should allow typing formatted values and call onChange with correct numerical values", () => {
      const changeSpy = cy.stub().as("changeSpy");

      function ControlledNumberInput() {
        const [value, setValue] = useState(15);

        const onChange = (event: SyntheticEvent | undefined, value: number) => {
          setValue(value);
          changeSpy(event, value);
        };

        return (
          <NumberInput
            value={value}
            onChange={onChange}
            format={(value) => `${value}%`}
            parse={(value) => toFloat(String(value).replace(/%/g, ""))}
          />
        );
      }

      cy.mount(<ControlledNumberInput />);
      cy.findByRole("spinbutton").should("have.value", "15%");
      cy.findByRole("spinbutton").focus().realPress("ArrowUp");
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        16,
      );
      cy.findByRole("spinbutton").realPress("ArrowDown");
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        15,
      );
      cy.findByRole("spinbutton").clear().focus().realType("30%");
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        30,
      );
      cy.realPress("Tab");
      cy.findByRole("spinbutton").should("have.value", "30%");
    });
  });

  describe("WHEN formatting an uncontrolled NumberInput", () => {
    it("should allow formatting NumberInput via a format callback", () => {
      cy.mount(<UncontrolledFormatting />);

      cy.findAllByRole("spinbutton").eq(0).should("have.value", "12%");
      cy.findAllByRole("spinbutton").eq(1).should("have.value", "1,000,000");
      cy.findAllByRole("spinbutton").eq(2).should("have.value", "10.5");
      cy.findAllByRole("spinbutton").eq(3).should("have.value", "10.24");
    });

    it("should allow editing valid input values", () => {
      cy.mount(<UncontrolledFormatting />);

      cy.findAllByRole("spinbutton").eq(0).focus();
      cy.findAllByRole("spinbutton").eq(0).should("have.value", "12%");

      cy.findAllByRole("spinbutton").eq(1).focus();
      cy.findAllByRole("spinbutton").eq(1).should("have.value", "1,000,000");

      cy.findAllByRole("spinbutton").eq(2).focus();
      cy.findAllByRole("spinbutton").eq(2).should("have.value", "10.5");

      cy.findAllByRole("spinbutton").eq(3).focus();
      cy.findAllByRole("spinbutton").eq(3).should("have.value", "10.24");
    });

    it("should increment and decrement values using keyboard", () => {
      cy.mount(<UncontrolledFormatting />);

      cy.findAllByRole("spinbutton").eq(0).focus();
      cy.realPress("ArrowUp");
      cy.findAllByRole("spinbutton").should("have.value", "13%");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findAllByRole("spinbutton").eq(0).should("have.value", "11%");
      cy.realPress("Tab");
      cy.findAllByRole("spinbutton").eq(0).should("have.value", "11%");
    });

    it("should increment and decrement parsed values using buttons", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <Default
          defaultValue={12}
          format={(value: string | number) => `${value}%`}
          parse={(value: string | number) => String(value).replace(/%/g, "")}
          onChange={changeSpy}
        />,
      );
      cy.findByLabelText("increment value").realClick({ clickCount: 2 });
      cy.findByRole("spinbutton").should("have.value", "14%");

      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        14,
      );
      cy.realPress("Tab");
      cy.get("@changeSpy").should("have.callCount", 2);
      cy.findByRole("spinbutton").should("have.value", "14%");
    });

    it("should allow typing formatted values and call onChange with correct numerical values", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <Default
          defaultValue={12}
          format={(value: string | number) => `${value}%`}
          parse={(value: string | number) =>
            toFloat(String(value).replace(/%/g, ""))
          }
          onChange={changeSpy}
        />,
      );
      cy.findByRole("spinbutton").clear().focus().realType("30%");
      cy.findByRole("spinbutton").should("have.value", "30%");

      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        30,
      );
    });
  });

  describe("WHEN decimal scale is set", () => {
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

    it("displays value with correct number of decimal places when decimal scale is set", () => {
      cy.mount(<Default decimalScale={2} defaultValue={""} />);

      cy.findByRole("spinbutton").focus();
      cy.realType("-12.1234");
      cy.realPress("Tab");
      cy.findByRole("spinbutton").should("have.value", "-12.12");
    });

    it("pads with zeros to correct number of decimal places when fixedDecimalScale is set", () => {
      cy.mount(
        <Default decimalScale={3} defaultValue={-5.8} fixedDecimalScale />,
      );

      cy.findByRole("spinbutton").focus();
      cy.realPress("Tab");
      cy.findByRole("spinbutton").should("have.value", "-5.800");
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
    });

    it("correctly formats a number starting with decimal point when decimal scale is set", () => {
      cy.mount(<Default decimalScale={1} />);

      cy.findByRole("spinbutton").focus().realType(".1");
      cy.realPress("Tab");

      cy.findByRole("spinbutton").should("have.value", 0.1);

      cy.findByRole("spinbutton").focus().clear();
      cy.realType("1.");
      cy.realPress("Tab");

      cy.findByRole("spinbutton").should("have.value", "1");
    });

    it("sets the input to 0 when a single decimal or integer symbols are typed in the input", () => {
      const changeSpy = cy.stub().as("changeSpy");

      cy.mount(<Default onChange={changeSpy} />);
      cy.findByRole("spinbutton").focus().realType(".");
      cy.realPress("Tab");
      cy.findByRole("spinbutton").should("have.value", "0");
      cy.findByRole("spinbutton").clear().focus().realType("-");
      cy.realPress("Tab");
      cy.findByRole("spinbutton").should("have.value", "0");
    });
  });

  describe("WHEN set to read-only", () => {
    it("should mount a read-only number input", () => {
      cy.mount(<ReadOnly />);
      cy.findByRole("textbox").should("have.attr", "readonly");
    });

    it("should show emdash by default if empty", () => {
      cy.mount(<ReadOnly defaultValue={undefined} readOnly />);
      cy.findByRole("textbox").should("have.value", "—");
    });

    it("should show a custom marker if provided when empty", () => {
      cy.mount(
        <ReadOnly defaultValue={undefined} readOnly emptyReadOnlyMarker="#" />,
      );
      cy.findByRole("textbox").should("have.value", "#");
    });

    it("should maintain its value on focus and on blur", () => {
      cy.mount(<ReadOnly defaultValue={5} decimalScale={2} />);

      cy.findByRole("textbox").focus().should("have.value", 5);
      cy.realPress("Tab");
      cy.findByRole("textbox").should("have.value", 5);
    });
  });

  describe("WHEN used in Formfield", () => {
    describe("AND disabled", () => {
      it("should be disabled", () => {
        cy.mount(
          <FormField disabled>
            <FormFieldLabel>Disabled form field</FormFieldLabel>
            <NumberInput />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Disabled form field").should(
          "have.attr",
          "disabled",
        );
      });
    });

    describe("AND is required", () => {
      it("should be required", () => {
        cy.mount(
          <FormField necessity="required">
            <FormFieldLabel>Form Field</FormFieldLabel>
            <NumberInput />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Form Field (Required)").should(
          "have.attr",
          "required",
        );
      });
    });

    describe("AND is required with asterisk", () => {
      it("should be required", () => {
        cy.mount(
          <FormField necessity="asterisk">
            <FormFieldLabel>Form Field</FormFieldLabel>
            <NumberInput />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Form Field *").should("have.attr", "required");
      });
    });

    describe("AND is optional", () => {
      it("should not be required", () => {
        cy.mount(
          <FormField necessity="optional">
            <FormFieldLabel>Form Field</FormFieldLabel>
            <NumberInput />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Form Field (Optional)").should(
          "not.have.attr",
          "required",
        );
      });
    });

    describe("AND readonly", () => {
      it("should be readonly", () => {
        cy.mount(
          <FormField readOnly>
            <FormFieldLabel>Readonly form field</FormFieldLabel>
            <NumberInput />
          </FormField>,
        );
        cy.wait(1000);
        cy.findByLabelText("Readonly form field").should(
          "have.attr",
          "readonly",
        );
      });
    });
  });
});
