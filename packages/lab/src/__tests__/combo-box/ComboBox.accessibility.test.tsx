import {
  fireEvent,
  getAllByRole,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { ComboBox } from "../../combo-box";
import { FormField } from "../../form-field";

// Mock aria announcer to avoid the warnings
const mockAnnounce = jest.fn();

jest.mock("@brandname/core", () => ({
  ...jest.requireActual("@brandname/core"),
  useAriaAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

const ITEMS = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

const waitForListToBeInTheDocument = async () => {
  await waitFor(() => {
    expect(
      screen
        .getAllByRole("listbox")
        .find((element) => element.className.includes("uitkList"))
    ).toBeInTheDocument();
  });
};

describe("A combo box", () => {
  it("should assign correct role to the input", () => {
    const testId = "my-input";

    render(
      <ComboBox
        InputProps={{ inputProps: { "data-testid": testId } as any }}
        source={ITEMS}
      />
    );

    expect(screen.getByTestId(testId)).toHaveAttribute("role", "combobox");
  });

  it("should have correct aria-expanded when it is opened and closed", async () => {
    render(<ComboBox source={ITEMS} />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");

    // open popper
    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  describe("when navigating using keyboard", () => {
    const mockId = "my-combo-box";

    it("should assign aria-activedescendant only on focus", async () => {
      render(
        <ComboBox id={mockId} initialSelectedItem={ITEMS[2]} source={ITEMS} />
      );

      const input = screen.getByRole("combobox");

      expect(input).not.toHaveAttribute("aria-activedescendant");

      // open popper
      fireEvent.focus(input);
      await waitForListToBeInTheDocument();

      expect(input).toHaveAttribute(
        "aria-activedescendant",
        `${mockId}-list-item-0`
      );
    });

    it("should not remove aria-activedescendant when navigating through input", async () => {
      render(
        <ComboBox id={mockId} initialSelectedItem={ITEMS[2]} source={ITEMS} />
      );

      const input = screen.getByRole("combobox");

      fireEvent.focus(input);
      fireEvent.select(input, {
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      });

      fireEvent.change(input, { target: { value: "item" } });
      fireEvent.select(input, {
        target: {
          selectionStart: 4,
          selectionEnd: 4,
        },
      });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      await waitForListToBeInTheDocument();

      expect(input).toHaveAttribute(
        "aria-activedescendant",
        `${mockId}-list-item-3`
      );

      fireEvent.select(input, {
        target: {
          selectionStart: 3,
          selectionEnd: 3,
        },
      });
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    ["ArrowUp", "ArrowDown"].forEach((key) => {
      it(`should re-attach aria-activedescendant when navigating through list using ${key} key`, async () => {
        render(<ComboBox id={mockId} source={ITEMS} />);

        const input = screen.getByRole("combobox");

        // first time highlight
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "item" } });
        fireEvent.select(input, {
          target: {
            selectionStart: 4,
            selectionEnd: 4,
          },
        });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        /* When quickSelection is true, the focus will move to list-item-1 */
        /* Update the test when quickSelection is implemented */
        expect(input).toHaveAttribute(
          "aria-activedescendant",
          `${mockId}-list-item-0`
        );
        await waitForListToBeInTheDocument();

        // // navigate through input
        fireEvent.select(input, {
          target: {
            selectionStart: 3,
            selectionEnd: 3,
          },
        });
        expect(input).not.toHaveAttribute("aria-activedescendant");

        // // second time highlight
        fireEvent.keyDown(input, { key });
        expect(input).toHaveAttribute(
          "aria-activedescendant",
          `${mockId}-list-item-${key === "ArrowDown" ? "1" : "0"}`
        );
      });
    });
  });

  describe("when used inside of <FormField/>", () => {
    it("should inherit correct aria-required value", () => {
      render(
        <FormField label="Type and select" required>
          <ComboBox source={ITEMS} />
        </FormField>
      );

      const input = screen.getByRole("combobox");

      expect(input).toHaveAttribute("aria-required", String(true));
    });
  });
});

describe("A multi-select combo box", () => {
  it("should assign correct role and role description to the input", () => {
    const testId = "my-input";

    render(
      <ComboBox
        InputProps={{
          InputProps: { "data-testid": testId } as any,
        }}
        multiSelect
        source={ITEMS}
      />
    );

    const input = screen.getByTestId(testId).firstChild;

    expect(input).toHaveAttribute("role", "textbox");
    expect(input).toHaveAttribute(
      "aria-roledescription",
      "MultiSelect Combobox"
    );
  });

  const getExpandButton = () => {
    const pillGroup = screen.getAllByTestId("pill")[0].parentNode!
      .parentNode as HTMLElement;
    return getAllByRole(pillGroup, "button").find((element) =>
      element.id.endsWith("expand-button")
    );
  };

  it("should assign correct role and role description to the expand input button", () => {
    render(
      <ComboBox
        initialSelectedItem={[ITEMS[0], ITEMS[2]]}
        multiSelect
        source={ITEMS}
      />
    );

    const expandButton = getExpandButton();

    expect(expandButton).toHaveAttribute("role", "button");
    expect(expandButton).toHaveAttribute(
      "aria-roledescription",
      "Expand combobox button"
    );
  });

  describe("when navigating using keyboard", () => {
    const mockId = "my-combo-box";

    it("should have no aria-activedescendant on focus", async () => {
      render(
        <ComboBox
          id={mockId}
          initialSelectedItem={[ITEMS[0], ITEMS[2]]}
          multiSelect
          source={ITEMS}
        />
      );

      const input = screen.getByRole("textbox");

      // open popper
      fireEvent.focus(input);
      await waitForListToBeInTheDocument();

      expect(input).not.toHaveAttribute("aria-activedescendant");
    });

    it("should attach correct aria-activedescendant when navigating through list and pills", async () => {
      render(
        <ComboBox
          id={mockId}
          initialSelectedItem={[ITEMS[0], ITEMS[2]]}
          multiSelect
          source={ITEMS}
        />
      );

      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "item" } });
      fireEvent.select(input, {
        target: {
          selectionStart: 4,
          selectionEnd: 4,
        },
      });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      await waitForListToBeInTheDocument();

      expect(input).toHaveAttribute(
        "aria-activedescendant",
        `${mockId}-list-item-1`
      );

      fireEvent.select(input, {
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      });
      fireEvent.keyDown(input, { key: "ArrowLeft" });
      expect(input).toHaveAttribute(
        "aria-activedescendant",
        `${mockId}-input-pill-1`
      );
    });

    it("should re-attach aria-activedescendant when navigating through pills", () => {
      render(
        <ComboBox
          id={mockId}
          initialSelectedItem={[ITEMS[0], ITEMS[2]]}
          multiSelect
          source={ITEMS}
        />
      );

      const input = screen.getByRole("textbox");

      // first time highlight
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "item" } });
      fireEvent.select(input, {
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      });
      fireEvent.keyDown(input, { key: "ArrowLeft" });
      expect(input).toHaveAttribute(
        "aria-activedescendant",
        `${mockId}-input-pill-1`
      );

      // leave pills
      fireEvent.keyDown(input, { key: "ArrowRight" });
      expect(input).not.toHaveAttribute("aria-activedescendant");

      // second time highlight
      fireEvent.keyDown(input, { key: "ArrowLeft" });
      expect(input).toHaveAttribute(
        "aria-activedescendant",
        `${mockId}-input-pill-1`
      );
    });

    ["ArrowUp", "ArrowDown"].forEach((key) => {
      it(`should re-attach aria-activedescendant when navigating through list using ${key} key`, async () => {
        render(
          <ComboBox
            id={mockId}
            initialSelectedItem={[ITEMS[0], ITEMS[2]]}
            multiSelect
            source={ITEMS}
          />
        );

        const input = screen.getByRole("textbox");

        // first time highlight
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "item" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        await waitForListToBeInTheDocument();

        // navigate through input
        fireEvent.keyDown(input, { key: "ArrowLeft" });
        expect(input).toHaveAttribute(
          "aria-activedescendant",
          `${mockId}-list-item-1`
        );

        // second time highlight
        fireEvent.keyDown(input, { key });
        expect(input).toHaveAttribute(
          "aria-activedescendant",
          `${mockId}-list-item-${key === "ArrowDown" ? "2" : "0"}`
        );
      });
    });
  });

  describe("when used inside of <FormField/>", () => {
    it("should inherit correct aria-required value", () => {
      render(
        <FormField label="Type and select" required>
          <ComboBox multiSelect source={ITEMS} />
        </FormField>
      );

      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("aria-required", String(true));
    });

    it("should assign correct aria-labelledby to the input and the list", async () => {
      const mockId = "my-combo-box";

      const mockInputId = `${mockId}-input-input`;
      const mockLabelId = `${mockId}-input-label`;

      render(
        <FormField LabelProps={{ id: mockLabelId }} label="Type and select">
          <ComboBox
            id={mockId}
            initialSelectedItem={[ITEMS[0], ITEMS[2]]}
            multiSelect
            source={ITEMS}
          />
        </FormField>
      );

      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      await waitForListToBeInTheDocument();

      expect(input).toHaveAttribute("aria-label", "2 items");
      expect(input).toHaveAttribute(
        "aria-labelledby",
        `${mockLabelId} ${mockInputId}`
      );
    });

    it("should assign correct aria-labelledby to the expand input button", () => {
      const mockId = "my-combo-box";

      const mockInputId = `${mockId}-input-input`;
      const mockLabelId = `${mockId}-input-label`;

      render(
        <FormField LabelProps={{ id: mockLabelId }} label="Type and select">
          <ComboBox
            id={mockId}
            initialSelectedItem={[ITEMS[0], ITEMS[2]]}
            multiSelect
            source={ITEMS}
          />
        </FormField>
      );

      const expandButton = getExpandButton();

      // TODO fix useTokenizedInput
      // expect(expandButton).toHaveAttribute(
      //   "aria-labelledby",
      //   `${mockLabelId} ${mockInputId}`
      // );
    });
  });
});
