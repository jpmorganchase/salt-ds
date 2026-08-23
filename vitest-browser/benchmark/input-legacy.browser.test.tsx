import { type ChangeEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { InputLegacy as Input } from "../../packages/lab/src/input-legacy";
import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

const textbox = () => page.getByRole("textbox");

describe("GIVEN an Input", () => {
  it("SHOULD have no a11y violations on load", async () => {
    const { container } = await renderWithSalt(
      <Input
        defaultValue="The default value"
        inputProps={{ "aria-label": "Input" }}
      />,
    );
    await runAxeScan(container);
  });

  describe("WHEN cy.mounted as an uncontrolled component", () => {
    it("THEN it should cy.mount with the specified defaultValue", async () => {
      await renderWithSalt(<Input defaultValue="The default value" />);
      await expect.element(textbox()).toHaveValue("The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", async () => {
        const changeSpy = vi.fn();
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          changeSpy(event);
        };
        await renderWithSalt(
          <Input defaultValue="The default value" onChange={onChange} />,
        );
        await textbox().fill("new value");
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.mock.lastCall?.[0].target.value).toBe("new value");
      });
    });
  });

  describe("WHEN cy.mounted as an controlled component", () => {
    it("THEN it should cy.mount with the specified value", async () => {
      await renderWithSalt(<Input value="text value" />);
      await expect.element(textbox()).toHaveValue("text value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", async () => {
        const changeSpy = vi.fn();
        function ControlledInput() {
          const [value, setValue] = useState("text value");
          const onChange = (event: ChangeEvent<HTMLInputElement>) => {
            event.persist();
            setValue(event.target.value);
            changeSpy(event);
          };
          return <Input value={value} onChange={onChange} />;
        }
        await renderWithSalt(<ControlledInput />);
        await textbox().fill("new value");
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.mock.lastCall?.[0].target.value).toBe("new value");
      });
    });
  });

  describe("WHEN the Input has Text Alignment", () => {
    it("SHOULD cy.mount left aligned", async () => {
      await renderWithSalt(
        <Input
          data-testid="parent"
          defaultValue="The default value"
          textAlign="left"
        />,
      );
      await expect
        .element(page.getByTestId("parent"))
        .toHaveClass("saltInputLegacy-leftTextAlign");
    });

    it("SHOULD cy.mount right aligned", async () => {
      await renderWithSalt(
        <Input
          data-testid="parent"
          defaultValue="The default value"
          textAlign="right"
        />,
      );
      await expect
        .element(page.getByTestId("parent"))
        .toHaveClass("saltInputLegacy-rightTextAlign");
    });
  });

  describe("WHEN the Input is disabled", () => {
    it("THEN should cy.mount disabled", async () => {
      await renderWithSalt(<Input defaultValue="The default value" disabled />);
      await expect.element(textbox()).toBeDisabled();
    });

    it("SHOULD have no a11y violations on load", async () => {
      const { container } = await renderWithSalt(
        <Input
          defaultValue="The default value"
          disabled
          inputProps={{ "aria-label": "Input" }}
        />,
      );
      await runAxeScan(container);
    });
  });

  describe("WHEN the Input is read only", () => {
    it("THEN should cy.mount read only", async () => {
      await renderWithSalt(<Input defaultValue="The default value" readOnly />);
      await expect.element(textbox()).toHaveAttribute("readonly");
    });

    it("SHOULD have no a11y violations on load", async () => {
      const { container } = await renderWithSalt(
        <Input
          defaultValue="The default value"
          inputProps={{ "aria-label": "Input" }}
          readOnly
        />,
      );
      await runAxeScan(container);
    });

    for (const [name, props, value] of [
      ["default", { readOnly: true }, "—"],
      ["empty default value", { defaultValue: "", readOnly: true }, "—"],
      ["controlled empty value", { value: "", readOnly: true }, "—"],
      ["custom marker", { emptyReadOnlyMarker: "#", readOnly: true }, "#"],
    ] as const) {
      it(`THEN should show the ${name}`, async () => {
        await renderWithSalt(<Input {...props} />);
        await expect.element(textbox()).toHaveValue(value);
      });
    }
  });

  const cursorCases = [
    ["start", "click", "start", 0, 0],
    ["start", "focus", "start", 0, 0],
    ["end", "click", "end", 17, 17],
    ["end", "focus", "end", 17, 17],
    ["a number", "click", 2, 2, 2],
    ["a number", "focus", 2, 2, 2],
  ] as const;

  for (const [description, action, position, start, end] of cursorCases) {
    describe(`WHEN cursorPositionOnFocus is ${description}`, () => {
      it(`THEN should move the cursor on ${action}`, async () => {
        await renderWithSalt(
          <Input
            cursorPositionOnFocus={position}
            defaultValue="The default value"
          />,
        );
        const input = textbox();
        if (action === "click") await input.click();
        else (await input.element()).focus();
        await expect
          .poll(
            async () =>
              ((await input.element()) as HTMLInputElement).selectionStart,
          )
          .toBe(start);
        expect(((await input.element()) as HTMLInputElement).selectionEnd).toBe(
          end,
        );
      });
    });
  }

  const highlightCases = [
    ["true", "click", true, 0, 17],
    ["true", "focus", true, 0, 17],
    ["an array of two numbers", "click", [4, 11], 4, 11],
    ["an array of two numbers", "focus", [4, 11], 4, 11],
  ] as const;

  for (const [description, action, highlight, start, end] of highlightCases) {
    describe(`WHEN highlightOnFocus is ${description}`, () => {
      it(`THEN should highlight text on ${action}`, async () => {
        await renderWithSalt(
          <Input
            highlightOnFocus={highlight === true ? true : [...highlight]}
            defaultValue="The default value"
          />,
        );
        const input = textbox();
        if (action === "click") await input.click();
        else (await input.element()).focus();
        await expect
          .poll(
            async () =>
              ((await input.element()) as HTMLInputElement).selectionStart,
          )
          .toBe(start);
        expect(((await input.element()) as HTMLInputElement).selectionEnd).toBe(
          end,
        );
      });
    });
  }
});
