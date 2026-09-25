import {
  ToggleButton,
  ToggleButtonGroup,
  useToggleButtonGroup,
} from "@salt-ds/core";
import {
  HomeIcon,
  NotificationIcon,
  PrintIcon,
  SearchIcon,
} from "@salt-ds/icons";
import { type ComponentProps, type SyntheticEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { trackDefaultPrevented } from "~browser-test-utils/interactions";
import { renderWithSalt } from "~browser-test-utils/render";

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

function LegacyToggleButton() {
  const toggleButtonGroup = useToggleButtonGroup();

  return (
    <button
      aria-checked={toggleButtonGroup?.isSelected("legacy")}
      onClick={(event) => toggleButtonGroup?.select(event)}
      role="radio"
      type="button"
      value="legacy"
    >
      Legacy
    </button>
  );
}

function ExplicitUndefinedToggleButton() {
  const toggleButtonGroup = useToggleButtonGroup();

  return (
    <button
      aria-checked={toggleButtonGroup?.isSelected(undefined)}
      onClick={(event) => toggleButtonGroup?.select(event, undefined)}
      role="radio"
      type="button"
      value="dom-value"
    >
      Clear
    </button>
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

  it("falls back to the DOM value when select omits its value", async () => {
    await renderWithSalt(
      <ToggleButtonGroup aria-label="Legacy options">
        <LegacyToggleButton />
      </ToggleButtonGroup>,
    );

    const legacy = page.getByRole("radio", { name: "Legacy" });
    await legacy.click();

    await expect.element(legacy).toHaveAttribute("aria-checked", "true");
  });

  it("preserves an explicitly undefined value", async () => {
    await renderWithSalt(
      <ToggleButtonGroup defaultValue="selected" aria-label="Clear selection">
        <ExplicitUndefinedToggleButton />
      </ToggleButtonGroup>,
    );

    const clear = page.getByRole("radio", { name: "Clear" });
    await clear.click();

    await expect.element(clear).toHaveAttribute("aria-checked", "true");
  });
});

describe("GIVEN a ToggleButtonGroup and keyboard navigation", () => {
  it("keeps the selection announced after choosing a numeric value", async () => {
    await renderWithSalt(
      <ToggleButtonGroup defaultValue={2} aria-label="Numeric options">
        <ToggleButton value={1}>One</ToggleButton>
        <ToggleButton value={2}>Two</ToggleButton>
      </ToggleButtonGroup>,
    );

    const one = page.getByRole("radio", { name: "One" });
    const two = page.getByRole("radio", { name: "Two" });

    await one.click();

    // A screen reader must announce the chosen button as checked, and the tab
    // stop must follow it. Otherwise the group reports nothing as selected.
    await expect.element(one).toHaveAttribute("aria-checked", "true");
    await expect.element(two).toHaveAttribute("aria-checked", "false");
    await expect.element(one).toHaveAttribute("tabindex", "0");
    await expect.element(two).toHaveAttribute("tabindex", "-1");
  });

  it("does not report a change when the selected numeric value is reselected", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <ToggleButtonGroup
        defaultValue={2}
        onChange={onChange}
        aria-label="Numeric options"
      >
        <ToggleButton value={1}>One</ToggleButton>
        <ToggleButton value={2}>Two</ToggleButton>
      </ToggleButtonGroup>,
    );

    await page.getByRole("radio", { name: "Two" }).click();

    expect(onChange).not.toHaveBeenCalled();
  });

  it("distinguishes numeric and string values with the same text", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <ToggleButtonGroup
        defaultValue={1}
        onChange={onChange}
        aria-label="Mixed options"
      >
        <ToggleButton value={1}>Numeric one</ToggleButton>
        <ToggleButton value="1">String one</ToggleButton>
      </ToggleButtonGroup>,
    );

    const numericOne = page.getByRole("radio", { name: "Numeric one" });
    const stringOne = page.getByRole("radio", { name: "String one" });

    await expect.element(numericOne).toHaveAttribute("aria-checked", "true");
    await expect.element(stringOne).toHaveAttribute("aria-checked", "false");

    await stringOne.click();

    expect(onChange).toHaveBeenCalledOnce();
    await expect.element(numericOne).toHaveAttribute("aria-checked", "false");
    await expect.element(stringOne).toHaveAttribute("aria-checked", "true");
  });

  it("skips a disabled button when navigating with the arrow keys", async () => {
    await renderWithSalt(<Group defaultValue="alert" />);

    await userEvent.tab();
    await expect
      .element(page.getByRole("radio", { name: "Alert" }))
      .toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("radio", { name: "Search" }))
      .toHaveFocus();
  });

  it("stops the page scrolling when navigating with the arrow keys", async () => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(
      <Group defaultValue="alert" onKeyDown={keyDown.handler} />,
    );

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");

    expect(keyDown.lastDefaultPrevented()).toBe(true);
  });

  it("leaves modified arrow keys to the browser", async () => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(
      <Group defaultValue="alert" onKeyDown={keyDown.handler} />,
    );

    await userEvent.tab();
    const alert = page.getByRole("radio", { name: "Alert" });
    await expect.element(alert).toHaveFocus();

    for (const [modifier, key] of [
      ["Alt", "ArrowRight"],
      ["Control", "ArrowLeft"],
      ["Meta", "ArrowDown"],
    ] as const) {
      await userEvent.keyboard(`{${modifier}>}{${key}}{/${modifier}}`);
      expect(keyDown.lastDefaultPrevented()).toBe(false);
      await expect.element(alert).toHaveFocus();
    }
  });

  it("keeps a single tab stop when a numeric value is 0", async () => {
    await renderWithSalt(
      <ToggleButtonGroup defaultValue={0} aria-label="Numeric options">
        <ToggleButton value={0}>Zero</ToggleButton>
        <ToggleButton value={1}>One</ToggleButton>
      </ToggleButtonGroup>,
    );

    await expect
      .element(page.getByRole("radio", { name: "Zero" }))
      .toHaveAttribute("tabindex", "0");
    await expect
      .element(page.getByRole("radio", { name: "One" }))
      .toHaveAttribute("tabindex", "-1");
  });
});

describe("GIVEN a controlled ToggleButtonGroup", () => {
  it("updates value and roving tab index", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<ControlledGroup onChange={onChange} />);
    const radios = page.getByRole("radio");
    await expect.element(radios).toHaveLength(4);
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
