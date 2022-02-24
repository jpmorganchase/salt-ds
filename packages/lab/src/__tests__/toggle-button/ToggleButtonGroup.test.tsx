import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  HomeIcon,
  SearchIcon,
  PrintIcon,
  NotificationIcon,
} from "@brandname/icons";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from "../../toggle-button";

function renderToggleButtonGroup(
  initialProps: Partial<ToggleButtonGroupProps> = {}
) {
  const onChangeSpy = jest.fn();
  const ToggleButtonGroupComponent = (
    props: Partial<ToggleButtonGroupProps>
  ) => (
    <ToggleButtonGroup onChange={onChangeSpy} {...props}>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        <HomeIcon size={12} /> Home
      </ToggleButton>
      <ToggleButton ariaLabel="search" tooltipText="Search">
        <SearchIcon size={12} /> Search
      </ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        <PrintIcon size={12} /> Print
      </ToggleButton>
      <ToggleButton ariaLabel="alert" tooltipText="Alert">
        <NotificationIcon size={12} /> Alert
      </ToggleButton>
    </ToggleButtonGroup>
  );
  const { rerender, ...utils } = render(
    <ToggleButtonGroupComponent {...initialProps} />
  );
  return {
    ...utils,
    onChangeSpy,
    rerender: (newProps: Partial<ToggleButtonGroupProps>) =>
      rerender(<ToggleButtonGroupComponent {...initialProps} {...newProps} />),
  };
}

describe("GIVEN a ToggleButtonGroup with ToggleButtons are passed as children (uncontrolled)", () => {
  test("THEN it should have radiogroup as role", () => {
    const { getAllByRole } = renderToggleButtonGroup();
    const toggleButtonGroup = getAllByRole("radiogroup");
    expect(toggleButtonGroup.length).toBe(1);
  });

  test("THEN it should have default aria-label value", () => {
    const { getAllByRole } = renderToggleButtonGroup();
    const toggleButtonGroup = getAllByRole("radiogroup");
    expect(toggleButtonGroup[0]).toHaveAttribute(
      "aria-label",
      "Toggle options"
    );
  });

  test("THEN it should respect to `aria-label` prop", () => {
    const { getAllByRole } = renderToggleButtonGroup({
      ariaLabel: "My Toggle Button Group",
      children: [],
    });
    const toggleButtonGroup = getAllByRole("radiogroup");
    expect(toggleButtonGroup[0]).toHaveAttribute(
      "aria-label",
      "My Toggle Button Group"
    );
  });

  test("THEN it should toggle the first item as `defaultSelectedIndex` prop", () => {
    const { getAllByRole } = renderToggleButtonGroup();
    const buttons = getAllByRole("radio");

    // 4 toggle buttons
    expect(buttons.length).toBe(4);
    expect(buttons[0]).toHaveTextContent("Home");
    expect(buttons[0]).toHaveAttribute("aria-checked", "true");
    expect(buttons[0]).toHaveAttribute("tabindex", "0");
    expect(buttons[1]).toHaveTextContent("Search");
    expect(buttons[1]).toHaveAttribute("aria-checked", "false");
    expect(buttons[1]).toHaveAttribute("tabindex", "-1");
    expect(buttons[2]).toHaveTextContent("Print");
    expect(buttons[2]).toHaveAttribute("aria-checked", "false");
    expect(buttons[2]).toHaveAttribute("tabindex", "-1");
    expect(buttons[3]).toHaveTextContent("Alert");
    expect(buttons[3]).toHaveAttribute("aria-checked", "false");
    expect(buttons[3]).toHaveAttribute("tabindex", "-1");
  });

  it("THEN should respect `defaultSelectedIndex` prop", () => {
    const { getAllByRole } = renderToggleButtonGroup({
      defaultSelectedIndex: 1,
    });

    const buttons = getAllByRole("radio");
    expect(buttons[0]).toHaveAttribute("aria-checked", "false");
    expect(buttons[0]).toHaveAttribute("tabindex", "-1");
    expect(buttons[1]).toHaveAttribute("aria-checked", "true");
    expect(buttons[1]).toHaveAttribute("tabindex", "0");
    expect(buttons[2]).toHaveAttribute("aria-checked", "false");
    expect(buttons[2]).toHaveAttribute("tabindex", "-1");
    expect(buttons[3]).toHaveAttribute("aria-checked", "false");
    expect(buttons[3]).toHaveAttribute("tabindex", "-1");
  });

  test("THEN should fire onChangeSpy on toggle button click", () => {
    const { getAllByRole, onChangeSpy } = renderToggleButtonGroup();
    const buttons = getAllByRole("radio");

    fireEvent.click(buttons[1]);
    // Click first toggle button
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(expect.any(Object), 1, true);

    onChangeSpy.mockClear();
    // Click another toggle button
    fireEvent.click(buttons[2]);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(expect.any(Object), 2, true);
  });

  test("THEN should NOT deselect a button if it's clicked after being toggled", () => {
    const { getAllByRole, onChangeSpy } = renderToggleButtonGroup({
      defaultSelectedIndex: 2,
    });
    const buttons = getAllByRole("radio");

    // Click toggled button
    fireEvent.click(buttons[2]);

    // It should not call onChange
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
    // It should not deselect the toggled button
    expect(buttons[2]).toHaveAttribute("aria-checked", "true");
  });
});

describe("GIVEN a ToggleButtonGroup (controlled)", () => {
  test("THEN should respect `selectedIndex` prop", () => {
    const { getAllByRole, rerender, onChangeSpy } = renderToggleButtonGroup({
      selectedIndex: 1,
    });
    const buttons = getAllByRole("radio");

    // 4 toggle buttons
    expect(buttons.length).toBe(4);
    expect(buttons[0]).toHaveTextContent("Home");
    expect(buttons[0]).toHaveAttribute("aria-checked", "false");
    expect(buttons[0]).toHaveAttribute("tabindex", "-1");
    expect(buttons[1]).toHaveTextContent("Search");
    expect(buttons[1]).toHaveAttribute("aria-checked", "true");
    expect(buttons[1]).toHaveAttribute("tabindex", "0");
    expect(buttons[2]).toHaveTextContent("Print");
    expect(buttons[2]).toHaveAttribute("aria-checked", "false");
    expect(buttons[2]).toHaveAttribute("tabindex", "-1");
    expect(buttons[3]).toHaveTextContent("Alert");
    expect(buttons[3]).toHaveAttribute("aria-checked", "false");
    expect(buttons[3]).toHaveAttribute("tabindex", "-1");

    fireEvent.click(buttons[0]);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(expect.any(Object), 0, true);
    rerender({ selectedIndex: 0 });
    expect(buttons[0]).toHaveAttribute("aria-checked", "true");
    expect(buttons[0]).toHaveAttribute("tabindex", "0");
    expect(buttons[1]).toHaveAttribute("tabindex", "-1");
  });

  test("THEN should NOT deselect a toggled button", () => {
    const { getAllByRole, onChangeSpy } = renderToggleButtonGroup({
      selectedIndex: 2,
    });
    const buttons = getAllByRole("radio");

    // Click toggled button
    fireEvent.click(buttons[2]);

    // It should not call onChange
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
    // It should not deselect the toggled button
    expect(buttons[2]).toHaveAttribute("aria-checked", "true");
  });
});

describe("GIVEN a disabled ToggleButtonGroup ", () => {
  test("THEN should respect `selectedIndex` prop", () => {
    const { getAllByRole, onChangeSpy } = renderToggleButtonGroup({
      disabled: true,
      selectedIndex: 1,
    });
    const buttons = getAllByRole("radio");

    // 4 toggle buttons
    expect(buttons.length).toBe(4);
    expect(buttons[0]).toHaveTextContent("Home");
    expect(buttons[0]).toHaveAttribute("aria-checked", "false");
    expect(buttons[0]).toHaveAttribute("aria-disabled", "true");
    expect(buttons[0]).toHaveAttribute("tabindex", "-1");
    expect(buttons[1]).toHaveTextContent("Search");
    expect(buttons[1]).toHaveAttribute("aria-checked", "true");
    expect(buttons[1]).toHaveAttribute("aria-disabled", "true");
    expect(buttons[1]).toHaveAttribute("tabindex", "-1");
    expect(buttons[2]).toHaveTextContent("Print");
    expect(buttons[2]).toHaveAttribute("aria-checked", "false");
    expect(buttons[2]).toHaveAttribute("aria-disabled", "true");
    expect(buttons[2]).toHaveAttribute("tabindex", "-1");
    expect(buttons[3]).toHaveTextContent("Alert");
    expect(buttons[3]).toHaveAttribute("aria-checked", "false");
    expect(buttons[3]).toHaveAttribute("aria-disabled", "true");
    expect(buttons[3]).toHaveAttribute("tabindex", "-1");

    fireEvent.click(buttons[0]);
    // It should not fire onChange event
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
  });
});
