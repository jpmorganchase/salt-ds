import { Button, FormField, FormFieldLabel, Input } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as inputStories from "~stories/input/input.stories";

import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

const { WithFormField } = composeStories(inputStories);
const textbox = () => page.getByRole("textbox");

describe("GIVEN an Input", () => {
  it("SHOULD have no a11y violations on load", async () => {
    const { container } = await renderWithSalt(
      <Input defaultValue="The default value" />,
    );
    await runAxeScan(container);
  });

  it("SHOULD support data attribute on inputProps", async () => {
    await renderWithSalt(
      <Input inputProps={{ "data-testId": "customInput" }} value="value" />,
    );
    await expect.element(page.getByTestId("customInput")).toHaveValue("value");
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

  describe("WHEN an adornment is given", () => {
    it("THEN should cy.mount with the adornment", async () => {
      await renderWithSalt(
        <Input startAdornment={<>%</>} defaultValue="Value" />,
      );
      await expect.element(page.getByText("%")).toBeVisible();
    });

    describe("AND adornment is a Button", () => {
      it("THEN should cy.mount with the adornment", async () => {
        await renderWithSalt(
          <Input startAdornment={<Button>Test</Button>} defaultValue="Value" />,
        );
        const button = page.getByRole("button");
        await expect.element(button).toBeVisible();
        await expect.element(button).toHaveClass("saltButton");
      });

      it("THEN should have the correct tab order on startAdornment", async () => {
        await renderWithSalt(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <Input
              startAdornment={<Button>Test</Button>}
              defaultValue="Value"
              data-testid="test-id-3"
            />
          </FormField>,
        );
        await userEvent.tab();
        await expect.element(page.getByRole("button")).toHaveFocus();
        await userEvent.tab();
        await expect.element(textbox()).toHaveFocus();
      });

      it("THEN should have the correct tab order on endAdornment", async () => {
        await renderWithSalt(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <Input
              defaultValue="Value"
              endAdornment={<Button>Test</Button>}
              data-testid="test-id-3"
            />
          </FormField>,
        );
        await userEvent.tab();
        await expect.element(textbox()).toHaveFocus();
        await userEvent.tab();
        await expect.element(page.getByRole("button")).toHaveFocus();
      });
    });
  });

  describe("WHEN the Input is required", () => {
    it("THEN should have required attr", async () => {
      await renderWithSalt(
        <Input
          defaultValue="The default value"
          inputProps={{ required: true }}
        />,
      );
      await expect.element(textbox()).toHaveAttribute("required");
    });
  });

  describe("WHEN the Input is disabled", () => {
    it("THEN should cy.mount disabled", async () => {
      await renderWithSalt(<Input defaultValue="The default value" disabled />);
      await expect.element(textbox()).toBeDisabled();
    });

    it("SHOULD have no a11y violations on load", async () => {
      const { container } = await renderWithSalt(
        <Input defaultValue="The default value" disabled />,
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
        <Input defaultValue="The default value" readOnly />,
      );
      await runAxeScan(container);
    });

    describe("AND empty", () => {
      it("THEN should cy.mount an emdash by default", async () => {
        await renderWithSalt(<Input readOnly />);
        await expect.element(textbox()).toHaveValue("—");
      });

      it("THEN should show an emdash for an empty default value", async () => {
        await renderWithSalt(<Input defaultValue="" readOnly />);
        await expect.element(textbox()).toHaveValue("—");
      });

      it("THEN should show an emdash for a controlled empty value", async () => {
        await renderWithSalt(<Input value="" readOnly />);
        await expect.element(textbox()).toHaveValue("—");
      });

      it("THEN should cy.mount an custom marker", async () => {
        await renderWithSalt(<Input emptyReadOnlyMarker="#" readOnly />);
        await expect.element(textbox()).toHaveValue("#");
      });
    });

    describe("AND the value is zero", () => {
      it("THEN should show the zero value rather than the empty marker", async () => {
        await renderWithSalt(<Input defaultValue={0} readOnly />);
        await expect.element(textbox()).toHaveValue("0");
      });

      it("THEN should show a controlled zero value rather than the empty marker", async () => {
        await renderWithSalt(<Input value={0} readOnly />);
        await expect.element(textbox()).toHaveValue("0");
      });
    });
  });

  describe("WHEN used in Formfield", () => {
    it("THEN input within should be disabled", async () => {
      await renderWithSalt(
        <FormField disabled>
          <FormFieldLabel>Disabled form field</FormFieldLabel>
          <Input defaultValue="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Disabled form field"))
        .toHaveAttribute("disabled");
    });

    it("THEN required input within should be required", async () => {
      await renderWithSalt(
        <FormField necessity="required">
          <FormFieldLabel>Form Field</FormFieldLabel>
          <Input defaultValue="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Form Field (Required)"))
        .toHaveAttribute("required");
    });

    it("THEN asterisk input within should be required", async () => {
      await renderWithSalt(
        <FormField necessity="asterisk">
          <FormFieldLabel>Form Field</FormFieldLabel>
          <Input defaultValue="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Form Field *"))
        .toHaveAttribute("required");
    });

    it("THEN optional input within should not be required", async () => {
      await renderWithSalt(
        <FormField necessity="optional">
          <FormFieldLabel>Form Field</FormFieldLabel>
          <Input defaultValue="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Form Field (Optional)"))
        .not.toHaveAttribute("required");
    });

    it("THEN readonly input within should be readonly", async () => {
      await renderWithSalt(
        <FormField readOnly>
          <FormFieldLabel>Readonly form field</FormFieldLabel>
          <Input defaultValue="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Readonly form field"))
        .toHaveAttribute("readonly");
    });
  });

  it("should have form field support", async () => {
    await renderWithSalt(<WithFormField />);
    const input = textbox();
    await expect.element(input).toHaveAccessibleName("Username");
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        "This should be more than 3 characters long.",
      );
    await page.getByText("Username").click();
    await expect.element(input).toHaveFocus();
  });

  it("should not have empty aria-describedby or aria-labelledby attributes if used outside a formfield", async () => {
    await renderWithSalt(<Input />);
    await expect.element(textbox()).not.toHaveAttribute("aria-describedby");
    await expect.element(textbox()).not.toHaveAttribute("aria-labelledby");
  });

  it("SHOULD apply the name prop to the input", async () => {
    await renderWithSalt(<Input name="username" />);
    await expect.element(textbox()).toHaveAttribute("name", "username");
  });

  it("SHOULD allow inputProps.name to override the top-level name prop", async () => {
    await renderWithSalt(
      <Input name="username" inputProps={{ name: "override" }} />,
    );
    await expect.element(textbox()).toHaveAttribute("name", "override");
  });
});
