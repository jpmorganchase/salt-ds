import { Spinner } from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

const ariaLabel = "Loading component";

function liveRegionText() {
  return Array.from(document.querySelectorAll("[aria-live]"))
    .map((element) => element.textContent ?? "")
    .join(" ");
}

describe("GIVEN a Spinner", () => {
  it("renders with the default accessible name", async () => {
    await renderWithSalt(<Spinner />);
    await expect
      .element(page.getByRole("img", { name: "loading" }))
      .toBeInTheDocument();
  });

  it("renders with a custom accessible name", async () => {
    await renderWithSalt(<Spinner aria-label="loading settings panel" />);
    await expect
      .element(page.getByRole("img", { name: "loading settings panel" }))
      .toBeInTheDocument();
  });

  it("announces its aria-label", async () => {
    await renderWithSalt(<Spinner aria-label={ariaLabel} />);
    await expect.poll(liveRegionText).toContain(ariaLabel);
  });
});

describe("GIVEN an available announcer", () => {
  it("announces the aria-label again after five seconds", {
    timeout: 8_000,
  }, async () => {
    await renderWithSalt(<Spinner aria-label={ariaLabel} />);
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    await expect.poll(liveRegionText).toContain(ariaLabel);
  });

  // Preserves the Cypress skips while their unmount-announcement TODO remains.
  it.skip("announces when the component unmounts", async () => {
    const rendered = await renderWithSalt(<Spinner aria-label={ariaLabel} />);
    await rendered.unmount();

    await expect.poll(liveRegionText).toContain(`finished ${ariaLabel}`);
  });

  it.skip("does not announce when the announcer is disabled", async () => {
    const rendered = await renderWithSalt(
      <Spinner aria-label={ariaLabel} disableAnnouncer />,
    );
    expect(liveRegionText()).not.toContain(ariaLabel);

    await rendered.unmount();
    expect(liveRegionText()).not.toContain(`finished ${ariaLabel}`);
  });

  it.skip("does not announce a null completion message", async () => {
    const rendered = await renderWithSalt(
      <Spinner aria-label={ariaLabel} completionAnnouncement={null} />,
    );

    await rendered.unmount();
    expect(liveRegionText()).not.toContain(`finished ${ariaLabel}`);
  });
});
