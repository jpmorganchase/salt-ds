import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import { ErrorSummary } from "../../site/src/examples/patterns/forms";

describe("Forms error summary", () => {
  it("keeps values and connects summary links to invalid fields through correction and resubmission", async () => {
    const { container } = await renderWithSalt(<ErrorSummary />);
    const project = page.getByRole("textbox", { name: /^Project name/ });
    const owner = page.getByRole("textbox", { name: /^Project owner/ });
    const costCentre = page.getByRole("textbox", { name: /^Cost centre/ });
    const submit = page.getByRole("button", { name: "Submit", exact: true });
    const summary = page.getByRole("region", {
      name: "Review the following details",
    });

    await expect.element(summary).not.toBeInTheDocument();
    await project.fill("Settlement review");
    await submit.click();
    await expect.element(owner).toHaveFocus();
    await expect.element(project).toHaveValue("Settlement review");
    await expect.element(project).toHaveAttribute("aria-invalid", "false");
    await expect.element(owner).toHaveAttribute("aria-invalid", "true");
    await expect.element(owner).toHaveAccessibleDescription(/Enter the name/);
    await expect
      .element(costCentre)
      .toHaveAccessibleDescription(/Enter a cost centre/);
    await expect
      .element(summary.getByRole("link", { name: /^Project owner:/ }))
      .toBeVisible();

    const costLink = summary.getByRole("link", { name: /^Cost centre:/ });
    costLink.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(costCentre).toHaveFocus();
    await runAxeScan(container);

    await submit.click();
    await expect.element(owner).toHaveFocus();
    await owner.fill("Alex Morgan");
    await expect.element(owner).toHaveFocus();
    await expect.element(owner).toHaveAttribute("aria-invalid", "false");
    await expect
      .element(summary.getByRole("link", { name: /^Project owner:/ }))
      .not.toBeInTheDocument();
    await costCentre.fill("Operations");
    await expect.element(summary).not.toBeInTheDocument();
    await submit.click();
    await expect
      .element(
        page.getByText("The form is valid. No data was submitted.").first(),
      )
      .toBeVisible();
    await expect.element(project).toHaveValue("Settlement review");
    await expect.element(owner).toHaveValue("Alex Morgan");
    await expect.element(costCentre).toHaveValue("Operations");
  });
});
