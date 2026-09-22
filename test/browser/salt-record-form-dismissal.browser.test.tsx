import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";
import { OperationsDashboard } from "../../examples/apps/operations-dashboard/src/OperationsDashboard";

async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

describe("Record form dismissal", () => {
  it.each(["Escape", "Close"] as const)(
    "%s cancels a pending save, retains the draft and leaves the next save independent",
    async (dismissal) => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      try {
        const rendered = await renderWithSalt(<OperationsDashboard />);
        try {
          await advance(400);
          const trigger = page.getByRole("button", {
            name: "Create incident",
            exact: true,
          });
          await trigger.click();
          const dialog = page.getByRole("dialog", { name: "Create incident" });
          const title = dialog.getByRole("textbox", {
            name: /^Incident title/,
          });
          const service = dialog.getByRole("textbox", {
            name: /^Affected service or operational process/,
          });
          const submit = () =>
            dialog.getByRole("button", {
              name: "Create incident",
              exact: true,
            });
          const focusFeedback: {
            invalid: string | null;
            description: string;
          }[] = [];
          await expect.element(title).toBeVisible();
          title.element().addEventListener("focus", (event) => {
            const input = event.currentTarget as HTMLInputElement;
            const description = (input.getAttribute("aria-describedby") ?? "")
              .split(/\s+/)
              .map((id) => document.getElementById(id)?.textContent ?? "")
              .join(" ");
            focusFeedback.push({
              invalid: input.getAttribute("aria-invalid"),
              description,
            });
          });
          await submit().click();
          await expect.element(title).toHaveFocus();
          expect(focusFeedback.at(-1)?.invalid).toBe("true");
          expect(focusFeedback.at(-1)?.description).toContain(
            "Enter at least 5 characters",
          );

          await title.fill("Retained incident draft");
          await service.fill("Order gateway");
          await submit().click();
          await expect.element(title).toHaveAttribute("readonly");
          await advance(500);
          if (dismissal === "Escape") {
            await userEvent.keyboard("{Escape}");
          } else {
            await dialog
              .getByRole("button", { name: "Close", exact: true })
              .click();
          }
          await expect.element(dialog).not.toBeInTheDocument();
          await expect.element(trigger).toHaveFocus();

          await trigger.click();
          await expect.element(title).toHaveValue("Retained incident draft");
          await expect.element(service).toHaveValue("Order gateway");
          await expect.element(title).not.toHaveAttribute("readonly");
          await title.fill("Revised incident draft");
          await submit().click();

          // The cancelled save's deadline passes while the replacement is pending.
          await advance(1000);
          await expect.element(dialog).toBeVisible();
          await expect.element(title).toHaveAttribute("readonly");
          await expect
            .element(dialog.getByRole("alert"))
            .not.toBeInTheDocument();
          await advance(500);
          await expect
            .element(dialog.getByRole("alert"))
            .toHaveTextContent("The local demo rejected this first save.");
          await expect.element(title).toHaveValue("Revised incident draft");
          await expect.element(title).not.toHaveAttribute("readonly");

          await dialog
            .getByRole("button", { name: "Retry save", exact: true })
            .click();
          await advance(1500);
          await expect.element(dialog).not.toBeInTheDocument();
          await expect.element(trigger).toHaveFocus();
          await expect
            .element(
              page.getByText(
                "Local demo recorded Revised incident draft for Order gateway. No notification was sent.",
              ),
            )
            .toBeVisible();
          const incidents = page.getByRole("list", {
            name: "Incidents",
            exact: true,
          });
          await expect
            .element(
              incidents.getByRole("button", {
                name: /Revised incident draft/,
              }),
            )
            .toHaveLength(1);
          await expect
            .element(
              incidents.getByRole("button", {
                name: /Retained incident draft/,
              }),
            )
            .not.toBeInTheDocument();
        } finally {
          await rendered.unmount();
        }
      } finally {
        vi.useRealTimers();
      }
    },
  );
});
