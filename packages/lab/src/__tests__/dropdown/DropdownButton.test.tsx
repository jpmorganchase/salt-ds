import { fireEvent, render, screen } from "@testing-library/react";

import { DropdownButton } from "../../dropdown";

describe("GIVEN a DropdownButton component", () => {
  it("THEN it should be defined", () => expect(DropdownButton).toBeDefined());

  describe("WHEN the button renders", () => {
    beforeEach(() => {
      render(<DropdownButton label="button" />);
    });

    it("THEN it should render correct icon and label", () => {
      expect(screen.getByText("button")).toHaveClass(
        "uitkDropdownButton-buttonLabel"
      );
      expect(screen.getByText("button").parentElement!.lastChild).toHaveClass(
        "uitkDropdownButton-icon"
      );
      expect(screen.getByTestId(/ChevronDownIcon/i)).toBeInTheDocument();
    });

    it("THEN icon should not show aria-label but aria-hidden", () => {
      const iconRoot =
        screen.getByTestId(/ChevronDownIcon/i).parentElement!.parentElement;
      // Make sure it's actually the Icon root according to the naming convention
      expect(iconRoot).toHaveClass("uitkIcon");

      expect(iconRoot).toHaveAttribute("aria-hidden", "true");
      expect(iconRoot).not.toHaveAttribute("aria-label");
    });
  });

  describe("WHEN keyboard event is fired", () => {
    const onKeyDownSpy = jest.fn();
    const onKeyUpSpy = jest.fn();

    beforeEach(() => {
      render(
        <DropdownButton
          label="button"
          onKeyDown={onKeyDownSpy}
          onKeyUp={onKeyUpSpy}
        />
      );
      fireEvent.keyDown(screen.getByTestId("dropdown-button"), { key: "B" });
      fireEvent.keyUp(screen.getByTestId("dropdown-button"), { key: "B" });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("THEN onKeyDown is called", () => {
      expect(onKeyDownSpy).toBeCalled();
    });

    it("THEN onKeyUp is called", () => {
      expect(onKeyUpSpy).toBeCalled();
    });
  });
});
