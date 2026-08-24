import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";
import * as sliderStories from "~stories/slider/slider.stories";

const { Default } = composeStories(sliderStories);

const slider = () => page.getByRole("slider");
const thumb = () => page.getByTestId("sliderThumb");

function rail() {
  const element = document.querySelector<HTMLElement>(".saltSliderTrack-rail");
  if (!element) throw new Error("Slider rail missing");
  return element;
}

async function press(key: string) {
  slider().element().focus();
  await userEvent.keyboard(key);
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function dispatchPointer(
  target: EventTarget,
  type: "pointerdown" | "pointermove" | "pointerup",
  pointerType: "mouse" | "touch",
  clientX: number,
  clientY: number,
) {
  await act(async () => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: type === "pointerup" ? 0 : 1,
        clientX,
        clientY,
        isPrimary: true,
        pointerId: 1,
        pointerType,
      }),
    );
  });
}

describe("Given a Slider", () => {
  it("renders with the default props", async () => {
    await renderWithSalt(<Default />);
    await expect.element(slider()).toHaveValue("50");
  });

  it("reports pointer changes and the final track value", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={0}
        max={10}
        defaultValue={0}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    const track = rail();
    const rect = track.getBoundingClientRect();
    await userEvent.click(track, {
      delay: 100,
      position: { x: Math.round(rect.width * 0.75), y: rect.height / 2 },
    });
    await expect.element(slider()).toHaveValue("7");
    expect(onChange.mock.lastCall?.[1]).toBe(7);
    expect(onChangeEnd.mock.lastCall?.[1]).toBe(7);
  });

  it.each(["mouse", "touch"] as const)(
    "drags with a %s pointer, stops on release, and restores keyboard focus styling",
    async (pointerType) => {
      const onChange = vi.fn();
      const onChangeEnd = vi.fn();
      await renderWithSalt(
        <Default
          min={0}
          max={10}
          defaultValue={1}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
        />,
      );
      const trackRect = rail().getBoundingClientRect();
      const dragX = trackRect.left + trackRect.width * 0.6;
      const afterReleaseX = trackRect.left + trackRect.width * 0.9;
      const pointerY = trackRect.top + trackRect.height / 2;

      await dispatchPointer(
        thumb().element(),
        "pointerdown",
        pointerType,
        trackRect.left + trackRect.width * 0.1,
        pointerY,
      );
      await nextFrame();
      await dispatchPointer(
        window,
        "pointermove",
        pointerType,
        dragX,
        pointerY,
      );
      await expect.element(slider()).toHaveValue("6");
      await expect.element(slider()).toHaveFocus();
      await expect
        .element(thumb())
        .not.toHaveClass("saltSliderThumb-focusVisible");

      await dispatchPointer(window, "pointerup", pointerType, dragX, pointerY);
      await nextFrame();
      const valueAfterRelease = (slider().element() as HTMLInputElement).value;
      expect(onChange.mock.lastCall?.[1]).toBe(Number(valueAfterRelease));
      expect(onChangeEnd.mock.lastCall?.[1]).toBe(Number(valueAfterRelease));

      await dispatchPointer(
        window,
        "pointermove",
        pointerType,
        afterReleaseX,
        pointerY,
      );
      await nextFrame();
      await expect.element(slider()).toHaveValue(valueAfterRelease);

      await userEvent.keyboard("{ArrowRight}");
      await expect.element(thumb()).toHaveClass("saltSliderThumb-focusVisible");
      await expect
        .element(slider())
        .toHaveValue(String(Number(valueAfterRelease) + 1));
    },
  );

  it("updates through all supported keyboard controls", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={5}
        max={125}
        step={5}
        defaultValue={100}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    for (const [key, value] of [
      ["{ArrowRight}", "105"],
      ["{ArrowLeft}", "100"],
      ["{PageUp}", "110"],
      ["{PageDown}", "100"],
      ["{Home}", "5"],
      ["{End}", "125"],
    ] as const) {
      await press(key);
      await expect.element(slider()).toHaveValue(value);
    }
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(onChangeEnd).toHaveBeenCalledTimes(6);
    expect(onChangeEnd.mock.lastCall?.[1]).toBe(125);
  });

  it("ignores non-interactive keys", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default onChange={onChange} onChangeEnd={onChangeEnd} />,
    );
    await press(" ");
    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeEnd).not.toHaveBeenCalled();
  });

  it("uses stepMultiplier for page navigation", async () => {
    await renderWithSalt(
      <Default defaultValue={10} min={0} max={30} stepMultiplier={10} />,
    );
    await press("{PageUp}");
    await expect.element(slider()).toHaveValue("20");
  });

  it("confines values to marks", async () => {
    await renderWithSalt(
      <Default
        defaultValue={0}
        min={0}
        max={10}
        restrictToMarks
        marks={[
          { value: 2, label: "2" },
          { value: 5, label: "5" },
          { value: 9, label: "9" },
        ]}
      />,
    );
    await expect.element(slider()).toHaveValue("2");
    for (const [key, value] of [
      ["{ArrowRight}", "5"],
      ["{ArrowRight}", "9"],
      ["{ArrowRight}", "9"],
      ["{ArrowLeft}", "5"],
      ["{ArrowLeft}", "2"],
      ["{ArrowLeft}", "2"],
    ] as const) {
      await press(key);
      await expect.element(slider()).toHaveValue(value);
    }
  });

  it("renders inline labels and marks", async () => {
    await renderWithSalt(
      <Default
        min={0}
        max={10}
        marks={[
          { value: 2, label: "Two" },
          { value: 3, label: "Three" },
        ]}
        minLabel="Very low"
        maxLabel="Very high"
      />,
    );
    for (const text of ["Very low", "Very high", "Two", "Three"])
      await expect.element(page.getByText(text)).toBeInTheDocument();
  });

  it("does not move or fire callbacks beyond its bounds", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={5}
        max={20}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    await press("{Home}");
    await press("{ArrowLeft}");
    await expect.element(slider()).toHaveValue("5");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    await press("{End}");
    await press("{ArrowRight}");
    await expect.element(slider()).toHaveValue("20");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChangeEnd).toHaveBeenCalledTimes(2);
  });

  it.each([
    [-10, "0"],
    [100, "10"],
    [1.5, "2"],
  ])("normalizes default value %s to %s", async (defaultValue, value) => {
    await renderWithSalt(
      <Default min={0} max={10} defaultValue={defaultValue} />,
    );
    await expect.element(slider()).toHaveValue(value);
  });

  it("is disabled and omitted from tab order", async () => {
    await renderWithSalt(<Default disabled defaultValue={2} />);
    await expect.element(slider()).toBeDisabled();
    await userEvent.tab();
    await expect.element(slider()).not.toHaveFocus();
  });

  it.each([
    [undefined, "2"],
    [(value: number) => `${value}%`, "2%"],
  ] as const)("formats tooltip text", async (format, text) => {
    await renderWithSalt(<Default defaultValue={2} format={format} />);
    await thumb().hover();
    await expect
      .element(page.getByTestId("sliderTooltip"))
      .toHaveTextContent(text);
  });

  it("omits the tooltip when showTooltip is false", async () => {
    await renderWithSalt(<Default defaultValue={2} showTooltip={false} />);
    await thumb().hover();
    await expect
      .element(page.getByTestId("sliderTooltip"))
      .not.toBeInTheDocument();
  });

  it("rounds using decimalPlaces", async () => {
    await renderWithSalt(
      <Default
        min={0}
        max={4.3}
        step={0.375}
        decimalPlaces={2}
        defaultValue={0}
      />,
    );
    for (const value of ["0.38", "0.75", "1.13"]) {
      await press("{ArrowRight}");
      await expect.element(slider()).toHaveAttribute("value", value);
    }
  });

  it("supports uncontrolled updates", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <Default min={0} max={10} defaultValue={4} onChange={onChange} />,
    );
    await press("{ArrowRight}");
    await expect.element(slider()).toHaveValue("5");
    expect(onChange.mock.lastCall?.[1]).toBe(5);
  });

  it("keeps a controlled value while reporting changes", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={0}
        max={10}
        value={4}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    await press("{ArrowRight}");
    await expect.element(slider()).toHaveValue("4");
    expect(onChange.mock.lastCall?.[1]).toBe(5);
    expect(onChangeEnd.mock.lastCall?.[1]).toBe(5);
  });

  it("keeps step-aligned values when the range is uneven", async () => {
    await renderWithSalt(
      <Default min={0} max={1} step={0.3} defaultValue={0} />,
    );
    for (const [key, value] of [
      ["{ArrowRight}", "0.3"],
      ["{ArrowRight}", "0.6"],
      ["{ArrowRight}", "0.9"],
      ["{ArrowRight}", "0.9"],
      ["{ArrowLeft}", "0.6"],
      ["{ArrowLeft}", "0.3"],
      ["{ArrowLeft}", "0"],
    ] as const) {
      await press(key);
      await expect.element(slider()).toHaveValue(value);
    }
  });

  it("shows keyboard focus while navigating", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();
    await expect.element(slider()).toHaveFocus();
    await expect.element(thumb()).toHaveClass("saltSliderThumb-focusVisible");
    await press("{ArrowRight}");
    await expect.element(thumb()).toHaveClass("saltSliderThumb-focusVisible");
  });

  it("applies the name to its input", async () => {
    await renderWithSalt(<Default name="volume" />);
    await expect.element(slider()).toHaveAttribute("name", "volume");
  });
});
