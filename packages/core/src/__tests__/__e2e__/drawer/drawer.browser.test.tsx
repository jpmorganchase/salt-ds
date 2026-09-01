import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Text,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as drawerStories from "~stories/drawer/drawer.stories";

const {
  Default,
  OptionalCloseAction,
  InitialFocusIndex,
  InitialFocusRef,
  HeaderAndActions,
} = composeStories(drawerStories);

const headingName = "Payments Check deposit #1278";
const longText = "Pending transaction review. ".repeat(200);

afterEach(() => {
  vi.restoreAllMocks();
});

function dismissViaScrim() {
  page
    .getByTestId("scrim")
    .element()
    .dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        composed: true,
        pointerType: "mouse",
      }),
    );
}

describe("GIVEN a Drawer", () => {
  it("closes from the close action and scrim", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await renderWithSalt(<Default />);

    await page.getByRole("button", { name: "Open Primary Drawer" }).click();
    await expect.element(page.getByTestId("scrim")).toBeInTheDocument();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Close Drawer" }))
      .toHaveFocus();
    const callCount = consoleSpy.mock.calls.length;

    await page.getByRole("button", { name: "Close Drawer" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledTimes(callCount + 1);

    await page.getByRole("button", { name: "Open Secondary Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    dismissViaScrim();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("dismisses on Escape", async () => {
    await renderWithSalt(<Default disableScrim />);
    await page.getByRole("button", { name: "Open Primary Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect.element(page.getByTestId("scrim")).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps focus when a close action is present", async () => {
    await renderWithSalt(<Default />);
    const closeButton = page.getByRole("button", { name: "Close Drawer" });
    await page.getByRole("button", { name: "Open Primary Drawer" }).click();
    await expect.element(closeButton).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(closeButton).toHaveFocus();
  });

  it("makes background content inert", async () => {
    await renderWithSalt(<Default disableScrim />);
    const openButton = page.getByRole("button", {
      name: "Open Primary Drawer",
    });
    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .poll(() => openButton.element().closest("[inert]") !== null)
      .toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect
      .poll(() => openButton.element().closest("[inert]") === null)
      .toBe(true);
  });

  it("closes a drawer without a close button from the scrim and Escape", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    const openButton = page.getByRole("button", { name: "Open Drawer" });

    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    dismissViaScrim();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps focus without a close button", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const firstField = page.getByRole("textbox", { name: "House no." });
    await expect.element(firstField).toHaveFocus();
    for (let index = 0; index < 7; index += 1) {
      await userEvent.tab();
    }
    await expect.element(firstField).toHaveFocus();
  });

  it("focuses the first focusable element", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect
      .element(page.getByRole("textbox", { name: "House no." }))
      .toHaveFocus();
  });

  it("returns focus to the trigger when closed from the close button", async () => {
    await renderWithSalt(<Default />);
    const openButton = page.getByRole("button", {
      name: "Open Primary Drawer",
    });

    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close Drawer" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(openButton).toHaveFocus();
  });

  it("returns focus to the trigger when dismissed with Escape", async () => {
    await renderWithSalt(<Default />);
    const openButton = page.getByRole("button", {
      name: "Open Primary Drawer",
    });

    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(openButton).toHaveFocus();
  });

  it("supports an action configured to close the drawer", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    ["tabbable index", InitialFocusIndex],
    ["provided ref", InitialFocusRef],
  ] as const)("supports initial focus by %s", async (_name, Story) => {
    await renderWithSalt(<Story />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect
      .element(page.getByRole("textbox", { name: "Third" }))
      .toHaveFocus();
  });

  it("exposes overflowing content as a region reachable by keyboard", async () => {
    await renderWithSalt(<Header />);
    await page.getByRole("button", { name: "Open Drawer" }).click();

    const content = page.getByRole("region", { name: headingName });
    await expect.element(content).toBeVisible();
    await userEvent.tab();
    await expect.element(content).toHaveFocus();
  });

  it("falls back to the drawer's aria-label to name the content region", async () => {
    await renderWithSalt(
      <Drawer
        open
        position="right"
        style={{ width: 400 }}
        aria-label="Notifications"
      >
        <DrawerHeader actions={<DrawerCloseButton />} />
        <DrawerContent>
          <Text>{longText}</Text>
        </DrawerContent>
      </Drawer>,
    );

    const region = page.getByRole("region", { name: "Notifications" });
    await expect.element(region).toBeVisible();
    await expect.element(region).toHaveAttribute("tabindex", "0");
  });
});

describe("GIVEN a Drawer with a DrawerHeader", () => {
  it("names and describes the drawer from the header", async () => {
    await renderWithSalt(<HeaderAndActions />);
    await page.getByRole("button", { name: "Open Drawer" }).click();

    const drawer = page.getByRole("dialog");
    await expect.element(drawer).toHaveAccessibleName(headingName);
    await expect
      .element(drawer)
      .toHaveAccessibleDescription("Pending transaction review");
    await expect
      .element(page.getByRole("heading", { level: 2, name: headingName }))
      .toBeVisible();
  });

  it("closes from a close button placed in the header actions", async () => {
    await renderWithSalt(<HeaderAndActions />);
    await page.getByRole("button", { name: "Open Drawer" }).click();

    const closeButton = page.getByRole("button", { name: "Close Drawer" });
    await expect.element(closeButton).toHaveFocus();
    await closeButton.click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("leaves content that fits out of the tab order", async () => {
    await renderWithSalt(
      <Drawer open position="right" style={{ width: 400 }}>
        <DrawerHeader
          header="Check deposit #1278"
          actions={<DrawerCloseButton />}
        />
        <DrawerContent>
          <Text>Pending transaction review</Text>
        </DrawerContent>
      </Drawer>,
    );

    const closeButton = page.getByRole("button", { name: "Close Drawer" });
    await expect.element(closeButton).toHaveFocus();
    await expect.element(page.getByRole("region")).not.toBeInTheDocument();
    await userEvent.tab();
    await expect.element(closeButton).toHaveFocus();
  });

  it("restores the drawer's own labelling when the header is removed", async () => {
    function TogglingHeader() {
      const [showHeader, setShowHeader] = useState(true);

      return (
        <Drawer
          open
          position="right"
          style={{ width: 400 }}
          aria-label="Delivery details"
        >
          {showHeader && (
            <DrawerHeader
              header="Check deposit #1278"
              description="Pending transaction review"
            />
          )}
          <DrawerContent>
            <Button onClick={() => setShowHeader(false)}>Remove header</Button>
          </DrawerContent>
        </Drawer>
      );
    }

    await renderWithSalt(<TogglingHeader />);

    const drawer = page.getByRole("dialog");
    await expect.element(drawer).toHaveAccessibleName("Check deposit #1278");
    await expect
      .element(drawer)
      .toHaveAccessibleDescription("Pending transaction review");

    await page.getByRole("button", { name: "Remove header" }).click();
    await expect.element(drawer).toHaveAccessibleName("Delivery details");
    await expect.element(drawer).not.toHaveAccessibleDescription();
  });

  it("supports a header that only carries actions", async () => {
    await renderWithSalt(
      <Drawer
        open
        position="right"
        style={{ width: 400 }}
        aria-label="Notifications"
      >
        <DrawerHeader actions={<DrawerCloseButton />} />
        <DrawerContent>
          <Text>Pending transaction review</Text>
        </DrawerContent>
      </Drawer>,
    );

    const drawer = page.getByRole("dialog");
    await expect.element(drawer).toHaveAccessibleName("Notifications");
    await expect.element(drawer).not.toHaveAttribute("aria-labelledby");
    await expect
      .element(page.getByRole("heading", { level: 2 }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Close Drawer" }))
      .toBeVisible();
  });
});

describe("GIVEN a Drawer with DrawerFooter", () => {
  it("places the actions last in the focus order", async () => {
    await renderWithSalt(
      <Drawer open position="right" style={{ width: 400 }}>
        <DrawerHeader
          header="Add your delivery details"
          actions={<DrawerCloseButton />}
        />
        <DrawerContent>
          <Button>Content action</Button>
        </DrawerContent>
        <DrawerFooter>
          <Button>Cancel</Button>
          <Button>Save</Button>
        </DrawerFooter>
      </Drawer>,
    );

    const closeButton = page.getByRole("button", { name: "Close Drawer" });
    await expect.element(closeButton).toHaveFocus();

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Content action" }))
      .toHaveFocus();

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Cancel" }))
      .toHaveFocus();

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Save" }))
      .toHaveFocus();

    await userEvent.tab();
    await expect.element(closeButton).toHaveFocus();
  });

  it("supports actions configured to close the drawer", async () => {
    await renderWithSalt(<HeaderAndActions />);
    const openButton = page.getByRole("button", { name: "Open Drawer" });

    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();

    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });
});
