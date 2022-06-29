import { fireEvent, screen, render } from "@testing-library/react";
import { FormField } from "@jpmorganchase/uitk-core";

import { Input } from "../../input";

//TODO density tests

describe("GIVEN an Input", () => {
  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN it should render with the specified defaultValue", () => {
      render(<Input defaultValue="The default value" />);
      expect(screen.getByRole("textbox")).toHaveValue("The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        let eventTargetValue: any = null;
        render(
          <Input
            defaultValue="The default value"
            onChange={(event) => {
              eventTargetValue = event.target.value;
            }}
          />
        );
        fireEvent.change(screen.getByRole("textbox"), {
          target: { value: "new value" },
        });
        expect(eventTargetValue).toEqual("new value");
      });
    });
  });

  describe("WHEN mounted as an controlled component", () => {
    it("THEN it should render with the specified value", () => {
      render(<Input value="text value" />);
      expect(screen.getByRole("textbox")).toHaveValue("text value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        let eventTargetValue: any = null;
        render(
          <Input
            value="text value"
            onChange={(event) => {
              eventTargetValue = event.target.value;
            }}
          />
        );
        fireEvent.change(screen.getByRole("textbox"), {
          target: { value: "new value" },
        });
        expect(eventTargetValue).toEqual("new value");
      });
    });
  });

  //TODO these should be tested visually rather than unit tested
  describe("WHEN the Input has Text Alignment", () => {
    describe("WHEN textAlign = `left`", () => {
      it("SHOULD render left aligned", () => {
        render(
          <Input
            data-testid="parent"
            defaultValue="The default value"
            textAlign="left"
          />
        );
        expect(screen.getByTestId("parent")).toHaveClass(
          "uitkInput-leftTextAlign"
        );
      });
    });

    describe("WHEN textAlign = `right`", () => {
      it("SHOULD render right aligned", () => {
        render(
          <Input
            data-testid="parent"
            defaultValue="The default value"
            textAlign="right"
          />
        );
        expect(screen.getByTestId("parent")).toHaveClass(
          "uitkInput-rightTextAlign"
        );
      });
    });
  });

  describe("WHEN the Input is disabled", () => {
    it("THEN should render disabled", () => {
      render(<Input defaultValue="The default value" disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("WHEN the Input is read only", () => {
    it("THEN should render read only", () => {
      render(<Input defaultValue="The default value" readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    describe("AND empty", () => {
      it("THEN should render an emdash by default", () => {
        render(<Input readOnly />);
        expect(screen.getByRole("textbox")).toHaveValue("—");
      });

      it("THEN should render an custom marker", () => {
        render(<Input emptyReadOnlyMarker="#" readOnly />);
        expect(screen.getByRole("textbox")).toHaveValue("#");
      });
    });
  });

  describe('WHEN cursorPositionOnFocus is "start"', () => {
    it("THEN should move the cursor to the start on click", () => {
      render(
        <Input cursorPositionOnFocus="start" defaultValue="The default value" />
      );

      fireEvent.click(screen.getByRole("textbox"));
      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(0);
      expect(input.selectionEnd).toEqual(0);
    });

    it("THEN should move the cursor to the start on focus", () => {
      render(
        <Input cursorPositionOnFocus="start" defaultValue="The default value" />
      );

      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(0);
      expect(input.selectionEnd).toEqual(0);
    });
  });

  describe('WHEN cursorPositionOnFocus is "end"', () => {
    it("THEN should move the cursor to the end on click", () => {
      render(
        <Input cursorPositionOnFocus="end" defaultValue="The default value" />
      );

      fireEvent.click(screen.getByRole("textbox"));
      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(17);
      expect(input.selectionEnd).toEqual(17);
    });

    it("THEN should move the cursor to the end on focus", () => {
      render(
        <Input cursorPositionOnFocus="end" defaultValue="The default value" />
      );

      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(17);
      expect(input.selectionEnd).toEqual(17);
    });
  });

  describe("WHEN cursorPositionOnFocus is a number", () => {
    it("THEN should move the cursor that index on click", () => {
      render(
        <Input cursorPositionOnFocus={2} defaultValue="The default value" />
      );

      fireEvent.click(screen.getByRole("textbox"));
      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(2);
      expect(input.selectionEnd).toEqual(2);
    });

    it("THEN should move the cursor to that index on focus", () => {
      render(
        <Input cursorPositionOnFocus={2} defaultValue="The default value" />
      );

      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(2);
      expect(input.selectionEnd).toEqual(2);
    });
  });

  describe("WHEN highlightOnFocus is `true`", () => {
    it("THEN should highlight all text on click", () => {
      render(<Input highlightOnFocus defaultValue="The default value" />);

      fireEvent.click(screen.getByRole("textbox"));
      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(0);
      expect(input.selectionEnd).toEqual(17);
    });

    it("THEN should highlight all text on focus", () => {
      render(<Input highlightOnFocus defaultValue="The default value" />);

      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(0);
      expect(input.selectionEnd).toEqual(17);
    });
  });

  describe("WHEN highlightOnFocus is an array of two numbers", () => {
    it("THEN should highlight all indexes on click", () => {
      render(
        <Input highlightOnFocus={[4, 11]} defaultValue="The default value" />
      );

      fireEvent.click(screen.getByRole("textbox"));
      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(4);
      expect(input.selectionEnd).toEqual(11);
    });

    it("THEN should highlight all text on focus", () => {
      render(
        <Input highlightOnFocus={[4, 11]} defaultValue="The default value" />
      );

      screen.getByRole("textbox").focus();

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.selectionStart).toEqual(4);
      expect(input.selectionEnd).toEqual(11);
    });
  });

  describe("WHEN used in Formfield", () => {
    test("and is disabled Then input within should be disabled", () => {
      render(
        <FormField label="Disabled form field" disabled>
          <Input defaultValue="Value" />
        </FormField>
      );
      expect(screen.getByLabelText(/Disabled form field/i)).toHaveAttribute(
        "disabled"
      );
    });
  });
  test("and is readonly Then input within should be readonly", () => {
    render(
      <FormField label="Readonly form field" readOnly>
        <Input defaultValue="Value" />
      </FormField>
    );
    expect(screen.getByLabelText(/Readonly form field/i)).toHaveAttribute(
      "readonly"
    );
  });
});
