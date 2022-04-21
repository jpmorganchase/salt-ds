import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { HomeIcon } from "@jpmorganchase/icons";
import { ToggleButton, ToggleButtonProps } from "../../toggle-button";

function renderToggleButton(initialProps: ToggleButtonProps = {}) {
  const onToggleSpy = jest.fn();
  const ToggleButtonComponent = (props: ToggleButtonProps) => (
    <ToggleButton
      ariaLabel="home"
      onToggle={onToggleSpy}
      tooltipText="Home"
      {...props}
    >
      <HomeIcon size={12} /> Home
    </ToggleButton>
  );
  const { rerender, ...utils } = render(
    <ToggleButtonComponent {...initialProps} />
  );
  return {
    ...utils,
    onToggleSpy,
    rerender: (newProps: ToggleButtonProps) =>
      rerender(<ToggleButtonComponent {...initialProps} {...newProps} />),
  };
}

describe("GIVEN a ToggleButton with Icon and Text (uncontrolled)", () => {
  test("THEN it should render correctly", () => {
    const { getAllByRole, rerender, onToggleSpy } = renderToggleButton();
    const toggleButton = getAllByRole("checkbox");

    expect(toggleButton[0]).toHaveTextContent("Home");
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "false");
    expect(toggleButton.length).toBe(1);

    // toggle
    fireEvent.click(toggleButton[0]);
    rerender({ toggled: true });
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "true");
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenCalledWith(expect.any(Object), true);

    onToggleSpy.mockClear();

    // untoggle
    fireEvent.click(toggleButton[0]);
    rerender({ toggled: false });
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "false");
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenCalledWith(expect.any(Object), false);
  });
});

describe("GIVEN a ToggleButton with Icon and Text (controlled)", () => {
  test("THEN it should render correctly", () => {
    const { getAllByRole, rerender, onToggleSpy } = renderToggleButton({
      toggled: true,
    });

    const toggleButton = getAllByRole("checkbox");
    expect(toggleButton[0]).toHaveTextContent("Home");
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "true");
    expect(toggleButton[0]).toHaveTextContent("Home");
    expect(toggleButton.length).toBe(1);

    // untoggle
    fireEvent.click(toggleButton[0]);
    rerender({ toggled: false });
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "false");
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenCalledWith(expect.any(Object), false);

    onToggleSpy.mockClear();

    // toggle
    fireEvent.click(toggleButton[0]);
    rerender({ toggled: true });
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "true");
    expect(onToggleSpy).toHaveBeenCalledTimes(1);
    expect(onToggleSpy).toHaveBeenCalledWith(expect.any(Object), true);
  });
});

describe("GIVEN a disabled ToggleButton with Icon and Text (uncontrolled)", () => {
  test("THEN it should not toggle", () => {
    const { getAllByRole, onToggleSpy } = renderToggleButton({
      disabled: true,
    });

    const toggleButton = getAllByRole("checkbox");
    expect(toggleButton[0]).toHaveTextContent("Home");
    expect(toggleButton[0]).toHaveAttribute("aria-checked", "false");
    expect(toggleButton[0]).toHaveAttribute("aria-disabled", "true");
    expect(toggleButton[0]).toHaveTextContent("Home");
    expect(toggleButton.length).toBe(1);

    // try to toggle
    fireEvent.click(toggleButton[0]);
    expect(onToggleSpy).toHaveBeenCalledTimes(0);
  });
});
