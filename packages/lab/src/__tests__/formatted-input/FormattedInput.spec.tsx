import { fireEvent, render, screen } from "@testing-library/react";

import { FormattedInput } from "../../formatted-input";
import { createRef } from "react";

describe("GIVEN FormattedInput", () => {
  describe("When mounted as an uncontrolled component", () => {
    it("THEN should render with the specified defaultValue", () => {
      render(<FormattedInput defaultValue="The default value" />);
      expect(screen.getByRole("textbox")).toHaveValue("The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN calls onChange", () => {
        const onChangeSpy = jest.fn();
        render(
          <FormattedInput
            defaultValue="The default value"
            onChange={onChangeSpy}
          />
        );

        fireEvent.change(screen.getByRole("textbox"), {
          target: { value: "new value" },
        });

        expect(onChangeSpy).toHaveBeenCalledWith("new value");
      });
    });

    describe("When FormattedInput is disabled", () => {
      it("THEN should render disabled", () => {
        render(<FormattedInput defaultValue="The default value" disabled />);
        expect(screen.getByRole("textbox")).toHaveAttribute("disabled");
      });
    });

    describe("When FormattedInput is readOnly", () => {
      it("THEN should render readOnly", () => {
        render(<FormattedInput defaultValue="The default value" readOnly />);
        expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
      });
    });
  });

  describe("When mounted as a controlled component", () => {
    it("THEN should render with the specified value", () => {
      render(<FormattedInput value="text value" />);
      expect(screen.getByRole("textbox")).toHaveValue("text value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN calls onChange", () => {
        const onChangeSpy = jest.fn();
        render(
          <FormattedInput value="The default value" onChange={onChangeSpy} />
        );

        fireEvent.change(screen.getByRole("textbox"), {
          target: { value: "new value" },
        });

        expect(onChangeSpy).toHaveBeenCalledWith("new value");
      });
    });
  });

  describe("WHEN a mask is supplied", () => {
    it("THEN should render the mask text", () => {
      const { container } = render(<FormattedInput mask="XX-XX-XX" />);
      expect(container.querySelector("span")).toHaveTextContent("XX-XX-XX");
    });

    it("THEN should add the mask as an aria-label on the input", () => {
      render(<FormattedInput mask="XX-XX-XX" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-label",
        "XX-XX-XX"
      );
    });

    describe("AND a value is supplied", () => {
      it("THEN should display part of the mask", () => {
        const { container } = render(
          <FormattedInput mask="XX-XX-XX" value="12" />
        );
        expect(container.querySelector("span")).toHaveTextContent("-XX-XX");
      });
    });
  });

  describe("WHEN an id is not supplied", () => {
    it("THEN should self reference a generated id", () => {
      render(<FormattedInput mask="XX-XX-XX" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-labelledby", input.id);
    });
  });

  describe("WHEN an id is supplied", () => {
    it("THEN should self reference the id", () => {
      render(<FormattedInput mask="XX-XX-XX" id="staticId" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-labelledby",
        "staticId"
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "staticId");
    });
  });

  describe("WHEN an aria-label is supplied", () => {
    it("THEN should be ignored", () => {
      render(
        <FormattedInput
          mask="XX-XX-XX"
          inputProps={{ "aria-label": "fake label" }}
        />
      );
      expect(screen.getByRole("textbox")).not.toHaveAttribute(
        "aria-label",
        "fake label"
      );
    });
  });

  describe("WHEN an aria-labelledby is supplied", () => {
    it("THEN should still self reference the id", () => {
      render(
        <FormattedInput
          mask="XX-XX-XX"
          id="staticId"
          inputProps={{ "aria-labelledby": "fakeId" }}
        />
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-labelledby",
        "fakeId staticId"
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "staticId");
    });
  });

  describe("WHEN rifmOptions are supplied", () => {
    it("THEN should pass it to rifm", () => {
      render(
        <FormattedInput
          rifmOptions={{ replace: (string) => string.toUpperCase() }}
        />
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "lowercase" },
      });

      expect(screen.getByRole("textbox")).toHaveValue("LOWERCASE");
    });
  });

  describe("WHEN inputRef is supplied", () => {
    it("THEN should resolve to the input element", () => {
      const inputRef = createRef<HTMLInputElement>();
      render(<FormattedInput ref={inputRef} />);

      expect(inputRef.current?.tagName).toEqual("INPUT");
      expect(inputRef.current).toEqual(screen.getByRole("textbox"));
    });
  });

  describe("WHEN the input is passed a classname", () => {
    it("THEN should be applied to the mask too", () => {
      const { container } = render(
        <FormattedInput inputProps={{ className: "inputClassName" }} />
      );
      expect(container.querySelector("input")).toHaveClass("inputClassName");
      expect(container.querySelector("span")).toHaveClass("inputClassName");
    });
  });
});
