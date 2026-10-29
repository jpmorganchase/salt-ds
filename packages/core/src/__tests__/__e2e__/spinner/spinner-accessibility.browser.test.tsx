import { Spinner } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

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
  it("announces the aria-label again after five seconds", async () => {
    vi.useFakeTimers();
    try {
      const rendered = await renderWithSalt(<Spinner aria-label={ariaLabel} />);
      try {
        await vi.advanceTimersByTimeAsync(5_000);
        await expect.poll(liveRegionText).toContain(ariaLabel);
      } finally {
        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  // Keep these skipped while their unmount-announcement TODO remains.
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
