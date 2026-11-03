import { AriaAnnouncerProvider } from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import { DeletionWithFocus } from "../../../site/src/examples/dialog/DeletionWithFocus";
import { ErrorSummary } from "../../../site/src/examples/patterns/forms/ErrorSummary";
import { ToggleButtonGroupViewSwitching } from "../../../site/src/examples/toggle-button/ToggleButtonGroupViewSwitching";

async function openDeletion(record: string) {
  await page
    .getByRole("button", { name: `Delete ${record}`, exact: true })
    .click();
  await expect
    .element(page.getByRole("dialog", { name: "Delete record?" }))
    .toBeVisible();
  await expect
    .element(page.getByRole("button", { name: "Cancel", exact: true }))
    .toHaveFocus();
}

async function confirmDeletion(record: string) {
  await openDeletion(record);
  await page.getByRole("button", { name: "Confirm delete" }).click();
  // Wait for the real closing lifecycle, rather than guessing an animation delay.
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect
    .element(
      page.getByRole("button", { name: `Delete ${record}`, exact: true }),
    )
    .not.toBeInTheDocument();
}

describe("Deletion with focus example", () => {
  it.each([
    "Cancel",
    "Escape",
  ] as const)("%s preserves the records and returns focus to the trigger", async (action) => {
    await renderWithSalt(<DeletionWithFocus />);
    await openDeletion("Mercury");

    if (action === "Cancel") {
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
    } else {
      await userEvent.keyboard("{Escape}");
    }

    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    for (const record of ["Atlas", "Mercury", "Nova"]) {
      await expect
        .element(
          page.getByRole("button", { name: `Delete ${record}`, exact: true }),
        )
        .toBeVisible();
    }
    await expect
      .element(
        page.getByRole("button", { name: "Delete Mercury", exact: true }),
      )
      .toHaveFocus();
  });

  it.each([
    ["Mercury", "Nova"],
    ["Nova", "Mercury"],
  ])("deleting %s moves focus to the surviving %s action", async (record, next) => {
    await renderWithSalt(<DeletionWithFocus />);
    await confirmDeletion(record);

    await expect
      .element(
        page.getByRole("button", { name: `Delete ${next}`, exact: true }),
      )
      .toHaveFocus();
    await expect
      .element(page.getByRole("status"))
      .toHaveTextContent(`Deleted ${record}.`);
  });

  it("moves focus to Add record when the collection becomes empty", async () => {
    await renderWithSalt(<DeletionWithFocus />);
    for (const record of ["Atlas", "Mercury", "Nova"]) {
      await confirmDeletion(record);
    }

    await expect.element(page.getByText("No records remain.")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Add record", exact: true }))
      .toHaveFocus();
  });

  it("preserves focus handed to another control on close", async () => {
    await renderWithSalt(<DeletionWithFocus />);
    const trigger = page
      .getByRole("button", { name: "Delete Mercury", exact: true })
      .element();
    const addRecord = page.getByRole("button", {
      name: "Add record",
      exact: true,
    });
    const addRecordElement = addRecord.element();
    await openDeletion("Mercury");

    // Another focus owner can move focus as Dialog restores the surviving trigger.
    // The subsequent collection update must preserve that choice.
    let focusWasTransferred = false;
    const moveFocus = () => {
      addRecordElement.focus();
      focusWasTransferred = document.activeElement === addRecordElement;
    };
    trigger.addEventListener("focus", moveFocus, { once: true });
    try {
      await page.getByRole("button", { name: "Confirm delete" }).click();
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect
        .element(
          page.getByRole("button", { name: "Delete Mercury", exact: true }),
        )
        .not.toBeInTheDocument();
      expect(focusWasTransferred).toBe(true);
      await expect.element(addRecord).toHaveFocus();
    } finally {
      trigger.removeEventListener("focus", moveFocus);
    }
  });
});

describe("Form error summary example", () => {
  it("connects errors to inputs, focuses summary targets and preserves corrected values", async () => {
    await renderWithSalt(
      <AriaAnnouncerProvider>
        <ErrorSummary />
      </AriaAnnouncerProvider>,
    );
    const form = page.getByRole("form", { name: "Project details" });
    const projectName = form.getByRole("textbox", { name: /^Project name/ });
    const projectOwner = form.getByRole("textbox", { name: /^Project owner/ });
    const costCentre = form.getByRole("textbox", { name: /^Cost centre/ });
    const submit = form.getByRole("button", { name: "Submit" });
    const summary = form.getByRole("region", {
      name: "Review the following details",
    });

    await projectName.fill("Atlas");
    await submit.click();

    await expect.element(projectOwner).toHaveFocus();
    await expect.element(projectOwner).toHaveAttribute("aria-invalid", "true");
    await expect
      .element(projectOwner)
      .toHaveAccessibleDescription("Enter the name of the project owner.");
    await summary
      .getByRole("link", { name: "Cost centre: Enter a cost centre." })
      .click();
    await expect.element(costCentre).toHaveFocus();
    await expect
      .element(costCentre)
      .toHaveAccessibleDescription("Enter a cost centre.");

    await projectOwner.fill("Sam");
    await submit.click();
    await expect.element(costCentre).toHaveFocus();
    await expect.element(projectName).toHaveValue("Atlas");
    await expect.element(projectOwner).toHaveValue("Sam");
    await expect
      .element(projectOwner)
      .not.toHaveAttribute("aria-invalid", "true");

    await costCentre.fill("1234");
    await submit.click();
    await expect.element(summary).not.toBeInTheDocument();
    await expect
      .element(form.getByText("The form is valid. No data was submitted."))
      .toBeVisible();
    await expect.element(projectName).toHaveValue("Atlas");
    await expect.element(projectOwner).toHaveValue("Sam");
    await expect.element(costCentre).toHaveValue("1234");
    await expect
      .element(costCentre)
      .not.toHaveAttribute("aria-invalid", "true");
  });
});

describe("View switching example", () => {
  it("preserves the filter and selected record when switching presentations with the keyboard", async () => {
    await renderWithSalt(<ToggleButtonGroupViewSwitching />);
    const filter = page.getByRole("textbox", { name: "Filter incidents" });
    const views = page.getByRole("radiogroup", { name: "View", exact: true });
    const listView = views.getByRole("radio", { name: "List", exact: true });
    const cardsView = views.getByRole("radio", { name: "Cards", exact: true });

    await filter.fill("Trading");
    await page.getByRole("option", { name: /^Pricing feed/ }).click();
    await expect
      .element(page.getByRole("option", { name: /^Pricing feed/ }))
      .toHaveAttribute("aria-selected", "true");

    listView.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(cardsView).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    await expect.element(cardsView).toHaveAttribute("aria-checked", "true");
    await expect
      .element(page.getByRole("radio", { name: /^Pricing feed/ }))
      .toHaveAttribute("aria-checked", "true");
    await expect
      .element(page.getByRole("radio", { name: /^Settlement queue/ }))
      .not.toBeInTheDocument();
    await expect.element(filter).toHaveValue("Trading");

    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(listView).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    await expect.element(listView).toHaveAttribute("aria-checked", "true");
    await expect
      .element(page.getByRole("option", { name: /^Pricing feed/ }))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(page.getByRole("option", { name: /^Settlement queue/ }))
      .not.toBeInTheDocument();
    await expect.element(filter).toHaveValue("Trading");
  });
});
