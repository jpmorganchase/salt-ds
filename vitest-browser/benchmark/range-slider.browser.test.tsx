import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as rangeSliderStories from "~stories/range-slider/range-slider.stories";
import { renderWithSalt } from "../render";

const { Default } = composeStories(rangeSliderStories);
const sliders = () => page.getByRole("slider");

function rail() {
  const element = document.querySelector<HTMLElement>(".saltSliderTrack-rail");
  if (!element) throw new Error("Range slider rail missing");
  return element;
}

async function press(index: number, key: string) {
  sliders().nth(index).element().focus();
  await userEvent.keyboard(key);
}

async function expectValues(start: string, end: string) {
  await expect.element(sliders().nth(0)).toHaveValue(start);
  await expect.element(sliders().nth(1)).toHaveValue(end);
}

describe("Given a Range Slider", () => {
  it("renders with default props", async () => {
    await renderWithSalt(<Default />);
    expect(await sliders().elements()).toHaveLength(2);
    await expectValues("0", "50");
  });

  it("reports pointer changes and the final track range", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={0}
        max={10}
        defaultValue={[0, 2]}
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
    await expectValues("0", "7");
    expect(onChange.mock.lastCall?.[1]).toEqual([0, 7]);
    expect(onChangeEnd.mock.lastCall?.[1]).toEqual([0, 7]);
  });

  it("updates both thumbs through keyboard navigation", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={5}
        max={125}
        step={5}
        defaultValue={[25, 100]}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    await press(1, "{ArrowRight}");
    await expectValues("25", "105");
    await press(1, "{ArrowLeft}");
    await expectValues("25", "100");
    await press(0, "{PageUp}");
    await expectValues("35", "100");
    await press(0, "{PageDown}");
    await expectValues("25", "100");
    await press(0, "{Home}");
    await press(1, "{End}");
    await expectValues("5", "125");
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(onChangeEnd).toHaveBeenCalledTimes(6);
  });

  it("ignores non-interactive keys", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default onChange={onChange} onChangeEnd={onChangeEnd} />,
    );
    await press(0, " ");
    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeEnd).not.toHaveBeenCalled();
  });

  it("uses stepMultiplier for page navigation", async () => {
    await renderWithSalt(
      <Default defaultValue={[10, 20]} min={0} max={30} stepMultiplier={10} />,
    );
    await press(1, "{PageUp}");
    await expectValues("10", "30");
  });

  it("prevents thumbs from crossing", async () => {
    await renderWithSalt(<Default min={0} max={10} defaultValue={[4, 6]} />);
    await press(0, "{End}");
    await expectValues("6", "6");
    await press(1, "{Home}");
    await expectValues("6", "6");
  });

  it("does not move beyond min and max", async () => {
    await renderWithSalt(<Default min={5} max={20} defaultValue={[5, 20]} />);
    await press(0, "{ArrowLeft}");
    await press(1, "{ArrowRight}");
    await expectValues("5", "20");
  });

  it.each([
    [
      [-10, 5],
      [0, 5],
    ],
    [
      [5, 100],
      [5, 10],
    ],
    [
      [1.5, 8.5],
      [2, 9],
    ],
  ] as const)("normalizes default range %j", async (defaultValue, value) => {
    await renderWithSalt(
      <Default min={0} max={10} defaultValue={[...defaultValue]} />,
    );
    await expectValues(String(value[0]), String(value[1]));
  });

  it("confines both values to marks", async () => {
    await renderWithSalt(
      <Default
        min={0}
        max={10}
        defaultValue={[0, 10]}
        restrictToMarks
        marks={[
          { value: 2, label: "2" },
          { value: 5, label: "5" },
          { value: 9, label: "9" },
        ]}
      />,
    );
    await expectValues("2", "9");
    await press(0, "{ArrowRight}");
    await press(1, "{ArrowLeft}");
    await expectValues("5", "5");
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

  it("is disabled and omitted from tab order", async () => {
    await renderWithSalt(<Default disabled defaultValue={[2, 4]} />);
    for (const input of await sliders().elements())
      expect(input).toBeDisabled();
    await userEvent.tab();
    await expect.element(sliders().nth(0)).not.toHaveFocus();
    await expect.element(sliders().nth(1)).not.toHaveFocus();
  });

  it("formats tooltip and accessible values", async () => {
    await renderWithSalt(
      <Default defaultValue={[2, 4]} format={(value: number) => `${value}%`} />,
    );
    const thumbs = page.getByTestId("sliderThumb");
    await thumbs.nth(0).hover();
    await expect
      .element(page.getByTestId("sliderTooltip").nth(0))
      .toHaveTextContent("2%");
    await expect
      .element(sliders().nth(0))
      .toHaveAttribute("aria-valuetext", "2%");
  });

  it("omits tooltips when showTooltip is false", async () => {
    await renderWithSalt(<Default defaultValue={[2, 4]} showTooltip={false} />);
    await page.getByTestId("sliderThumb").nth(0).hover();
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
        defaultValue={[0, 2]}
      />,
    );
    for (const value of ["0.38", "0.75", "1.13"]) {
      await press(0, "{ArrowRight}");
      await expect.element(sliders().nth(0)).toHaveAttribute("value", value);
    }
  });

  it("keeps controlled values while reporting updates", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    await renderWithSalt(
      <Default
        min={0}
        max={10}
        value={[2, 7]}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    await press(1, "{ArrowRight}");
    await expectValues("2", "7");
    expect(onChange.mock.lastCall?.[1]).toEqual([2, 8]);
    expect(onChangeEnd.mock.lastCall?.[1]).toEqual([2, 8]);
  });

  it("keeps step-aligned values when the range is uneven", async () => {
    await renderWithSalt(
      <Default min={0} max={1} step={0.3} defaultValue={[0, 0.3]} />,
    );
    for (const [key, value] of [
      ["{ArrowRight}", "0.6"],
      ["{ArrowRight}", "0.9"],
      ["{ArrowRight}", "0.9"],
      ["{ArrowLeft}", "0.6"],
      ["{ArrowLeft}", "0.3"],
      ["{ArrowLeft}", "0"],
    ] as const) {
      await press(1, key);
      await expect.element(sliders().nth(1)).toHaveValue(value);
    }
  });

  it("shows keyboard focus on the active thumb", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();
    await expect.element(sliders().nth(0)).toHaveFocus();
    await expect
      .element(page.getByTestId("sliderThumb").nth(0))
      .toHaveClass("saltSliderThumb-focusVisible");
  });

  it("applies startName and endName", async () => {
    await renderWithSalt(<Default startName="minimum" endName="maximum" />);
    await expect.element(sliders().nth(0)).toHaveAttribute("name", "minimum");
    await expect.element(sliders().nth(1)).toHaveAttribute("name", "maximum");
  });
});
