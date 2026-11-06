import { AriaAnnouncerContext } from "@salt-ds/core";
import { Progress, type ProgressShape } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { act, renderWithSalt } from "~browser-test-utils/render";
import * as progressStories from "~stories/progress/progress.stories";

const composedStories = composeStories(progressStories);

afterEach(() => vi.restoreAllMocks());

function liveRegionText() {
  return Array.from(document.querySelectorAll("[aria-live]"))
    .map((element) => element.textContent ?? "")
    .join(" ");
}

async function advanceTime(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

function mockReducedMotion() {
  const matchMedia = window.matchMedia.bind(window);
  const events = new EventTarget();
  const mediaQuery = {
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(events.addEventListener.bind(events)),
    removeEventListener: vi.fn(events.removeEventListener.bind(events)),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
  vi.spyOn(window, "matchMedia").mockImplementation((query) =>
    query === mediaQuery.media ? mediaQuery : matchMedia(query),
  );
  return mediaQuery;
}

function mockRunningLoop(shape: ProgressShape) {
  const progressbar = page.getByRole("progressbar").element();
  // Keep the exit deadline away from the current time, independent of browser animation frames.
  vi.spyOn(progressbar, "getAnimations").mockReturnValue([
    {
      animationName: `saltProgress-${shape}-loop`,
      playState: "running",
      effect: {
        getComputedTiming: () => ({ progress: 0.1, duration: 1000 }),
      },
    } as unknown as CSSAnimation,
  ]);
  const indicator = progressbar.querySelector<HTMLElement | SVGElement>(
    ".saltProgress-indicator",
  );
  if (!indicator) throw new Error("Progress indicator is missing");
  return indicator;
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

    it("THEN a linear bar stays visible while its value shrinks to zero", async () => {
      const rendered = await renderWithSalt(
        <div style={{ width: 200 }}>
          <Progress delay={0} label="Uploading" value={60} />
        </div>,
      );
      const bar = document.querySelector<HTMLElement>(".saltProgress-bar");
      if (!bar) throw new Error("Progress bar is missing");
      bar.style.transitionDuration = "10s";
      const initialWidth = bar.getBoundingClientRect().width;

      await rendered.rerender(
        <div style={{ width: 200 }}>
          <Progress delay={0} label="Uploading" value={0} />
        </div>,
      );
      const transition = bar
        .getAnimations()
        .find(
          (animation) =>
            (animation as CSSTransition).transitionProperty === "width",
        );
      if (!transition?.effect) throw new Error("Width transition is missing");
      transition.pause();
      transition.currentTime =
        Number(transition.effect.getComputedTiming().duration) / 2;

      expect(bar.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(bar.getBoundingClientRect().width).toBeLessThan(initialWidth);
      expect(getComputedStyle(bar).visibility).toBe("visible");
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

  describe("WHEN its value becomes known while it loops", () => {
    const loop = () => document.querySelector(".saltProgress-loop");

    function barWidth() {
      const bar = document.querySelector<HTMLElement>(".saltProgress-bar");
      const track = document.querySelector<HTMLElement>(
        ".saltProgress-indicator",
      );
      return bar && track
        ? bar.getBoundingClientRect().width / track.clientWidth
        : null;
    }

    it("THEN it has the value straight away, and fills once the loop has left the track", async () => {
      const rendered = await renderWithSalt(
        <div style={{ width: 200 }}>
          <Progress delay={0} label="Uploading" />
        </div>,
      );
      await rendered.rerender(
        <div style={{ width: 200 }}>
          <Progress delay={0} label="Uploading" value={50} />
        </div>,
      );

      await expect
        .element(page.getByRole("progressbar"))
        .toHaveAttribute("aria-valuenow", "50");
      expect(loop()).not.toBeNull();
      expect(barWidth()).toBe(0);

      await expect.poll(loop, { timeout: 2000 }).toBeNull();
      await expect.poll(barWidth).toBeCloseTo(0.5, 2);
    });

    it("THEN it keeps looping WHEN the value is lost again before the loop ends", async () => {
      const rendered = await renderWithSalt(
        <Progress delay={0} label="Uploading" />,
      );
      const segment = loop();
      await rendered.rerender(
        <Progress delay={0} label="Uploading" value={50} />,
      );
      await rendered.rerender(<Progress delay={0} label="Uploading" />);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      // The same segment is still looping, so the loop never restarted
      expect(loop()).toBe(segment);
    });

    it("THEN it fills straight away WHEN it's paused", async () => {
      const rendered = await renderWithSalt(
        <Progress delay={0} label="Uploading" paused />,
      );
      await rendered.rerender(
        <Progress delay={0} label="Uploading" value={50} paused />,
      );

      await expect.poll(loop, { timeout: 300 }).toBeNull();
    });
  });

  describe.each(["linear", "circular"] as const)(
    "WHEN %s progress is waiting for its loop to finish",
    (shape) => {
      it.each([{ paused: true }, { status: "error" as const }])(
        "THEN it settles immediately when interrupted by %j",
        async (interruption) => {
          vi.useFakeTimers();
          mockReducedMotion();
          try {
            const rendered = await renderWithSalt(
              <Progress delay={0} shape={shape} label="Uploading" />,
            );
            const indicator = mockRunningLoop(shape);
            await rendered.rerender(
              <Progress delay={0} shape={shape} label="Uploading" value={50} />,
            );
            expect(
              indicator.classList.contains("saltProgress-indeterminate"),
            ).toBe(true);

            await rendered.rerender(
              <Progress
                delay={0}
                shape={shape}
                label="Uploading"
                value={50}
                {...interruption}
              />,
            );
            expect(
              indicator.classList.contains("saltProgress-indeterminate"),
            ).toBe(false);
            expect(
              indicator
                .querySelector<HTMLElement | SVGElement>(".saltProgress-bar")
                ?.style.getPropertyValue("--saltProgress-fraction"),
            ).toBe("0.5");

            await rendered.unmount();
            expect(vi.getTimerCount()).toBe(0);
          } finally {
            vi.useRealTimers();
          }
        },
      );

      it("THEN a reduced-motion change cancels the wait and its listener is cleaned up", async () => {
        vi.useFakeTimers();
        const mediaQuery = mockReducedMotion();
        try {
          const rendered = await renderWithSalt(
            <Progress delay={0} shape={shape} label="Uploading" />,
          );
          const indicator = mockRunningLoop(shape);
          const knownProgress = (
            <Progress delay={0} shape={shape} label="Uploading" value={50} />
          );
          await rendered.rerender(knownProgress);
          expect(
            indicator.classList.contains("saltProgress-indeterminate"),
          ).toBe(true);
          expect(mediaQuery.addEventListener).toHaveBeenCalledTimes(1);

          await act(() => {
            mediaQuery.matches = true;
            mediaQuery.dispatchEvent(
              new MediaQueryListEvent("change", {
                matches: true,
                media: mediaQuery.media,
              }),
            );
          });
          expect(
            indicator.classList.contains("saltProgress-indeterminate"),
          ).toBe(false);
          expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
            "change",
            mediaQuery.addEventListener.mock.calls[0][1],
          );

          // Unmounting during another pending exit must also remove its listener and timer.
          mediaQuery.matches = false;
          await rendered.rerender(
            <Progress delay={0} shape={shape} label="Uploading" />,
          );
          await rendered.rerender(knownProgress);
          expect(mediaQuery.addEventListener).toHaveBeenCalledTimes(2);
          await rendered.unmount();
          expect(mediaQuery.removeEventListener).toHaveBeenCalledTimes(2);
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    },
  );

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

  it.each(["success", "error"] as const)(
    "THEN it announces %s once per attempt when the same instance is retried",
    async (status) => {
      const announce = vi.fn();
      const progress = (finished: boolean) => (
        <AriaAnnouncerContext.Provider value={{ announce }}>
          <Progress
            delay={0}
            label="Uploading"
            value={40}
            status={finished ? status : undefined}
          />
        </AriaAnnouncerContext.Provider>
      );
      const rendered = await renderWithSalt(progress(false));
      const message =
        status === "success" ? "finished Uploading" : "Uploading, error";

      for (let attempt = 1; attempt <= 2; attempt++) {
        await rendered.rerender(progress(true));
        expect(announce).toHaveBeenCalledTimes(attempt);
        expect(announce.mock.lastCall?.[0]).toBe(message);
        await rendered.rerender(progress(true));
        expect(announce).toHaveBeenCalledTimes(attempt);
        await rendered.rerender(progress(false));
      }
    },
  );

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

  describe("WHEN its appearance is delayed", () => {
    it.each([{ value: 100 }, { status: "success" as const }])(
      "THEN quick completion %j stays hidden and a retry waits a full delay",
      async (completion) => {
        vi.useFakeTimers();
        try {
          const rendered = await renderWithSalt(
            <Progress label="Uploading" value={40} />,
          );
          await advanceTime(400);
          await rendered.rerender(
            <Progress label="Uploading" {...completion} />,
          );
          await advanceTime(1000);
          expect(document.querySelector('[role="progressbar"]')).toBeNull();

          await rendered.rerender(<Progress label="Uploading" value={40} />);
          await advanceTime(999);
          expect(document.querySelector('[role="progressbar"]')).toBeNull();
          await advanceTime(1);
          expect(document.querySelector('[role="progressbar"]')).not.toBeNull();

          // Once shown, the indicator remains visible across completion and retry.
          await rendered.rerender(
            <Progress label="Uploading" {...completion} />,
          );
          await rendered.rerender(<Progress label="Uploading" value={40} />);
          expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
          await rendered.unmount();
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      },
    );

    it("THEN an error reveals it immediately before the delay expires", async () => {
      vi.useFakeTimers();
      try {
        const rendered = await renderWithSalt(
          <Progress label="Uploading" value={40} />,
        );
        await advanceTime(400);
        expect(document.querySelector('[role="progressbar"]')).toBeNull();
        await rendered.rerender(
          <Progress label="Uploading" value={40} status="error" />,
        );
        expect(
          document
            .querySelector('[role="progressbar"]')
            ?.getAttribute("aria-valuetext"),
        ).toBe("40%, error");
        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it.each([
      { value: 100 },
      { status: "success" as const },
      { status: "error" as const, value: 40 },
    ])(
      "THEN an initially terminal task %j is visible immediately",
      async (props) => {
        await renderWithSalt(<Progress label="Uploading" {...props} />);
        expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
      },
    );
  });

  it("THEN the download button keeps its size and name through delayed loading and completion", async () => {
    vi.useFakeTimers();
    try {
      const { InButton } = composedStories;
      const rendered = await renderWithSalt(<InButton delay={1000} />);
      const button = page
        .getByRole("button", { name: "Download", exact: true })
        .nth(0)
        .element();
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("Download button is missing");
      }
      await document.fonts.ready;
      const bounds = () => {
        const { width, height } = button.getBoundingClientRect();
        return { width, height };
      };
      const initialBounds = bounds();

      await act(() => button.click());
      expect(button.querySelector(".saltProgress")).toBeNull();
      expect(bounds()).toEqual(initialBounds);
      await expect.element(button).toHaveAccessibleName("Download");

      await advanceTime(1000);
      expect(button.querySelector(".saltProgress")).not.toBeNull();
      expect(bounds()).toEqual(initialBounds);
      await expect.element(button).toHaveAccessibleName("Download");

      await advanceTime(4500);
      expect(button.querySelector(".saltProgress")).toBeNull();
      expect(bounds()).toEqual(initialBounds);
      await expect.element(button).toHaveAccessibleName("Download");
      expect(liveRegionText()).toContain("Download complete");
      await rendered.unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
