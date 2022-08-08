import { fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "../../slider";

describe("Given a Slider with a single value", () => {
  const onChangeSpy = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    render(
      <Slider
        label={"TestLabel"}
        min={5}
        max={125}
        step={5}
        pageStep={25}
        defaultValue={100}
        onChange={onChangeSpy}
      />
    );
  });

  it("THEN it should have ARIA roles and attributes", () => {
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "5");
    expect(slider).toHaveAttribute("aria-valuemax", "125");
    expect(slider).toHaveAttribute("aria-disabled", "false");
  });

  it("THEN it should respond to keyboard", () => {
    const slider = screen.getByRole("slider");
    // Arrows should move the value one "step" up/down
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenLastCalledWith(95);
    expect(slider).toHaveAttribute("aria-valuenow", "95");
    // Page Up/Down buttons should move the value one "pageStep" up/down
    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(70);
    // End key should move the value to max
    fireEvent.keyDown(slider, { key: "End" });
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenLastCalledWith(125);
    // Home key should move the value to min
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChangeSpy).toHaveBeenCalledTimes(4);
    expect(onChangeSpy).toHaveBeenLastCalledWith(5);
  });
});

describe("Given a Slider with a range value", () => {
  beforeEach(() => {
    render(
      <Slider
        label={"TestLabel"}
        min={-100}
        max={100}
        step={10}
        defaultValue={[20, 40]}
      />
    );
  });

  it("THEN it should have ARIA roles and attributes", () => {
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute(
      "aria-label",
      "TestLabel slider from -100 to 100"
    );
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute("aria-label", "Min");
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "20");
    expect(sliders[1]).toHaveAttribute("aria-label", "Max");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "40");
  });
});

describe("Given a Slider with more than 2 items in the value", () => {
  beforeEach(() => {
    render(
      <Slider
        label={"TestLabel"}
        min={-10}
        max={110}
        step={1}
        defaultValue={[20, 40, 100]}
      />
    );
  });

  it("THEN it should have ARIA roles and attributes", () => {
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute(
      "aria-label",
      "TestLabel slider from -10 to 110"
    );
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(3);
    expect(sliders[0]).toHaveAttribute("aria-label", "First");
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "20");
    expect(sliders[1]).toHaveAttribute("aria-label", "Second");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "40");
    expect(sliders[2]).toHaveAttribute("aria-label", "Third");
    expect(sliders[2]).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("Given a pushable range slider", () => {
  const onChangeSpy = jest.fn();

  beforeEach(() => {
    render(
      <Slider
        label={"TestLabel"}
        min={-8}
        max={8}
        step={1}
        defaultValue={[-1, 3, 7]}
        pushable={true}
        pushDistance={3}
        onChange={onChangeSpy}
      />
    );
  });

  it("WHEN moving a handle, it should push other handles", () => {
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(3);
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    expect(onChangeSpy).toHaveBeenLastCalledWith([0, 3, 7]);
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    expect(onChangeSpy).toHaveBeenLastCalledWith([1, 4, 7]);
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    expect(onChangeSpy).toHaveBeenLastCalledWith([2, 5, 8]);
    onChangeSpy.mockReset();
    // Should not push beyond max
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "2");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "5");
    expect(sliders[2]).toHaveAttribute("aria-valuenow", "8");
  });
});

describe("Given a non-pushable range slider", () => {
  const onChangeSpy = jest.fn();

  beforeEach(() => {
    render(
      <Slider
        label={"TestLabel"}
        min={-8}
        max={8}
        step={1}
        pageStep={4}
        defaultValue={[-1, 3, 7]}
        onChange={onChangeSpy}
      />
    );
  });

  it("WHEN moving a handle, it should be constrained by the handles next to it", () => {
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(3);

    fireEvent.keyDown(sliders[0], { key: "PageUp" });
    fireEvent.keyDown(sliders[0], { key: "ArrowUp" });
    fireEvent.keyDown(sliders[0], { key: "PageRight" });
    fireEvent.keyDown(sliders[0], { key: "End" });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenLastCalledWith([3, 3, 7]);

    fireEvent.keyDown(sliders[2], { key: "Home" });
    fireEvent.keyDown(sliders[2], { key: "PageDown" });
    fireEvent.keyDown(sliders[2], { key: "ArrowLeft" });
    fireEvent.keyDown(sliders[2], { key: "ArrowDown" });
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith([3, 3, 3]);
  });
});
