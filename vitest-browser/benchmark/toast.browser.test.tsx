import { Toast, ToastContent } from "@salt-ds/core";
import { LinkedIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as toastStories from "~stories/toast/toast.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(toastStories);

describe("Given a Toast", () => {
  checkAccessibility(composedStories);

  it("renders no state without a status", async () => {
    await renderWithSalt(
      <Toast>
        <ToastContent>Toast content</ToastContent>
      </Toast>,
    );
    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
  });

  it.each(["info", "error", "warning", "success"] as const)(
    "renders the %s state",
    async (status) => {
      await renderWithSalt(
        <Toast status={status}>
          <ToastContent>Toast content</ToastContent>
        </Toast>,
      );
      await expect
        .element(page.getByRole("img", { name: status }))
        .toBeInTheDocument();
    },
  );

  it("renders a custom icon", async () => {
    await renderWithSalt(
      <Toast icon={<LinkedIcon aria-label="success" />} status="success">
        <ToastContent>Toast content</ToastContent>
      </Toast>,
    );
    await expect.element(page.getByTestId("LinkedIcon")).toBeInTheDocument();
  });
});
