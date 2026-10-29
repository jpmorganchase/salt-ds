import { Banner, BannerActions, BannerContent, Button } from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as bannerStories from "~stories/banner/banner.stories";

const composedStories = composeStories(bannerStories);
const { StatusesPrimary } = composedStories;

describe("GIVEN a Banner", () => {
  checkAccessibility(composedStories);

  it("renders status icons as decorative", async () => {
    await renderWithSalt(<StatusesPrimary />);

    for (const testId of [
      "InfoSolidIcon",
      "SuccessCircleSolidIcon",
      "WarningSolidIcon",
      "ErrorSolidIcon",
    ]) {
      await expect.element(page.getByTestId(testId)).toBeInTheDocument();
    }

    for (const name of ["info", "error", "success", "warning"]) {
      await expect
        .element(page.getByRole("img", { name }))
        .not.toBeInTheDocument();
    }
  });

  it.skip("announces the contents of the Banner", async () => {
    const message = "example announcement";
    await renderWithSalt(
      <Banner>
        <BannerContent>{message}</BannerContent>
      </Banner>,
    );

    await expect.element(page.getByText(message)).toBeInTheDocument();
  });

  it("applies the secondary variant class", async () => {
    await renderWithSalt(
      <Banner data-testid="bannerRoot" variant="secondary">
        <BannerContent>Default Banner State</BannerContent>
      </Banner>,
    );

    await expect
      .element(page.getByTestId("bannerRoot"))
      .toHaveClass("saltBanner-secondary");
  });
});

describe("WHEN adding BannerActions", () => {
  it.each(["click", "Enter", "Space"] as const)(
    "handles %s activation",
    async (activation) => {
      const onClick = vi.fn();
      await renderWithSalt(
        <Banner>
          <BannerContent>On Close example</BannerContent>
          <BannerActions>
            <Button
              aria-label="refresh"
              appearance="transparent"
              onClick={onClick}
            >
              <RefreshIcon />
            </Button>
          </BannerActions>
        </Banner>,
      );
      const button = page.getByRole("button", { name: "refresh" });

      if (activation === "click") {
        await button.click();
      } else {
        await userEvent.tab();
        await expect.element(button).toHaveFocus();
        await userEvent.keyboard(activation === "Enter" ? "{Enter}" : " ");
      }

      expect(onClick).toHaveBeenCalledOnce();
    },
  );
});
