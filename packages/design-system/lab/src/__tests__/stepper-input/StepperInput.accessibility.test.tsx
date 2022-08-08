import { FormField } from "@jpmorganchase/uitk-core";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "dom-accessibility-api";
import { StepperInput } from "../../stepper-input";

const mockAnnounce = jest.fn();

jest.mock("@jpmorganchase/uitk-core", () => ({
  ...jest.requireActual("@jpmorganchase/uitk-core"),
  useAriaAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

describe("Stepper Input - Accessibility", () => {
  it("sets the correct default ARIA attributes on input", () => {
    render(
      <StepperInput
        decimalPlaces={2}
        defaultValue={-20.1}
        max={250.23}
        min={-500.11}
      />
    );
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "aria-valuenow",
      "-20.1"
    );
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "aria-valuemax",
      "250.23"
    );
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "aria-valuemin",
      "-500.11"
    );
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "aria-invalid",
      "false"
    );
  });

  it("has the correct labelling when wrapped in a `FormField`", () => {
    render(
      <FormField helperText="please enter a value" label="stepper input">
        <StepperInput defaultValue={-10} min={0} />
      </FormField>
    );

    expect(computeAccessibleName(screen.getByRole("spinbutton"))).toEqual(
      "stepper input"
    );
    expect(
      computeAccessibleDescription(screen.getByRole("spinbutton"))
    ).toEqual("please enter a value");
  });

  it("appends a message to `aria-label` when the controlled `liveValue` prop changes", () => {
    const { rerender } = render(
      <FormField helperText="please enter a value" label="stepper input">
        <StepperInput defaultValue={10} liveValue={10} />
      </FormField>
    );

    expect(computeAccessibleName(screen.getByRole("spinbutton"))).toEqual(
      "stepper input"
    );

    expect(
      computeAccessibleDescription(screen.getByRole("spinbutton"))
    ).toEqual("please enter a value");

    rerender(
      <FormField helperText="please enter a value" label="stepper input">
        <StepperInput defaultValue={10} liveValue={11} />
      </FormField>
    );

    expect(computeAccessibleName(screen.getByRole("spinbutton"))).toEqual(
      "stepper input , value out of date"
    );

    expect(
      computeAccessibleDescription(screen.getByRole("spinbutton"))
    ).toEqual("please enter a value");
  });

  it("removes the appended message from `aria-label` when the the component is refreshed", () => {
    const { rerender } = render(
      <FormField helperText="please enter a value" label="stepper input">
        <StepperInput defaultValue={10} liveValue={11} />
      </FormField>
    );

    rerender(
      <FormField helperText="please enter a value" label="stepper input">
        <StepperInput defaultValue={10} liveValue={12} />
      </FormField>
    );

    expect(computeAccessibleName(screen.getByRole("spinbutton"))).toEqual(
      "stepper input , value out of date"
    );

    expect(
      computeAccessibleDescription(screen.getByRole("spinbutton"))
    ).toEqual("please enter a value");

    const refreshButton = screen.getAllByRole("button", { hidden: true })[0];
    fireEvent.click(refreshButton);

    expect(computeAccessibleName(screen.getByRole("spinbutton"))).toEqual(
      "stepper input"
    );

    expect(
      computeAccessibleDescription(screen.getByRole("spinbutton"))
    ).toEqual("please enter a value");
  });

  it("sets `aria-invalid=false` on input when the value is out of range", () => {
    render(<StepperInput defaultValue={-10} min={0} />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("sets the correct default ARIA attributes on the increment/decrement buttons", () => {
    render(<StepperInput />);
    const incrementButton = screen.getAllByRole("button", { hidden: true })[1];
    const decrementButton = screen.getAllByRole("button", { hidden: true })[2];
    expect(incrementButton).toHaveAttribute("tabindex", "-1");
    expect(incrementButton).toHaveAttribute("aria-hidden", "true");
    expect(decrementButton).toHaveAttribute("tabindex", "-1");
    expect(decrementButton).toHaveAttribute("aria-hidden", "true");
  });
});
