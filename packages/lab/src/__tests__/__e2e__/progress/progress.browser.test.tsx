import { AriaAnnouncerContext } from "@salt-ds/core";
import { Progress, type ProgressProps, type ProgressShape } from "@salt-ds/lab";
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

function createAnnouncementFixture() {
  const announce = vi.fn();
  const announcer = { announce };
  const progress = (
    props: Pick<
      ProgressProps,
      "value" | "status" | "disableAnnouncer" | "delay"
    >,
  ) => (
    <AriaAnnouncerContext.Provider value={announcer}>
      <Progress label="Uploading" {...props} />
    </AriaAnnouncerContext.Provider>
  );
  return { announce, progress };
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

    it("THEN it shows the value text on linear, medium and large progress", async () => {
      await renderWithSalt(
        <>
          <Progress delay={0} label="Uploading" value={38} />
          <Progress delay={0} shape="circular" label="Saving" value={42} />
          <Progress
            delay={0}
            shape="circular"
            size="large"
            aria-label="Loading"
            value={46}
          />
        </>,
      );

      await expect.element(page.getByText("38%")).toBeVisible();
      await expect.element(page.getByText("42%")).toBeVisible();
      await expect.element(page.getByText("46%")).toBeVisible();
    });

    it("THEN it never shows the value text WHEN it's small and circular", async () => {
      await renderWithSalt(
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

      // @ts-expect-error: the value can't be hidden or shown
      const withHideValue = <Progress hideValue={false} />;
      expect(withHideValue).toBeDefined();
    });

    it("THEN a linear bar stays visible while its value shrinks to zero", async () => {
      const rendered = await renderWithSalt(
        <div style={{ width: 200 }}>
          <Progress delay={0} label="Uploading" value={60} />
        </div>,
      );
      const bar = document.querySelector<HTMLElement>(".saltProgress-bar");
      const indicator = document.querySelector<HTMLElement>(
        ".saltProgress-indicator",
      );
      if (!bar || !indicator) throw new Error("Progress bar is missing");
      indicator.style.transitionDuration = "10s";
      const initialWidth = bar.getBoundingClientRect().width;

      await rendered.rerender(
        <div style={{ width: 200 }}>
          <Progress delay={0} label="Uploading" value={0} />
        </div>,
      );
      // The fraction animates, and the bar's width follows it
      const transition = indicator
        .getAnimations()
        .find(
          (animation) =>
            (animation as CSSTransition).transitionProperty ===
            "--saltProgress-fraction",
        );
      if (!transition?.effect) {
        throw new Error("Fraction transition is missing");
      }
      transition.pause();
      transition.currentTime =
        Number(transition.effect.getComputedTiming().duration) / 2;

      expect(bar.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(bar.getBoundingClientRect().width).toBeLessThan(initialWidth);
      expect(getComputedStyle(bar).visibility).toBe("visible");
    });
  });

  describe("WHEN it has a buffer value", () => {
    // How far along the track the buffer's outline ends
    function outlineEnd() {
      const buffer = document.querySelector(".saltProgress-buffer");
      const indicator = document.querySelector(".saltProgress-indicator");
      return buffer && indicator
        ? Number.parseFloat(getComputedStyle(buffer, "::before").width) /
            indicator.getBoundingClientRect().width
        : null;
    }

    it("THEN it outlines the buffer in the bar color and fills it with the primary background", async () => {
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

      await expect.poll(outlineEnd).toBeCloseTo(0.6, 2);

      const progress = document.querySelector(".saltProgress");
      const buffer = document.querySelector(".saltProgress-buffer");
      const bar = document.querySelector(".saltProgress-bar");
      if (!progress || !buffer || !bar) {
        throw new Error("Progress buffer is missing");
      }
      const outline = getComputedStyle(buffer, "::before");
      expect(outline.borderTopColor).toBe(
        getComputedStyle(bar).backgroundColor,
      );
      const primary = document.createElement("div");
      primary.style.background = "var(--salt-container-primary-background)";
      progress.append(primary);
      expect(outline.backgroundColor).toBe(
        getComputedStyle(primary).backgroundColor,
      );
      primary.remove();
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

      await expect.poll(outlineEnd).toBeCloseTo(0.6, 2);
    });

    it("THEN the track runs behind the bar, with no gap", async () => {
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

      const track = document.querySelector(".saltProgress-track");
      const indicator = document.querySelector(".saltProgress-indicator");
      if (!track || !indicator) throw new Error("Progress track is missing");
      expect(getComputedStyle(track).maskImage).toBe("none");
      expect(track.getBoundingClientRect().width).toBe(
        indicator.getBoundingClientRect().width,
      );
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
      await renderWithSalt(
        <Progress label="Loading accounts" status="active" />,
      );
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
        <Progress delay={0} label="Uploading" status="paused" />,
      );
      await rendered.rerender(
        <Progress delay={0} label="Uploading" value={50} status="paused" />,
      );

      await expect.poll(loop, { timeout: 300 }).toBeNull();
    });
  });

  describe.each(["linear", "circular"] as const)(
    "WHEN %s progress is waiting for its loop to finish",
    (shape) => {
      it.each([{ status: "paused" as const }, { status: "error" as const }])(
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
              indicator.style.getPropertyValue("--saltProgress-fraction"),
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
      <Progress label="Uploading" value={40} max={200} status="success" />,
    );

    await expect.element(page.getByText("100%")).not.toBeInTheDocument();
    await expect
      .element(page.getByRole("img", { name: "success" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("progressbar"))
      .toHaveAttribute("aria-valuetext", "100%, success");
    await expect
      .element(page.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "200");
  });

  it("THEN it shows that it's paused", async () => {
    await renderWithSalt(
      <Progress label="Uploading" value={60} status="paused" />,
    );

    await expect.element(page.getByText("Paused")).toBeInTheDocument();
    await expect.element(page.getByText("60%")).toBeInTheDocument();
    expect(document.querySelector(".saltProgress-statusIcon")).toBeNull();
  });

  describe.each(["linear", "circular"] as const)("WHEN it's %s", (shape) => {
    it.each([
      [{ status: "success" as const }, "100%, success"],
      [{ status: "error" as const, value: 60 }, "60%, error"],
      [{ status: "paused" as const, value: 60 }, "60%, paused"],
    ])("THEN it includes the state in its value text", async (props, text) => {
      await renderWithSalt(
        <Progress delay={0} shape={shape} label="Uploading" {...props} />,
      );

      await expect
        .element(page.getByRole("progressbar"))
        .toHaveAttribute("aria-valuetext", text);
    });

    it("THEN paused indeterminate progress freezes its loop without a value or status icon", async () => {
      await renderWithSalt(
        <Progress shape={shape} label="Uploading" status="paused" />,
      );
      const progressbar = page.getByRole("progressbar", { name: "Uploading" });
      await expect.element(progressbar).not.toHaveAttribute("aria-valuenow");
      await expect
        .element(progressbar)
        .toHaveAttribute("aria-valuetext", "paused");
      await expect.element(page.getByText("Paused")).toBeInTheDocument();
      expect(document.querySelector(".saltProgress-statusIcon")).toBeNull();
      const loop = document.querySelector(
        shape === "linear"
          ? ".saltProgress-loop"
          : ".saltProgress-indeterminate",
      );
      if (!loop) throw new Error("Indeterminate loop is missing");
      expect(getComputedStyle(loop).animationPlayState).toBe("paused");
      expect(liveRegionText()).not.toContain("Uploading");
    });
  });

  it("THEN reaching max stays active and completion is announced only for success", async () => {
    const { announce, progress } = createAnnouncementFixture();
    const rendered = await renderWithSalt(progress({ value: 10 }));
    await rendered.rerender(progress({ value: 55 }));
    await expect
      .element(page.getByRole("progressbar"))
      .toHaveAttribute("aria-valuetext", "55%");
    expect(announce).not.toHaveBeenCalled();

    await rendered.rerender(progress({ value: 100 }));
    await expect
      .element(page.getByRole("progressbar"))
      .toHaveAttribute("aria-valuetext", "100%");
    await expect.element(page.getByText("100%")).toBeInTheDocument();
    expect(document.querySelector(".saltProgress-statusIcon")).toBeNull();
    expect(announce).not.toHaveBeenCalled();

    await rendered.rerender(progress({ value: 100, status: "success" }));
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce.mock.lastCall?.[0]).toBe("finished Uploading");
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
            status={finished ? status : "active"}
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

  describe("WHEN automatic announcements are disabled", () => {
    it("THEN loading, repeats and outcomes stay silent while progress semantics remain available", async () => {
      vi.useFakeTimers();
      try {
        const { announce, progress } = createAnnouncementFixture();
        const rendered = await renderWithSalt(
          progress({ disableAnnouncer: true }),
        );
        const progressbar = page.getByRole("progressbar", {
          name: "Uploading",
        });
        await expect.element(progressbar).not.toHaveAttribute("aria-valuenow");
        await expect.element(progressbar).not.toHaveAttribute("aria-valuetext");
        await advanceTime(30_000);
        expect(announce).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);

        for (const [status, value, text] of [
          ["active", "40", "40%"],
          ["error", "40", "40%, error"],
          ["success", "100", "100%, success"],
        ] as const) {
          await rendered.rerender(
            progress({ value: 40, status, disableAnnouncer: true }),
          );
          await expect
            .element(progressbar)
            .toHaveAttribute("aria-valuenow", value);
          await expect
            .element(progressbar)
            .toHaveAttribute("aria-valuetext", text);
          expect(announce).not.toHaveBeenCalled();
        }
        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it("THEN toggling suppression stops repeat timers and active announcements can resume", async () => {
      vi.useFakeTimers();
      try {
        const { announce, progress } = createAnnouncementFixture();
        const rendered = await renderWithSalt(
          progress({ disableAnnouncer: true }),
        );
        await rendered.rerender(progress({ disableAnnouncer: false }));
        expect(announce).toHaveBeenCalledTimes(1);
        await advanceTime(5000);
        expect(announce).toHaveBeenCalledTimes(2);

        await rendered.rerender(progress({ disableAnnouncer: true }));
        expect(vi.getTimerCount()).toBe(0);
        await advanceTime(30_000);
        expect(announce).toHaveBeenCalledTimes(2);

        await rendered.rerender(progress({ disableAnnouncer: false }));
        expect(announce).toHaveBeenCalledTimes(3);
        await advanceTime(5000);
        expect(announce).toHaveBeenCalledTimes(4);
        expect(announce.mock.lastCall?.[0]).toBe("Uploading");
        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
        expect(announce).toHaveBeenCalledTimes(4);
      } finally {
        vi.useRealTimers();
      }
    });

    it.each(["success", "error"] as const)(
      "THEN a suppressed %s is not replayed, but returning to active permits a new outcome announcement",
      async (status) => {
        vi.useFakeTimers();
        try {
          const { announce, progress } = createAnnouncementFixture();
          const rendered = await renderWithSalt(
            progress({
              value: 40,
              status: "active",
              delay: 1000,
              disableAnnouncer: true,
            }),
          );
          await rendered.rerender(
            progress({
              value: 40,
              status,
              delay: 1000,
              disableAnnouncer: true,
            }),
          );
          if (status === "success") {
            expect(document.querySelector('[role="progressbar"]')).toBeNull();
          }
          expect(announce).not.toHaveBeenCalled();

          // Revealing a previously hidden outcome must not replay it when suppression ends.
          await rendered.rerender(
            progress({ value: 40, status, delay: 0, disableAnnouncer: false }),
          );
          expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
          expect(announce).not.toHaveBeenCalled();

          await rendered.rerender(
            progress({ value: 40, status: "active", disableAnnouncer: true }),
          );
          await rendered.rerender(
            progress({ value: 40, status, disableAnnouncer: false }),
          );
          expect(announce).toHaveBeenCalledTimes(1);
          expect(announce.mock.lastCall?.[0]).toBe(
            status === "success" ? "finished Uploading" : "Uploading, error",
          );
          await rendered.unmount();
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      },
    );
  });

  it("THEN it enforces shape-specific props and the status API", () => {
    // @ts-expect-error: size is only for circular progress
    const linearWithSize = <Progress size="large" />;
    // @ts-expect-error: bufferValue is only for linear progress
    const circularWithBuffer = <Progress shape="circular" bufferValue={60} />;
    // @ts-expect-error: pausing is expressed through status, not a separate flag
    const legacyPaused = <Progress paused />;

    expect([linearWithSize, circularWithBuffer, legacyPaused]).toHaveLength(3);
  });

  it.each([undefined, "active"] as const)(
    "THEN status %s is visible immediately without a status icon or empty header",
    async (status) => {
      await renderWithSalt(
        <Progress
          shape="circular"
          size="small"
          aria-label="Uploading"
          value={38}
          status={status}
        />,
      );
      expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
      const progressbar = page.getByRole("progressbar", { name: "Uploading" });
      await expect
        .element(progressbar)
        .toHaveAttribute("aria-valuetext", "38%");
      expect(document.querySelector(".saltProgress-statusIcon")).toBeNull();
      expect(document.querySelector(".saltProgress-header")).toBeNull();
    },
  );

  describe("WHEN its appearance is delayed", () => {
    it("THEN quick success stays hidden and a retry waits a full delay", async () => {
      vi.useFakeTimers();
      try {
        const rendered = await renderWithSalt(
          <Progress delay={1000} label="Uploading" value={40} />,
        );
        await advanceTime(400);
        await rendered.rerender(
          <Progress delay={1000} label="Uploading" status="success" />,
        );
        await advanceTime(1000);
        expect(document.querySelector('[role="progressbar"]')).toBeNull();

        await rendered.rerender(
          <Progress
            delay={1000}
            label="Uploading"
            value={40}
            status="active"
          />,
        );
        await advanceTime(999);
        expect(document.querySelector('[role="progressbar"]')).toBeNull();
        await advanceTime(1);
        expect(document.querySelector('[role="progressbar"]')).not.toBeNull();

        // Once shown, the indicator remains visible across completion and retry.
        await rendered.rerender(
          <Progress delay={1000} label="Uploading" status="success" />,
        );
        await rendered.rerender(
          <Progress
            delay={1000}
            label="Uploading"
            value={40}
            status="active"
          />,
        );
        expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it.each([40, 100])(
      "THEN active progress starting at %i still appears on schedule when its value reaches max",
      async (initialValue) => {
        vi.useFakeTimers();
        try {
          const rendered = await renderWithSalt(
            <Progress delay={1000} label="Uploading" value={initialValue} />,
          );
          expect(document.querySelector('[role="progressbar"]')).toBeNull();
          await advanceTime(400);
          await rendered.rerender(
            <Progress
              delay={1000}
              label="Uploading"
              value={100}
              status="active"
            />,
          );
          await advanceTime(599);
          expect(document.querySelector('[role="progressbar"]')).toBeNull();
          await advanceTime(1);
          expect(
            document
              .querySelector('[role="progressbar"]')
              ?.getAttribute("aria-valuetext"),
          ).toBe("100%");
          expect(liveRegionText()).not.toContain("finished");
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
          <Progress delay={1000} label="Uploading" value={40} />,
        );
        await advanceTime(400);
        expect(document.querySelector('[role="progressbar"]')).toBeNull();
        await rendered.rerender(
          <Progress delay={1000} label="Uploading" value={40} status="error" />,
        );
        expect(
          document
            .querySelector('[role="progressbar"]')
            ?.getAttribute("aria-valuetext"),
        ).toBe("40%, error");
        expect(liveRegionText()).toContain("Uploading, error");
        await rendered.unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it.each([
      { status: "success" as const },
      { status: "error" as const, value: 40 },
    ])(
      "THEN an initially terminal task %j is visible immediately",
      async (props) => {
        await renderWithSalt(
          <Progress delay={1000} label="Uploading" {...props} />,
        );
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
      expect(liveRegionText()).toContain("Downloading");

      await advanceTime(1000);
      expect(button.querySelector(".saltProgress")).not.toBeNull();
      expect(bounds()).toEqual(initialBounds);
      await expect.element(button).toHaveAccessibleName("Download");
      expect(liveRegionText()).not.toContain("Downloading");

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
