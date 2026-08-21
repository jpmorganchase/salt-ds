import {
  Button,
  Input,
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  Text,
  useSidePanel,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as sidePanelStories from "~stories/side-panel/side-panel.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(sidePanelStories);
const { Left, Default, ManualTrigger, WithTable, Scrollable, WithNav } =
  composedStories;

afterEach(() => vi.restoreAllMocks());

function getByDisplayValue(value: string) {
  const element = Array.from(
    document.querySelectorAll<HTMLInputElement>("input"),
  ).find((candidate) => candidate.value === value);
  if (!element) throw new Error(`Input with value ${value} missing`);
  return page.elementLocator(element);
}

function DynamicScrollablePanel() {
  const [expanded, setExpanded] = useState(false);
  return (
    <SidePanelProvider defaultOpen>
      <div style={{ display: "flex", height: 240 }}>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Dynamic Panel</SidePanelTitle>
          </SidePanelHeader>
          <SidePanelContent>
            <Button onClick={() => setExpanded(true)}>Expand content</Button>
            <Text>
              {expanded
                ? Array.from({ length: 160 }, () => "Expanded content").join(
                    " ",
                  )
                : "Short content"}
            </Text>
          </SidePanelContent>
        </SidePanel>
      </div>
    </SidePanelProvider>
  );
}

function FocusOrderPanel({ defaultOpen = false }) {
  return (
    <SidePanelProvider defaultOpen={defaultOpen}>
      <div>
        <Button>Before trigger</Button>
        <SidePanelTriggerButton>Open panel</SidePanelTriggerButton>
        <Button>After trigger</Button>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Focus Panel</SidePanelTitle>
            <SidePanelCloseButton />
          </SidePanelHeader>
          <SidePanelContent>
            <Button>Panel action</Button>
          </SidePanelContent>
        </SidePanel>
      </div>
    </SidePanelProvider>
  );
}

function SidePanelTriggerButton({ children }: { children: string }) {
  const { getTriggerProps } = useSidePanel();
  return <Button {...getTriggerProps()}>{children}</Button>;
}

function DetachedTabOrderPanel() {
  return (
    <SidePanelProvider defaultOpen>
      <div>
        <SidePanelTriggerButton>Open panel</SidePanelTriggerButton>
        <Button>After trigger</Button>
        <Button>Later page action</Button>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Detached Order Panel</SidePanelTitle>
            <SidePanelCloseButton />
          </SidePanelHeader>
          <SidePanelContent>
            <Button>Panel action</Button>
          </SidePanelContent>
        </SidePanel>
        <Button>After panel</Button>
      </div>
    </SidePanelProvider>
  );
}

function ControlledPanel({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SidePanelProvider
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        setOpen(nextOpen);
      }}
    >
      <SidePanelTriggerButton>Toggle</SidePanelTriggerButton>
      <SidePanel disableAnimation>
        <SidePanelHeader>
          <SidePanelTitle>Controlled</SidePanelTitle>
          <SidePanelCloseButton />
        </SidePanelHeader>
        <SidePanelContent>Body</SidePanelContent>
      </SidePanel>
    </SidePanelProvider>
  );
}

describe("GIVEN a SidePanel component", () => {
  checkAccessibility(composedStories);

  it.each([
    [Left, "Open left panel", "left"],
    [Default, "Open right panel", "right"],
  ] as const)(
    "opens and closes the %s position with correct ARIA and focus",
    async (Story, triggerName, position) => {
      await renderWithSalt(<Story />);
      const trigger = page.getByRole("button", { name: triggerName });
      await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
      await trigger.click();
      const panel = page.getByRole("region", { name: "Section Title" });
      await expect.element(panel).toBeVisible();
      await expect.element(panel).toHaveClass(`saltSidePanel-${position}`);
      await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      await expect
        .element(trigger)
        .toHaveAttribute("aria-controls", panel.element().id);
      await expect
        .element(page.getByRole("button", { name: "Close Section Title" }))
        .toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect.element(panel).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();
      await trigger.click();
      await page.getByRole("button", { name: "Close Section Title" }).click();
      await expect.element(trigger).toHaveFocus();
    },
  );

  it("supports a manual trigger", async () => {
    await renderWithSalt(<ManualTrigger />);
    const trigger = page.getByRole("button", { name: "Toggle left panel" });
    await trigger.click();
    const panel = page.getByRole("region", { name: "Left Panel" });
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(trigger)
      .toHaveAttribute("aria-controls", panel.element().id);
  });

  it("reports open state changes", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(
      <SidePanelProvider onOpenChange={onOpenChange}>
        <SidePanelTriggerButton>Open Panel</SidePanelTriggerButton>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Test Panel</SidePanelTitle>
            <Button>Close</Button>
          </SidePanelHeader>
          <SidePanelContent>Content</SidePanelContent>
        </SidePanel>
      </SidePanelProvider>,
    );
    await page.getByRole("button", { name: "Open Panel" }).click();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await expect
      .element(page.getByRole("button", { name: "Close" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("routes keyboard focus through the panel after its trigger", async () => {
    await renderWithSalt(<FocusOrderPanel />);
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Before trigger" }))
      .toHaveFocus();
    await userEvent.tab();
    const trigger = page.getByRole("button", { name: "Open panel" });
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const close = page.getByRole("button", { name: "Close Focus Panel" });
    await expect.element(close).toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Panel action" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After trigger" }))
      .toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("button", { name: "Panel action" }))
      .toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(trigger).toHaveFocus();
  });

  it("does not autofocus a default-open panel", async () => {
    await renderWithSalt(<DetachedTabOrderPanel />);
    await expect
      .element(page.getByRole("region", { name: "Detached Order Panel" }))
      .toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(document.activeElement?.closest(".saltSidePanel")).toBeNull();
  });

  it("keeps default-open panel content out of natural outer tab order", async () => {
    await renderWithSalt(<DetachedTabOrderPanel />);
    const names = [
      "Open panel",
      "Close Detached Order Panel",
      "Panel action",
      "After trigger",
      "Later page action",
      "After panel",
    ];
    for (const name of names) {
      await userEvent.tab();
      await expect.element(page.getByRole("button", { name })).toHaveFocus();
    }
  });

  it("does not re-enter the panel when focus returns from later content", async () => {
    await renderWithSalt(<DetachedTabOrderPanel />);
    page.getByRole("button", { name: "After panel" }).element().focus();
    page.getByRole("button", { name: "Open panel" }).element().focus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After trigger" }))
      .toHaveFocus();
  });

  it("updates table details for different triggers", async () => {
    await renderWithSalt(<WithTable />);
    await page
      .getByRole("button", { name: "Edit details for Alex Morgan" })
      .click();
    await expect.element(getByDisplayValue("Alex Morgan")).toBeVisible();
    await expect
      .element(getByDisplayValue("alex.morgan@example.com"))
      .toBeVisible();
    await page
      .getByRole("button", { name: "Close Alex Morgan Employee Details" })
      .click();
    await expect.element(page.getByRole("table")).toBeVisible();
    await page
      .getByRole("button", { name: "Edit details for Jordan Lee" })
      .click();
    await expect.element(getByDisplayValue("Jordan Lee")).toBeVisible();
  });

  it("returns focus to each table trigger after every close path", async () => {
    await renderWithSalt(<WithTable />);
    const cases = [
      ["Taylor Reed", "escape"],
      ["Alex Morgan", "close"],
      ["Jordan Lee", "cancel"],
    ] as const;
    for (const [name, method] of cases) {
      const trigger = page.getByRole("button", {
        name: `Edit details for ${name}`,
      });
      await trigger.click();
      if (method === "escape") await userEvent.keyboard("{Escape}");
      else if (method === "close")
        await page
          .getByRole("button", { name: `Close ${name} Employee Details` })
          .click();
      else await page.getByRole("button", { name: "Cancel" }).click();
      await expect.element(page.getByRole("region")).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();
    }
  });

  it("sets scrollable body focusability only when needed", async () => {
    await renderWithSalt(<Default />);
    await page.getByRole("button", { name: "Open right panel" }).click();
    let body = document.querySelector(".saltSidePanelContent-body");
    expect(body).not.toHaveAttribute("tabindex");
    await renderWithSalt(<Scrollable />);
    await page.getByRole("button", { name: "Toggle right panel" }).click();
    body = document.querySelector(".saltSidePanelContent-body");
    await expect.poll(() => body?.getAttribute("tabindex")).toBe("-1");
    expect(body).toHaveAttribute("data-salt-original-tabindex", "0");
    expect(body).toHaveAttribute("role", "region");
  });

  it("updates focusability when content becomes scrollable", async () => {
    await renderWithSalt(<DynamicScrollablePanel />);
    const body = document.querySelector(".saltSidePanelContent-body");
    expect(body).not.toHaveAttribute("tabindex");
    await page.getByRole("button", { name: "Expand content" }).click();
    await expect.poll(() => body?.getAttribute("tabindex")).toBe("0");
    expect(body).toHaveAttribute("role", "region");
  });

  it("keeps navigation visible when the panel closes", async () => {
    await renderWithSalt(<WithNav />);
    await page.getByRole("button", { name: "Open side panel" }).click();
    await expect.element(page.getByRole("navigation")).toBeVisible();
    await page.getByRole("button", { name: "Close Section Title" }).click();
    await expect.element(page.getByRole("navigation")).toBeVisible();
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<ControlledPanel onOpenChange={onOpenChange} />);
    await page.getByRole("button", { name: "Toggle" }).click();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await expect
      .element(page.getByRole("region", { name: "Controlled" }))
      .toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await expect
      .element(page.getByRole("region", { name: "Controlled" }))
      .not.toBeInTheDocument();
  });

  it("honors a controlled open prop when the parent ignores changes", async () => {
    await renderWithSalt(
      <SidePanelProvider open onOpenChange={() => {}}>
        <SidePanelTriggerButton>Open</SidePanelTriggerButton>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Stuck</SidePanelTitle>
            <SidePanelCloseButton />
          </SidePanelHeader>
        </SidePanel>
      </SidePanelProvider>,
    );
    await page.getByRole("button", { name: "Close Stuck" }).click();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(page.getByRole("region", { name: "Stuck" }))
      .toBeVisible();
  });

  it.each(["number", "ref"] as const)(
    "supports %s initialFocus",
    async (kind) => {
      function InitialFocusPanel() {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
          <SidePanelProvider>
            <SidePanelTriggerButton>Open</SidePanelTriggerButton>
            <SidePanel
              disableAnimation
              initialFocus={kind === "number" ? 1 : inputRef}
            >
              <SidePanelHeader>
                <SidePanelTitle>Initial</SidePanelTitle>
                <SidePanelCloseButton />
              </SidePanelHeader>
              <SidePanelContent>
                {kind === "number" ? (
                  <Button>Second action</Button>
                ) : (
                  <Input
                    inputRef={inputRef}
                    inputProps={{ "aria-label": "Email" }}
                  />
                )}
              </SidePanelContent>
            </SidePanel>
          </SidePanelProvider>
        );
      }
      await renderWithSalt(<InitialFocusPanel />);
      await page.getByRole("button", { name: "Open" }).click();
      if (kind === "number")
        await expect
          .element(page.getByRole("button", { name: "Second action" }))
          .toHaveFocus();
      else
        await expect
          .element(page.getByRole("textbox", { name: "Email" }))
          .toHaveFocus();
    },
  );

  it("focuses the panel after a user reopens a default-open instance", async () => {
    await renderWithSalt(<FocusOrderPanel defaultOpen />);
    page.getByRole("button", { name: "Close Focus Panel" }).element().focus();
    await userEvent.keyboard("{Escape}");
    await page.getByRole("button", { name: "Open panel" }).click();
    await expect
      .element(page.getByRole("button", { name: "Close Focus Panel" }))
      .toHaveFocus();
  });

  it("composes user refs and click handlers through getTriggerProps", async () => {
    const onClick = vi.fn();
    function CustomTrigger() {
      const ref = useRef<HTMLButtonElement>(null);
      const { getTriggerProps } = useSidePanel();
      return (
        <>
          <Button {...getTriggerProps({ ref, onClick })}>Open</Button>
          <SidePanel disableAnimation>
            <SidePanelHeader>
              <SidePanelTitle>Custom Trigger</SidePanelTitle>
              <SidePanelCloseButton />
            </SidePanelHeader>
          </SidePanel>
        </>
      );
    }
    await renderWithSalt(
      <SidePanelProvider>
        <CustomTrigger />
      </SidePanelProvider>,
    );
    const trigger = page.getByRole("button", { name: "Open" });
    await trigger.click();
    expect(onClick).toHaveBeenCalledOnce();
    await page.getByRole("button", { name: "Close Custom Trigger" }).click();
    await expect.element(trigger).toHaveFocus();
  });
});
