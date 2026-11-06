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

    it("THEN it shows no buffer WHEN it has no value", async () => {
      await renderWithSalt(
        <Progress delay={0} label="Loading" bufferValue={60} />,
      );

      await expect.element(page.getByRole("progressbar")).toBeInTheDocument();
      expect(document.querySelector(".saltProgress-buffer")).toBeNull();
    });

    it("THEN it shows no buffer WHEN it's circular", async () => {
      await renderWithSalt(
        // @ts-expect-error: bufferValue is only for linear progress, but JavaScript users can still pass it
        <Progress
          delay={0}
          shape="circular"
          label="Loading"
          value={20}
          bufferValue={60}
        />,
      );

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

    it("THEN it repeats its label after 5 seconds", async () => {
      vi.useFakeTimers();
      try {
        const rendered = await renderWithSalt(
          <Progress delay={0} label="Loading accounts" />,
        );
        await vi.advanceTimersByTimeAsync(5_000);
        await expect.poll(liveRegionText).toContain("Loading accounts");

        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it("THEN it doesn't announce completion WHEN it's removed", async () => {
      const rendered = await renderWithSalt(
        <Progress delay={0} label="Loading accounts" />,
      );
      await expect.poll(liveRegionText).toContain("Loading accounts");

      // Removal could also mean the task was cancelled, so it isn't announced as finished
      await rendered.rerender(<span>Done</span>);
      await expect.element(page.getByText("Done")).toBeInTheDocument();
      expect(liveRegionText()).not.toContain("finished");
    });
  });

  it("THEN it shows the success icon instead of the value WHEN it succeeds", async () => {
    await renderWithSalt(
      <Progress delay={0} label="Uploading" value={100} status="success" />,
    );

    await expect.element(page.getByText("100%")).not.toBeInTheDocument();
    await expect
      .element(page.getByRole("img", { name: "success" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("progressbar"))
      .toHaveAttribute("aria-valuetext", "100%, success");
  });

  it("THEN it shows that it's paused", async () => {
    await renderWithSalt(
      <Progress delay={0} label="Uploading" value={60} paused />,
    );

    await expect.element(page.getByText("Paused")).toBeInTheDocument();
    await expect.element(page.getByText("60%")).toBeInTheDocument();
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

  it("THEN it announces completion, not changes of value", async () => {
    const rendered = await renderWithSalt(
      <Progress delay={0} label="Uploading" value={10} />,
    );
    await rendered.rerender(
      <Progress delay={0} label="Uploading" value={55} />,
    );
    await expect
      .element(page.getByRole("progressbar"))
      .toHaveAttribute("aria-valuetext", "55%");
    expect(liveRegionText()).not.toContain("55%");

    await rendered.rerender(
      <Progress delay={0} label="Uploading" value={100} />,
    );
    await expect.poll(liveRegionText).toContain("finished Uploading");
  });

  it("THEN it announces that the task failed", async () => {
    const rendered = await renderWithSalt(
      <Progress delay={0} label="Uploading" value={40} />,
    );
    await rendered.rerender(
      <Progress delay={0} label="Uploading" value={40} status="error" />,
    );

    await expect.poll(liveRegionText).toContain("Uploading, error");
  });

  it("THEN size is only for circular progress, and bufferValue only for linear", () => {
    // @ts-expect-error: size is only for circular progress
    const linearWithSize = <Progress size="large" />;
    // @ts-expect-error: bufferValue is only for linear progress
    const circularWithBuffer = <Progress shape="circular" bufferValue={60} />;

    expect([linearWithSize, circularWithBuffer]).toHaveLength(2);
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
