import { Button, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { ToastGroup } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as toastGroupStories from "~stories/toast-group/toast-group.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(toastGroupStories);

function ToastExample({
  placement,
}: {
  placement: "top-right" | "bottom-right";
}) {
  return (
    <ToastGroup placement={placement}>
      <Toast>
        <ToastContent>This is a toast</ToastContent>
        <Button appearance="transparent">
          <CloseIcon />
        </Button>
      </Toast>
    </ToastGroup>
  );
}

describe("Given a ToastGroup", () => {
  checkAccessibility(composedStories);

  it("renders at the top-right", async () => {
    await renderWithSalt(<ToastExample placement="top-right" />);

    const group = document.querySelector(".saltToastGroup-top-right");
    expect(group).toBeInTheDocument();
    expect(getComputedStyle(group as Element).top).toBe("0px");
    await expect.element(page.getByRole("alert")).toBeInTheDocument();
  });

  it("renders at the bottom-right", async () => {
    await renderWithSalt(<ToastExample placement="bottom-right" />);

    const group = document.querySelector(".saltToastGroup-bottom-right");
    expect(group).toBeInTheDocument();
    expect(getComputedStyle(group as Element).bottom).toBe("0px");
    await expect.element(page.getByRole("alert")).toBeInTheDocument();
  });
});
