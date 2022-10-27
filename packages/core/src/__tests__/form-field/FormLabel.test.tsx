import { render, screen } from "@testing-library/react";

import { FormLabel } from "../../form-field";

const labelText = "label text";

describe("GIVEN a FormLabel", () => {
  describe("WHEN label is given", () => {
    test("THEN label is rendered", () => {
      render(<FormLabel label={labelText} />);
      expect(screen.getByText(labelText)).toBeInTheDocument();
    });
  });

  describe("WHEN required is true", () => {
    test("THEN Required is rendered if displayedNecessity is set to required", () => {
      render(
        <FormLabel label={labelText} required displayedNecessity="required" />
      );
      expect(screen.getByText(/Required/)).toBeInTheDocument();
    });

    test("THEN Required is NOT rendered if displayedNecessity is not set", () => {
      render(<FormLabel label={labelText} required />);
      expect(screen.queryByText(/Required/)).toBeNull();
    });

    test("THEN Required is NOT rendered if displayedNecessity is set to optional", () => {
      render(
        <FormLabel label={labelText} required displayedNecessity="optional" />
      );
      expect(screen.queryByText(/Required/)).toBeNull();
    });
  });

  describe("WHEN required is false", () => {
    test("THEN Optional is rendered if displayedNecessity is set to optional", () => {
      render(
        <FormLabel
          label={labelText}
          required={false}
          displayedNecessity="optional"
        />
      );
      expect(screen.getByText(/Optional/)).toBeInTheDocument();
    });

    test("THEN Optional is NOT rendered if displayedNecessity is not set", () => {
      render(<FormLabel label={labelText} required={false} />);
      expect(screen.queryByText(/Optional/)).toBeNull();
    });

    test("THEN Optional is NOT rendered if displayedNecessity is set to required", () => {
      render(
        <FormLabel
          label={labelText}
          required={false}
          displayedNecessity="required"
        />
      );
      expect(screen.queryByText(/Optional/)).toBeNull();
    });
  });

  describe("WHEN show status indicator", () => {
    test("THEN info icon is rendered by default", () => {
      render(<FormLabel label={labelText} hasStatusIndicator />);
      expect(screen.getByTestId(/InfoSolidIcon/i)).toBeInTheDocument();
    });

    test("THEN warning icon is rendered when validationStatus is warning", () => {
      render(
        <FormLabel
          label={labelText}
          hasStatusIndicator
          validationStatus="warning"
        />
      );
      expect(screen.getByTestId(/WarningSolidIcon/i)).toBeInTheDocument();
    });

    test("THEN error icon is rendered when validationStatus is error", () => {
      render(
        <FormLabel
          label={labelText}
          hasStatusIndicator
          validationStatus="error"
        />
      );
      expect(screen.getByTestId(/ErrorSolidIcon/i)).toBeInTheDocument();
    });
  });
});
