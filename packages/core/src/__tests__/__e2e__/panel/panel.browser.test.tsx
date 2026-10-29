import { Panel } from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a Panel", () => {
  it("has no a11y violations on load", async () => {
    const { container } = await renderWithSalt(<Panel>Content</Panel>);
    await runAxeScan(container);
  });

  it("displays a string child", async () => {
    await renderWithSalt(<Panel>Lorem Ipsum</Panel>);
    await expect.element(page.getByText("Lorem Ipsum")).toBeInTheDocument();
  });

  it("displays a node child", async () => {
    await renderWithSalt(
      <Panel>
        <div data-testid="test" />
      </Panel>,
    );
    await expect.element(page.getByTestId("test")).toBeInTheDocument();
  });

  it("displays the secondary variant", async () => {
    const { container } = await renderWithSalt(
      <Panel variant="secondary">Content</Panel>,
    );
    expect(container.querySelector(".saltPanel-secondary")).not.toBeNull();
  });
});
