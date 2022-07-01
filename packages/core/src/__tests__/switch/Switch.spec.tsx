import { fireEvent, screen, render } from "@testing-library/react";
import { Switch } from "../../switch";

describe("GIVEN a Switch", () => {
  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      render(<Switch defaultChecked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    describe("WHEN the switch is clicked", () => {
      it("THEN should toggle the selection state", () => {
        const changeSpy = jest.fn();
        render(<Switch onChange={changeSpy} />);
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
      render(<Switch checked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    describe("WHEN the switch is clicked", () => {
      it("THEN should call onChange and not change the selection state", () => {
        const changeSpy = jest.fn();
        render(<Switch onChange={changeSpy} checked={false} />);
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
      render(<Switch disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });
});
