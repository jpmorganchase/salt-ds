import { Progress } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as progressStories from "~stories/progress/progress.stories";

const composedStories = composeStories(progressStories);

function liveRegionText() {
  return Array.from(document.querySelectorAll("[aria-live]"))
    .map((element) => element.textContent ?? "")
    .join(" ");
}

describe("GIVEN a Progress", () => {
  checkAccessibility(composedStories);

  describe("WHEN it has a value", () => {
    it("THEN it's a progressbar named by its label, with its value", async () => {
      await renderWithSalt(
        <Progress delay={0} label="Uploading report.pdf" value={38} />,
      );
      const progressbar = page.getByRole("progressbar", {
        name: "Uploading report.pdf",
      });

      await expect.element(progressbar).toHaveAttribute("aria-valuemin", "0");
      await expect.element(progressbar).toHaveAttribute("aria-valuemax", "100");
      await expect.element(progressbar).toHaveAttribute("aria-valuenow", "38");
      await expect
        .element(progressbar)
        .toHaveAttribute("aria-valuetext", "38%");
      await expect.element(page.getByText("38%")).toBeInTheDocument();
    });

    it("THEN it shows and announces the value text from getValueText", async () => {
      await renderWithSalt(
        <Progress
          delay={0}
          label="Uploading files"
          value={3}
          max={5}
          getValueText={(value, max) => `${value} of ${max} files`}
          description="About 2 minutes left"
        />,
      );
      const progressbar = page.getByRole("progressbar", {
        name: "Uploading files",
      });

      await expect
        .element(progressbar)
        .toHaveAttribute("aria-valuetext", "3 of 5 files");
      await expect
        .element(progressbar)
        .toHaveAccessibleDescription("About 2 minutes left");
    });

    it("THEN it hides the value text WHEN hideValue is set", async () => {
      await renderWithSalt(
        <Progress delay={0} label="Uploading" value={38} hideValue />,
      );

      await expect.element(page.getByText("38%")).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("progressbar"))
        .toHaveAttribute("aria-valuetext", "38%");
    });

    it("THEN it hides the value text by default WHEN it's small and circular", async () => {
      const rendered = await renderWithSalt(
        <Progress
          delay={0}
          shape="circular"
          size="small"
          aria-label="Downloading"
          value={38}
        />,
      );

      await expect.element(page.getByText("38%")).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("progressbar", { name: "Downloading" }))
        .toHaveAttribute("aria-valuetext", "38%");

      await rendered.rerender(
        <Progress
          delay={0}
          shape="circular"
          size="small"
          aria-label="Downloading"
          value={38}
          hideValue={false}
        />,
      );
      await expect.element(page.getByText("38%")).toBeInTheDocument();
    });
  });

  describe("WHEN it has a buffer value", () => {
    function bufferWidth() {
      const buffer = document.querySelector<HTMLElement>(
        ".saltProgress-buffer",
      );
      const track = document.querySelector<HTMLElement>(
        ".saltProgress-indicator",
      );
      return buffer && track ? buffer.clientWidth / track.clientWidth : null;
    }

    it("THEN it shows the buffer ahead of the bar", async () => {
      await renderWithSalt(
        <div style={{ width: 200 }}>
          <Progress
            delay={0}
            label="Playing video"
            value={20}
            bufferValue={60}
          />
        </div>,
      );

      await expect.poll(bufferWidth).toBeCloseTo(0.6, 2);
    });

    it("THEN the buffer never sits behind the bar", async () => {
      await renderWithSalt(
        <div style={{ width: 200 }}>
          <Progress
            delay={0}
            label="Playing video"
            value={60}
            bufferValue={20}
          />
        </div>,
      );

      await expect.poll(bufferWidth).toBeCloseTo(0.6, 2);
    });

    it.each([
      ["it has no value", { label: "Loading", bufferValue: 60 }],
      [
        "it's circular",
        {
          shape: "circular" as const,
          label: "Loading",
          value: 20,
          bufferValue: 60,
        },
      ],
    ])("THEN it shows no buffer WHEN %s", async (_, props) => {
      await renderWithSalt(<Progress delay={0} {...props} />);

      await expect.element(page.getByRole("progressbar")).toBeInTheDocument();
      expect(document.querySelector(".saltProgress-buffer")).toBeNull();
    });
  });

  describe("WHEN it has no value", () => {
    it("THEN it's indeterminate, with no value", async () => {
      await renderWithSalt(<Progress delay={0} label="Loading accounts" />);
      const progressbar = page.getByRole("progressbar", {
        name: "Loading accounts",
      });

      await expect.element(progressbar).not.toHaveAttribute("aria-valuenow");
      await expect.element(progressbar).not.toHaveAttribute("aria-valuetext");
    });

    it("THEN it's named by aria-label WHEN it has no label", async () => {
      await renderWithSalt(
        <Progress delay={0} shape="circular" aria-label="Loading" />,
      );

      await expect
        .element(page.getByRole("progressbar", { name: "Loading" }))
        .toBeInTheDocument();
    });

    it("THEN it announces its label", async () => {
      await renderWithSalt(<Progress delay={0} label="Loading accounts" />);

      await expect.poll(liveRegionText).toContain("Loading accounts");
    });
  });

  describe.each(["linear", "circular"] as const)("WHEN it's %s", (shape) => {
    it.each([
      [{ status: "success" as const }, "100%, success"],
      [{ status: "error" as const, value: 60 }, "60%, error"],
      [{ paused: true, value: 60 }, "60%, paused"],
    ])("THEN it includes the state in its value text", async (props, text) => {
      await renderWithSalt(
        <Progress delay={0} shape={shape} label="Uploading" {...props} />,
      );

      await expect
        .element(page.getByRole("progressbar"))
        .toHaveAttribute("aria-valuetext", text);
    });
  });

  it("THEN it announces milestones and completion, not every value", async () => {
    const rendered = await renderWithSalt(
      <Progress delay={0} label="Uploading" value={10} />,
    );
    expect(liveRegionText()).not.toContain("Uploading, 10%");

    await rendered.rerender(
      <Progress delay={0} label="Uploading" value={55} />,
    );
    await expect.poll(liveRegionText).toContain("Uploading, 55%");

    await rendered.rerender(
      <Progress delay={0} label="Uploading" value={100} />,
    );
    await expect.poll(liveRegionText).toContain("finished Uploading");
  });

  it("THEN it waits 1 second before it shows, by default", async () => {
    vi.useFakeTimers();
    try {
      await renderWithSalt(<Progress label="Uploading" value={38} />);
      expect(document.querySelector('[role="progressbar"]')).toBeNull();

      await vi.advanceTimersByTimeAsync(1000);
      await expect
        .element(page.getByRole("progressbar", { name: "Uploading" }))
        .toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
