import { fireEvent, render } from "@testing-library/react";
import { Pill } from "../../pill";

/**
 * Changes applied to the tests after copy over
 *
 * - All snapshot tests are skipped
 * - Change event handler param order is changed to accommodate new API
 * - Update checkbox class name to match new one
 */

describe("GIVEN a Pill", () => {
  it.skip("THEN should render a `selectable` Pill", () => {
    const { container } = render(
      <Pill label="Pill text" variant="selectable" />
    );
    expect(container).toMatchSnapshot();
  });

  it("THEN should call onChange when clicked", () => {
    const onChangeSpy = jest.fn();
    const { getByRole } = render(
      <Pill label="Pill text" onChange={onChangeSpy} variant="selectable" />
    );
    fireEvent.click(getByRole("checkbox"));
    expect(onChangeSpy).toBeCalledTimes(1);
    expect(onChangeSpy).toBeCalledWith(expect.any(Object), true);
  });

  it("THEN should call onChange when clicked with input as false when already checked", () => {
    const onChangeSpy = jest.fn();
    const { getByRole } = render(
      <Pill
        defaultChecked
        label="Pill text"
        onChange={onChangeSpy}
        variant="selectable"
      />
    );
    fireEvent.click(getByRole("checkbox"));
    expect(onChangeSpy).toBeCalledTimes(1);
    expect(onChangeSpy).toBeCalledWith(expect.any(Object), false);
  });

  it("THEN should have aria-checked = false initially", () => {
    const onChangeSpy = jest.fn();
    const { getByRole } = render(
      <Pill label="Pill text" onChange={onChangeSpy} variant="selectable" />
    );
    expect(getByRole("checkbox").getAttribute("aria-checked")).toEqual("false");
  });

  it("THEN should have aria-checked = true when clicked", () => {
    const onChangeSpy = jest.fn();
    const { getByRole } = render(
      <Pill label="Pill text" onChange={onChangeSpy} variant="selectable" />
    );
    fireEvent.click(getByRole("checkbox"));
    expect(getByRole("checkbox").getAttribute("aria-checked")).toEqual("true");
  });

  it("THEN should show a checked checkbox when clicked", () => {
    const onChangeSpy = jest.fn();
    const { getByRole, container } = render(
      <Pill label="Pill text" onChange={onChangeSpy} variant="selectable" />
    );
    fireEvent.click(getByRole("checkbox"));
    expect(
      container.querySelectorAll(".uitkPill-checkbox.uitkCheckboxIcon-checked")
        .length
    ).toEqual(1);
  });

  it("THEN is checked when defaultChecked is true", () => {
    const onChangeSpy = jest.fn();
    const { getByRole } = render(
      <Pill
        defaultChecked
        label="Pill text"
        onChange={onChangeSpy}
        variant="selectable"
      />
    );
    expect(getByRole("checkbox").getAttribute("aria-checked")).toEqual("true");
  });

  it("THEN is checked when checked is true", () => {
    const onChangeSpy = jest.fn();
    const { getByRole } = render(
      <Pill
        checked
        label="Pill text"
        onChange={onChangeSpy}
        variant="selectable"
      />
    );
    expect(getByRole("checkbox").getAttribute("aria-checked")).toEqual("true");
  });
});
