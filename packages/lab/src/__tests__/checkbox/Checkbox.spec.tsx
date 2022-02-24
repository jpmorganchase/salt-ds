import { fireEvent, screen, render } from "@testing-library/react";
import { Checkbox } from "../../checkbox";

describe("GIVEN a Checkbox", () => {
  describe("WHEN in an indeterminate state", () => {
    it("THEN should have aria-checked set to `mixed`", () => {
      render(<Checkbox indeterminate />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "mixed"
      );
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      render(<Checkbox defaultChecked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    describe("WHEN the checkbox is clicked", () => {
      it("THEN should toggle the selection state", () => {
        const changeSpy = jest.fn();
        render(<Checkbox onChange={changeSpy} value="test" />);
        expect(screen.getByRole("checkbox")).not.toBeChecked();
        expect(changeSpy).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("checkbox"));
        expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), true);
        expect(screen.getByRole("checkbox")).toBeChecked();
        fireEvent.click(screen.getByRole("checkbox"));
        expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), false);
        expect(screen.getByRole("checkbox")).not.toBeChecked();
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should be checked if checked is true", () => {
      render(<Checkbox checked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    describe("WHEN the checkbox is clicked", () => {
      it("THEN should call onChange and not change the selection state", () => {
        const changeSpy = jest.fn();
        render(<Checkbox onChange={changeSpy} checked={false} value="test" />);
        expect(screen.getByRole("checkbox")).not.toBeChecked();
        expect(changeSpy).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("checkbox"));
        expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), true);
        expect(screen.getByRole("checkbox")).not.toBeChecked();
      });
    });
  });

  describe("WHEN disabled", () => {
    it("THEN should have the disabled attribute applied", () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });
});
