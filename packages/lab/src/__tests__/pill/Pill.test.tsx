import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CallIcon } from "@brandname/icons";
import { Pill } from "../../pill";

/**
 * Changes applied to the tests after copy over
 *
 * - All snapshot tests are skipped
 * - New API `clickable` `deletable` or variant="x" is added to the relavent test
 * - Remove `classes={{ active: 'foo' }}` for '.Pill-active'
 * - Use event.key instead of 'keycode' for events
 * - Use userEvent.type instead of fireEvent.keyDown
 */

describe("GIVEN a Pill", () => {
  it.skip("THEN should render a `standard` Pill", () => {
    const { container } = render(<Pill label="Pill text" />);
    expect(container).toMatchSnapshot();
  });

  it.skip("THEN should render a `disabled` Pill for disabled", () => {
    const { container } = render(<Pill disabled label="Pill disabled" />);
    expect(container).toMatchSnapshot();
  });

  it("THEN should call onClick when Pill is clicked", () => {
    const onClickSpy = jest.fn();
    const { getByRole } = render(<Pill label="label" onClick={onClickSpy} />);
    fireEvent.click(getByRole("button"));
    expect(onClickSpy).toBeCalledTimes(1);
  });

  it("THEN should ignore onClick when both onClick and onDelete are passed as props", () => {
    const onClickSpy = jest.fn();
    const onDeleteSpy = jest.fn();
    const { getByRole } = render(
      <Pill
        label="label"
        variant="closable"
        onClick={onClickSpy}
        onDelete={onDeleteSpy}
      />
    );
    fireEvent.click(getByRole("button"));
    expect(onClickSpy).toBeCalledTimes(0);
  });

  it("THEN clicking the pill should not trigger onDelete", () => {
    const onDeleteSpy = jest.fn();
    const { getByRole } = render(
      <Pill label="label" variant="closable" onDelete={onDeleteSpy} />
    );
    fireEvent.click(getByRole("button"));
    expect(onDeleteSpy).toBeCalledTimes(0);
  });

  test("THEN should call onClick when Enter is pressed", () => {
    const onClickSpy = jest.fn();
    render(<Pill label="label" onClick={onClickSpy} />);

    const pill = screen.getByRole("button");
    pill.focus();
    // `skipClick` skips focus() as we manually focus above. testing-library uses click to focus.
    userEvent.type(pill, "{enter}", { skipClick: true });
    expect(onClickSpy).toBeCalledTimes(1);
  });

  test("THEN should call onClick when Space is pressed", () => {
    const onClickSpy = jest.fn();
    render(<Pill label="label" onClick={onClickSpy} />);

    const pill = screen.getByRole("button");
    pill.focus();
    // `skipClick` skips focus() as we manually focus above. testing-library uses click to focus.
    userEvent.type(pill, "{space}", { skipClick: true });
    expect(onClickSpy).toBeCalledTimes(1);
  });

  test.each(["Enter", " "])(
    "THEN should apply keyBoard active class when clickable and %s is pressed",
    (key) => {
      const onClickSpy = jest.fn();
      const { getByRole } = render(<Pill label="label" onClick={onClickSpy} />);
      fireEvent.keyDown(getByRole("button"), {
        key,
      });
      expect(getByRole("button")).toHaveClass("uitkPill-active");
    }
  );

  test.each(["Delete", "Backspace"])(
    "THEN should NOT apply keyBoard active class when clickable and %s is pressed",
    (key) => {
      const onClickSpy = jest.fn();
      const { getByRole } = render(<Pill label="label" onClick={onClickSpy} />);
      fireEvent.keyDown(getByRole("button"), {
        key,
      });
      expect(getByRole("button")).not.toHaveClass("uitkPill-active");
    }
  );

  it("THEN should call onDelete when Delete button is clicked", () => {
    const onDeleteSpy = jest.fn();
    const { getByTestId } = render(
      <Pill label="label" variant="closable" onDelete={onDeleteSpy} />
    );
    fireEvent.click(getByTestId("pill-delete-button"));
    expect(onDeleteSpy).toBeCalledTimes(1);
  });

  test("THEN should call onDelete when Enter is pressed", () => {
    const onDeleteSpy = jest.fn();
    const { getByRole } = render(
      <Pill label="label" variant="closable" onDelete={onDeleteSpy} />
    );
    fireEvent.keyUp(getByRole("button"), {
      key: "Enter",
    });
    expect(onDeleteSpy).toBeCalledTimes(1);
  });

  test.each(["Delete", "Backspace"])(
    "THEN should call onDelete when %s is pressed",
    (key) => {
      const onDeleteSpy = jest.fn();
      const { getByRole } = render(
        <Pill label="label" variant="closable" onDelete={onDeleteSpy} />
      );
      fireEvent.keyUp(getByRole("button"), { key });
      expect(onDeleteSpy).toBeCalledTimes(1);
    }
  );

  test.each(["Enter", "Delete", "Backspace"])(
    "THEN should apply keyBoard active class when deletable and %s is pressed",
    (key) => {
      const onDeleteSpy = jest.fn();
      const { getByRole } = render(
        <Pill label="label" variant="closable" onDelete={onDeleteSpy} />
      );
      fireEvent.keyDown(getByRole("button"), {
        key,
      });
      expect(getByRole("button")).toHaveClass("uitkPill-active");
    }
  );

  // Icon name is no longer supported
  it.skip("THEN should render an icon given icon name", () => {
    // const { container } = render(<Pill icon="phone" label="label" />);
    // expect(container.querySelectorAll('.uitk-wrap-icon')).toHaveLength(1);
  });

  it("THEN should render an icon given icon component", () => {
    const { getByTestId } = render(<Pill icon={<CallIcon />} label="label" />);
    expect(getByTestId(/CallIcon/i)).toBeInTheDocument();
  });
});
