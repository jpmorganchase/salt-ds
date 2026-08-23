import { FormField, Tooltip } from "@salt-ds/core";
import { InfoIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as tooltipStories from "~stories/tooltip/tooltip.stories";

import {
  CustomFloatingComponentProvider,
  FLOATING_TEST_ID,
} from "../../packages/core/src/__tests__/__e2e__/common";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(tooltipStories);
const { Default, Open, CustomContent } = composedStories;

afterEach(async () => {
  await page.viewport(1280, 1024);
});

describe("GIVEN a Tooltip", () => {
  checkAccessibility(composedStories);

  describe("WHEN rendered", () => {
    it('should have the aria role "tooltip"', async () => {
      await renderWithSalt(<Open />);
      await expect.element(page.getByRole("tooltip")).toBeInTheDocument();
    });

    it("should show tooltip when button is focused", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await expect.element(page.getByRole("tooltip")).toBeVisible();
    });

    it("should be dismissible with Escape", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await expect.element(page.getByRole("tooltip")).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
    });

    it("should stay open if the popper element is hovered", async () => {
      await renderWithSalt(<Default />);
      await page.getByRole("button").hover();
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      await tooltip.hover();
      await expect.element(tooltip).toBeVisible();
    });

    it("should have z-index applied", async () => {
      await renderWithSalt(<Default />);
      (await page.getByRole("button").element()).focus();
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      await expect
        .poll(async () => getComputedStyle(await tooltip.element()).zIndex)
        .toBe("1500");
    });
  });

  describe("WHEN disabled", () => {
    it("should not render when form field context disabled is undefined", async () => {
      await renderWithSalt(
        <FormField>
          <Open disabled />
        </FormField>,
      );
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
    });

    it("should not render when form field context disabled is disabled", async () => {
      await renderWithSalt(
        <FormField disabled>
          <Open />
        </FormField>,
      );
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
    });

    it("should not attach floating-ui event handlers when disabled", async () => {
      const keyDownSpy = vi.fn();
      await renderWithSalt(
        <div onKeyDown={keyDownSpy}>
          <Open disabled />
        </div>,
      );
      (await page.getByRole("button").element()).focus();
      await userEvent.keyboard("{Escape}");
      expect(keyDownSpy).toHaveBeenCalled();
    });
  });

  describe("WHEN tooltip placement is", () => {
    const cases = [
      ["TOP", "top", "y", "greater"] as const,
      ["BOTTOM", "bottom", "y", "less"] as const,
      ["LEFT", "left", "x", "greater"] as const,
      ["RIGHT", "right", "x", "less"] as const,
    ];
    for (const [label, placement, axis, comparison] of cases) {
      it(`${label} - tooltip should be positioned relative to the trigger`, async () => {
        await renderWithSalt(<Open placement={placement} />);
        const trigger = page.getByRole("button");
        const tooltip = page.getByRole("tooltip");
        await expect.element(tooltip).toBeVisible();
        await expect
          .poll(() => {
            const triggerPosition = trigger.element().getBoundingClientRect()[
              axis
            ];
            const tooltipPosition = tooltip.element().getBoundingClientRect()[
              axis
            ];
            return comparison === "greater"
              ? triggerPosition > tooltipPosition
              : triggerPosition < tooltipPosition;
          })
          .toBe(true);
      });
    }
  });

  describe("WHEN hideArrow", () => {
    it("shows arrow by default", async () => {
      await renderWithSalt(<Open />);
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      await expect
        .poll(() => tooltip.element().querySelector(".saltTooltip-arrow"))
        .not.toBeNull();
      expect(
        tooltip.element().querySelector(".saltTooltip-arrow"),
      ).toBeVisible();
    });

    it('arrow is not displayed when "hideArrow=true"', async () => {
      await renderWithSalt(<Open hideArrow />);
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      expect(tooltip.element().querySelector(".saltTooltip-arrow")).toBeNull();
    });
  });

  describe("WHEN hideIcon", () => {
    it("shows icon by default", async () => {
      await renderWithSalt(<Open status="info" />);
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      await expect
        .poll(() => tooltip.element().querySelector(".saltIcon"))
        .not.toBeNull();
      expect(tooltip.element().querySelector(".saltIcon")).toBeVisible();
    });

    it('icon is not displayed when "hideIcon=true"', async () => {
      await renderWithSalt(<Open hideIcon status="info" />);
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      expect(tooltip.element().querySelector(".saltIcon")).toBeNull();
    });
  });

  describe("WHEN content = string", () => {
    it("then tooltip displays the string", async () => {
      await renderWithSalt(<Open content="tooltip" />);
      await expect.element(page.getByText("tooltip")).toBeVisible();
    });
  });

  describe("WHEN content = component", () => {
    it("then tooltip displays the component", async () => {
      await renderWithSalt(<CustomContent open />);
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      await expect.element(tooltip.getByRole("list")).toBeVisible();
      await expect.element(tooltip.getByRole("listitem")).toHaveLength(4);
    });

    it("then tooltip flips direction when there is not enough space", async () => {
      await page.viewport(200, 750);
      await renderWithSalt(<CustomContent open />);
      const trigger = page.getByRole("button");
      const tooltip = page.getByRole("tooltip");
      await expect.element(tooltip).toBeVisible();
      await expect
        .poll(
          () =>
            trigger.element().getBoundingClientRect().y <
            tooltip.element().getBoundingClientRect().y,
        )
        .toBe(true);
    });
  });

  for (const [description, content, exists] of [
    ["empty", "", false],
    ["undefined", undefined, false],
    ["null", null, false],
    ["falsy", 0, true],
  ] as const) {
    describe(`WHEN content is ${description}`, () => {
      it(`then tooltip ${exists ? "should still display" : "doesn't display"}`, async () => {
        await renderWithSalt(<Open content={content} />);
        if (exists)
          await expect.element(page.getByRole("tooltip")).toBeInTheDocument();
        else
          await expect
            .element(page.getByRole("tooltip"))
            .not.toBeInTheDocument();
      });
    });
  }

  describe("WHEN used in header tag", () => {
    it("then tooltip displays default font weight and size", async () => {
      await renderWithSalt(
        <h3>
          Header{" "}
          <Tooltip open content="tooltip">
            <InfoIcon />
          </Tooltip>
        </h3>,
      );
      const tooltip = page.getByText("tooltip");
      await expect.element(tooltip).toBeVisible();
      await expect
        .poll(async () => getComputedStyle(await tooltip.element()).fontSize)
        .toBe("12px");
      await expect
        .poll(async () => getComputedStyle(await tooltip.element()).fontWeight)
        .toBe("400");
    });
  });

  describe("WHEN used with a custom floating component", () => {
    it("should render the custom floating component", async () => {
      await renderWithSalt(
        <CustomFloatingComponentProvider>
          <Tooltip open content="tooltip">
            <InfoIcon />
          </Tooltip>
        </CustomFloatingComponentProvider>,
      );
      await expect
        .element(page.getByTestId(FLOATING_TEST_ID))
        .toBeInTheDocument();
    });
  });

  describe("WHEN used in a FormField", () => {
    it("AND status is undefined, THEN should inherit status", async () => {
      await renderWithSalt(
        <FormField validationStatus="error">
          <Tooltip open content="tooltip">
            <InfoIcon />
          </Tooltip>
        </FormField>,
      );
      await expect
        .element(page.getByRole("tooltip"))
        .toHaveClass("saltTooltip-error");
    });

    it("AND status is defined, THEN should not inherit status", async () => {
      await renderWithSalt(
        <FormField validationStatus="error">
          <Tooltip open content="tooltip" status="info">
            <InfoIcon />
          </Tooltip>
        </FormField>,
      );
      await expect
        .element(page.getByRole("tooltip"))
        .toHaveClass("saltTooltip-info");
    });
  });
});
