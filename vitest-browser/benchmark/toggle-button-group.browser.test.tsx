import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import {
  HomeIcon,
  NotificationIcon,
  PrintIcon,
  SearchIcon,
} from "@salt-ds/icons";
import { type ComponentProps, type SyntheticEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

type GroupProps = ComponentProps<typeof ToggleButtonGroup> & {
  disableHome?: boolean;
};

function Options({ disableHome = true }: { disableHome?: boolean }) {
  return (
    <>
      <ToggleButton value="alert">
        <NotificationIcon aria-hidden />
        Alert
      </ToggleButton>
      <ToggleButton disabled={disableHome} value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>
      <ToggleButton value="search">
        <SearchIcon aria-hidden />
        Search
      </ToggleButton>
      <ToggleButton value="print">
        <PrintIcon aria-hidden />
        Print
      </ToggleButton>
    </>
  );
}

function Group({ disableHome, ...props }: GroupProps) {
  return (
    <ToggleButtonGroup aria-label="Toggle options" {...props}>
      <Options disableHome={disableHome} />
    </ToggleButtonGroup>
  );
}

function ControlledGroup({
  disabled,
  initialValue = "print",
  onChange,
  readOnly,
}: {
  disabled?: boolean;
  initialValue?: string;
  onChange?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.persist();
    setValue(event.currentTarget.value);
    onChange?.(event);
  };
  return (
    <Group
      disabled={disabled}
      onChange={handleChange}
      readOnly={readOnly}
      value={value}
    />
  );
}

describe("GIVEN an uncontrolled ToggleButtonGroup", () => {
  it("has an accessible radiogroup", async () => {
    await renderWithSalt(<Group />);
    await expect
      .element(page.getByRole("radiogroup"))
      .toHaveAccessibleName("Toggle options");
  });

  it("respects defaultValue", async () => {
    await renderWithSalt(<Group defaultValue="home" />);
    for (const [name, selected, tabIndex] of [
      ["Alert", "false", "-1"],
      ["Home", "true", "0"],
      ["Search", "false", "-1"],
      ["Print", "false", "-1"],
    ] as const) {
      const radio = page.getByRole("radio", { name });
      await expect.element(radio).toHaveAttribute("aria-checked", selected);
      await expect.element(radio).toHaveAttribute("tabindex", tabIndex);
    }
  });

  it("fires onChange when selection changes", async () => {
    const onChange = vi.fn();
    const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
      event.persist();
      onChange(event);
    };
    await renderWithSalt(
      <Group defaultValue="alert" onChange={handleChange} />,
    );

    await page.getByRole("radio", { name: "Search" }).click();
    expect(onChange.mock.lastCall?.[0].target).toHaveProperty(
      "value",
      "search",
    );
    await page.getByRole("radio", { name: "Print" }).click();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.lastCall?.[0].target).toHaveProperty("value", "print");
  });

  it("does not deselect the selected button", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Group defaultValue="print" onChange={onChange} />);
    const selected = page.getByRole("radio", { name: "Print" });
    await selected.click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(selected).toHaveAttribute("aria-checked", "true");
  });
});

describe("GIVEN a controlled ToggleButtonGroup", () => {
  it("updates value and roving tab index", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<ControlledGroup onChange={onChange} />);
    const radios = page.getByRole("radio");
    expect(await radios.elements()).toHaveLength(4);
    await expect.element(radios.nth(3)).toHaveAttribute("aria-checked", "true");
    await expect.element(radios.nth(3)).toHaveAttribute("tabindex", "0");

    await radios.nth(0).click();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.lastCall?.[0].target).toHaveProperty("value", "alert");
    await expect.element(radios.nth(0)).toHaveAttribute("aria-checked", "true");
    await expect.element(radios.nth(0)).toHaveAttribute("tabindex", "0");
    await expect.element(radios.nth(3)).toHaveAttribute("tabindex", "-1");
  });

  it("does not deselect the selected value", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <ControlledGroup initialValue="search" onChange={onChange} />,
    );
    const selected = page.getByRole("radio", { name: "Search" });
    await selected.click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(selected).toHaveAttribute("aria-checked", "true");
  });
});

describe("GIVEN a disabled ToggleButtonGroup", () => {
  it("disables every option without changing value", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <ControlledGroup disabled initialValue="search" onChange={onChange} />,
    );
    const radios = page.getByRole("radio");
    for (const radio of await radios.elements()) expect(radio).toBeDisabled();
    await expect.element(radios.nth(2)).toHaveAttribute("aria-checked", "true");
    await radios.nth(0).click({ force: true });
    await radios.nth(2).click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not receive focus", async () => {
    await renderWithSalt(<Group disabled value="home" />);
    await userEvent.tab();
    await expect.element(page.getByRole("radiogroup")).not.toHaveFocus();
    for (const radio of await page.getByRole("radio").elements())
      expect(radio).not.toHaveFocus();
  });
});

describe("GIVEN a read-only ToggleButtonGroup", () => {
  it("preserves value and ignores interaction", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <ControlledGroup initialValue="search" onChange={onChange} readOnly />,
    );
    await expect
      .element(page.getByRole("radiogroup"))
      .toHaveAttribute("aria-readonly");
    const selected = page.getByRole("radio", { name: "Search" });
    await expect.element(selected).toHaveAttribute("aria-checked", "true");
    await page.getByRole("radio", { name: "Alert" }).click({ force: true });
    await selected.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("remains focusable with arrow-key navigation", async () => {
    await renderWithSalt(<Group disableHome={false} readOnly value="home" />);
    await userEvent.tab();
    await expect
      .element(page.getByRole("radio", { name: "Home" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("radio", { name: "Search" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("radio", { name: "Print" }))
      .toHaveFocus();
  });
});

describe("GIVEN ToggleButtonGroup styling props", () => {
  it("respects child sentiments", async () => {
    await renderWithSalt(
      <ToggleButtonGroup sentiment="accented" aria-label="Toggle options">
        <ToggleButton sentiment="neutral" value="alert">
          Alert
        </ToggleButton>
        <ToggleButton sentiment="positive" value="home">
          Home
        </ToggleButton>
        <ToggleButton sentiment="negative" value="search">
          Search
        </ToggleButton>
      </ToggleButtonGroup>,
    );
    for (const [index, sentiment] of [
      [0, "neutral"],
      [1, "positive"],
      [2, "negative"],
    ] as const)
      await expect
        .element(page.getByRole("radio").nth(index))
        .toHaveClass(`saltToggleButton-${sentiment}`);
  });

  it("respects child appearances", async () => {
    await renderWithSalt(
      <ToggleButtonGroup appearance="bordered" aria-label="Toggle options">
        {(["alert", "home", "search"] as const).map((value) => (
          <ToggleButton key={value} value={value} appearance="solid">
            {value}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>,
    );
    for (const radio of await page.getByRole("radio").elements())
      expect(radio).toHaveClass("saltToggleButton-solid");
  });
});
