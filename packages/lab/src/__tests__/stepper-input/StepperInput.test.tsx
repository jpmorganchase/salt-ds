import React from "react";
import user from "@testing-library/user-event";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StepperInput } from "../../stepper-input";

describe("Stepper Input", () => {
  it("renders with default props", () => {
    render(<StepperInput />);
    // Component should render with three buttons - refresh, increment, and decrement
    expect(screen.getAllByRole("button", { hidden: true })).toHaveLength(3);

    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue("0");
  });

  it("accepts `Input` props", () => {
    const handleBlurSpy = jest.fn();
    const handleChangeSpy = jest.fn();

    render(
      <StepperInput
        InputProps={{
          onBlur: () => handleBlurSpy(),
          onChange: () => handleChangeSpy(),
        }}
      />
    );

    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, {
      target: { value: "1" },
    });
    expect(handleChangeSpy).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlurSpy).toHaveBeenCalled();
  });

  it("increments the default value on button click", () => {
    render(<StepperInput />);

    const input = screen.getByRole("spinbutton");
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);
    fireEvent.mouseDown(incrementButton);

    expect(input).toHaveValue("2");
  });

  it("decrements the default value on button click", () => {
    render(<StepperInput />);

    const input = screen.getByRole("spinbutton");
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.mouseDown(decrementButton);
    fireEvent.mouseDown(decrementButton);

    expect(input).toHaveValue("-2");
  });

  it("increments from an empty value on button click", () => {
    render(<StepperInput />);

    const input = screen.getByRole("spinbutton");
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");

    fireEvent.mouseDown(incrementButton);
    expect(input).toHaveValue("1");
  });

  it("decrements from an empty value on button click", () => {
    render(<StepperInput />);

    const input = screen.getByRole("spinbutton");
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");

    fireEvent.mouseDown(decrementButton);
    expect(input).toHaveValue("-1");
  });

  it("increments to `1` from a minus symbol on button click", () => {
    render(<StepperInput />);

    const input = screen.getByRole("spinbutton");
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.change(input, { target: { value: "-" } });
    expect(input).toHaveValue("-");

    fireEvent.mouseDown(incrementButton);
    expect(input).toHaveValue("1");
  });

  it("decrements to `-1` from a minus symbol on button click", () => {
    render(<StepperInput />);

    const input = screen.getByRole("spinbutton");
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.change(input, { target: { value: "-" } });
    expect(input).toHaveValue("-");

    fireEvent.mouseDown(decrementButton);
    expect(input).toHaveValue("-1");
  });

  it("renders with specified `defaultValue` and number of `decimalPlaces`", () => {
    render(<StepperInput decimalPlaces={4} defaultValue={10} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("10.0000");
  });

  it("increments by specified `step` value", () => {
    render(<StepperInput defaultValue={10} step={10} />);

    const input = screen.getByRole("spinbutton");
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);
    expect(input).toHaveValue("20");
  });

  it("increments by specified floating point `step` value", () => {
    render(<StepperInput decimalPlaces={2} defaultValue={3.14} step={0.01} />);

    const input = screen.getByRole("spinbutton");
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);
    expect(input).toHaveValue("3.15");
  });

  it("decrements by specified `step` value", () => {
    render(<StepperInput defaultValue={0} step={10} />);

    const input = screen.getByRole("spinbutton");
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.mouseDown(decrementButton);
    expect(input).toHaveValue("-10");
  });

  it("decrements by specified floating point `step` value", () => {
    render(<StepperInput decimalPlaces={2} defaultValue={0.0} step={0.01} />);

    const input = screen.getByRole("spinbutton");
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.mouseDown(decrementButton);
    expect(input).toHaveValue("-0.01");
  });

  it("disables the increment button at `max`", () => {
    render(<StepperInput defaultValue={9} max={10} />);

    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);
    expect(incrementButton).toBeDisabled();
  });

  it("disables the decrement button at `min`", () => {
    render(<StepperInput defaultValue={1} min={0} />);

    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.mouseDown(decrementButton);
    expect(decrementButton).toBeDisabled();
  });

  it("displays the refresh button when `showRefreshButton` prop is `true`", () => {
    render(<StepperInput showRefreshButton />);
    const refreshButton = screen.getAllByRole("button", { hidden: true })[0];
    expect(refreshButton).toBeVisible();
  });

  it("resets the to `defaultValue` after refresh button is clicked", async () => {
    render(<StepperInput showRefreshButton />);

    const input = screen.getByRole("spinbutton");
    const refreshButton = screen.getAllByRole("button", { hidden: true })[0];
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);
    expect(input).toHaveValue("1");

    await act(async () => {
      await user.click(refreshButton);
      expect(input).toHaveValue("0");
    });
  });

  it("calls the `onChange` callback on refresh", async () => {
    const onChangeSpy = jest.fn();

    render(<StepperInput onChange={onChangeSpy} showRefreshButton />);

    const input = screen.getByRole("spinbutton");
    const refreshButton = screen.getAllByRole("button", { hidden: true })[0];
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);

    await act(async () => {
      await user.click(refreshButton);
    });

    expect(input).toHaveValue("0");
    expect(onChangeSpy).toHaveBeenCalled();
  });

  it("displays value with correct number of decimal places on blur", () => {
    render(<StepperInput decimalPlaces={2} />);

    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "-12" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("-12.00");
  });

  it("calls the `onChange` callback when the value is decremented", () => {
    const onChangeSpy = jest.fn();

    render(<StepperInput defaultValue={16} onChange={onChangeSpy} />);

    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.mouseDown(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith("15");
  });

  it("calls the `onChange` callback when the value is incremented", () => {
    const onChangeSpy = jest.fn();

    render(
      <StepperInput
        decimalPlaces={2}
        defaultValue={-109.46}
        onChange={onChangeSpy}
        step={0.02}
      />
    );

    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith("-109.44");
  });

  it("calls the input's change handlers", () => {
    const onChangeSpyInputProps = jest.fn();
    const onChangeSpy = jest.fn();

    render(
      <StepperInput
        InputProps={{ onChange: onChangeSpyInputProps }}
        onChange={onChangeSpy}
      />
    );

    const input = screen.getByRole("spinbutton");

    user.type(input, "1");

    expect(input).toHaveValue("01");
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpyInputProps).toHaveBeenCalled();
  });

  it("calls the input's blur handlers", () => {
    const onBlurSpy = jest.fn();

    render(<StepperInput InputProps={{ onBlur: onBlurSpy }} />);

    const input = screen.getByRole("spinbutton");

    user.type(input, "1");
    fireEvent.blur(input);

    expect(input).toHaveValue("1");
    expect(onBlurSpy).toHaveBeenCalled();
  });

  it("allows maximum safe integer", () => {
    render(<StepperInput defaultValue={Number.MAX_SAFE_INTEGER} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(Number.MAX_SAFE_INTEGER.toString());
  });

  it("allows minimum safe integer", () => {
    render(<StepperInput defaultValue={Number.MIN_SAFE_INTEGER} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(Number.MIN_SAFE_INTEGER.toString());
  });

  it("prevents incrementing beyond maximum safe integer", () => {
    const onChangeSpy = jest.fn();

    render(
      <StepperInput
        defaultValue={Number.MAX_SAFE_INTEGER}
        onChange={onChangeSpy}
      />
    );

    const input = screen.getByRole("spinbutton");
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];

    fireEvent.mouseDown(incrementButton);

    expect(incrementButton).toBeDisabled();
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(input).toHaveValue(Number.MAX_SAFE_INTEGER.toString());
  });

  it("prevents decrementing beyond minimum safe integer", () => {
    const onChangeSpy = jest.fn();

    render(
      <StepperInput
        defaultValue={Number.MIN_SAFE_INTEGER}
        onChange={onChangeSpy}
      />
    );

    const input = screen.getByRole("spinbutton");
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];

    fireEvent.mouseDown(decrementButton);

    expect(decrementButton).toBeDisabled();
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(input).toHaveValue(Number.MIN_SAFE_INTEGER.toString());
  });

  it("rounds up to correct number of decimal places", () => {
    render(<StepperInput decimalPlaces={2} defaultValue={3.145} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.blur(input);

    expect(input).toHaveValue("3.15");
  });

  it("rounds down to correct number of decimal places", () => {
    render(<StepperInput decimalPlaces={3} defaultValue={-12.3324} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.blur(input);

    expect(input).toHaveValue("-12.332");
  });

  it("pads with zeros to correct number of decimal places", () => {
    render(<StepperInput decimalPlaces={3} defaultValue={-5.8} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.blur(input);

    expect(input).toHaveValue("-5.800");
  });
});
