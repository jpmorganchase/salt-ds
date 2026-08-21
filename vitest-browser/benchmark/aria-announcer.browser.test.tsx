import {
  ANNOUNCEMENT_TIME_IN_DOM,
  type AnnounceFnOptions,
  AriaAnnouncerProvider,
  useAriaAnnouncer,
} from "@salt-ds/core";
import type { Locator } from "@vitest/browser/context";
import { useEffect, useLayoutEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const BUTTON_TEXT = "CLICK ME";
const BUTTON_TEXT_WAIT = "CLICK ME AND WAIT";
const BUTTON_TEXT_POLITE = "CLICK ME POLITE";
const BUTTON_TEXT_ASSERTIVE = "CLICK ME ASSERTIVE";
const BUTTON_TEXT_TARGETED = "CLICK ME TARGETED";
const removalWait = ANNOUNCEMENT_TIME_IN_DOM + 100;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const clickSynchronously = (locator: Locator) =>
  (locator.element() as HTMLElement).click();

function liveRegion(ariaLive: "assertive" | "polite") {
  const element = document.querySelector(`[aria-live="${ariaLive}"]`);
  if (!element) throw new Error(`Missing ${ariaLive} live region`);
  return element;
}

function targetedRegion(testId: string, ariaLive: "assertive" | "polite") {
  const element = page
    .getByTestId(testId)
    .element()
    .querySelector(`[aria-live="${ariaLive}"]`);
  if (!element) throw new Error(`Missing ${ariaLive} region in ${testId}`);
  return element;
}

async function expectText(
  readElement: () => Element,
  text: string,
  present = true,
) {
  const assertion = expect.poll(() => readElement().textContent ?? "");
  if (present) {
    await assertion.toContain(text);
  } else {
    await assertion.not.toContain(text);
  }
}

const expectLiveText = (
  ariaLive: "assertive" | "polite",
  text: string,
  present = true,
) => expectText(() => liveRegion(ariaLive), text, present);

const expectTargetedText = (
  testId: string,
  ariaLive: "assertive" | "polite",
  text: string,
  present = true,
) => expectText(() => targetedRegion(testId, ariaLive), text, present);

interface TestComponentProps {
  announcement?: string;
  ariaLive?: AnnounceFnOptions["ariaLive"];
  delay?: number;
  debounce?: number;
  getAnnouncement?: () => string;
}

function TestComponent({
  announcement,
  ariaLive,
  delay,
  debounce,
  getAnnouncement,
}: TestComponentProps) {
  const { announce } = useAriaAnnouncer({ debounce });
  const message = () => getAnnouncement?.() ?? announcement ?? "";

  return (
    <>
      <button type="button" onClick={() => announce(message(), { ariaLive })}>
        {BUTTON_TEXT}
      </button>
      <button type="button" onClick={() => announce(message(), delay)}>
        {BUTTON_TEXT_WAIT}
      </button>
      <button
        type="button"
        onClick={() => announce(message(), { ariaLive: "polite" })}
      >
        {BUTTON_TEXT_POLITE}
      </button>
      <button
        type="button"
        onClick={() => announce(message(), { ariaLive: "assertive" })}
      >
        {BUTTON_TEXT_ASSERTIVE}
      </button>
    </>
  );
}

function TargetedAnnouncementComponent() {
  const { announce } = useAriaAnnouncer();
  return (
    <button
      type="button"
      onClick={() =>
        announce("targeted announcement", { target: "inner-announcer" })
      }
    >
      {BUTTON_TEXT_TARGETED}
    </button>
  );
}

function MountTargetedAnnouncementComponent() {
  const { announce } = useAriaAnnouncer();
  useLayoutEffect(() => {
    announce("targeted on mount", { target: "inner-announcer" });
  }, [announce]);
  return <div>mount targeted announcer</div>;
}

describe("Given useAriaAnnouncer", () => {
  it("routes an announcement to a named target provider", async () => {
    await render(
      <AriaAnnouncerProvider data-testid="outer-announcer">
        <TargetedAnnouncementComponent />
        <AriaAnnouncerProvider
          data-testid="inner-announcer"
          target="inner-announcer"
        />
      </AriaAnnouncerProvider>,
    );
    await page.getByRole("button", { name: BUTTON_TEXT_TARGETED }).click();

    await expectTargetedText(
      "inner-announcer",
      "polite",
      "targeted announcement",
    );
    await expectTargetedText(
      "outer-announcer",
      "polite",
      "targeted announcement",
      false,
    );
  });

  it("routes an immediate on-mount announcement", async () => {
    await render(
      <AriaAnnouncerProvider data-testid="outer-announcer">
        <AriaAnnouncerProvider
          data-testid="inner-announcer"
          target="inner-announcer"
        />
        <MountTargetedAnnouncementComponent />
      </AriaAnnouncerProvider>,
    );

    await expectTargetedText("inner-announcer", "polite", "targeted on mount");
    await expectTargetedText(
      "outer-announcer",
      "polite",
      "targeted on mount",
      false,
    );
  });

  it("allows announcements during component cleanup", async () => {
    function CleanupAnnouncer() {
      const { announce } = useAriaAnnouncer();
      useEffect(
        () => () => announce("cleanup announcement", { ariaLive: "assertive" }),
        [announce],
      );
      return <div>cleanup announcer</div>;
    }

    function Wrapper() {
      const [show, setShow] = useState(true);
      return (
        <AriaAnnouncerProvider>
          <button type="button" onClick={() => setShow(false)}>
            unmount
          </button>
          {show ? <CleanupAnnouncer /> : null}
        </AriaAnnouncerProvider>
      );
    }

    await render(<Wrapper />);
    await page.getByRole("button", { name: "unmount" }).click();
    await expectLiveText("assertive", "cleanup announcement");
  });

  it("announces politely by default and clears the message", async () => {
    await render(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test" />
      </AriaAnnouncerProvider>,
    );
    await page.getByRole("button", { name: BUTTON_TEXT, exact: true }).click();
    await expectLiveText("polite", "test");
    await wait(removalWait);
    await expectLiveText("polite", "test", false);
  });

  it("supports a legacy delay", async () => {
    await render(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test" delay={500} />
      </AriaAnnouncerProvider>,
    );
    await page.getByRole("button", { name: BUTTON_TEXT_WAIT }).click();
    await expectLiveText("polite", "test", false);
    await expectLiveText("polite", "test");
    await wait(removalWait);
    await expectLiveText("polite", "test", false);
  });

  it.each([
    ["polite", "test polite"],
    ["assertive", "test assertive"],
  ] as const)("announces with %s urgency", async (ariaLive, announcement) => {
    await render(
      <AriaAnnouncerProvider>
        <TestComponent announcement={announcement} ariaLive={ariaLive} />
      </AriaAnnouncerProvider>,
    );
    await page.getByRole("button", { name: BUTTON_TEXT, exact: true }).click();

    await expectLiveText(ariaLive, announcement);
    const otherRegion = ariaLive === "polite" ? "assertive" : "polite";
    await expectLiveText(otherRegion, announcement, false);
    await wait(removalWait);
    await expectLiveText(ariaLive, announcement, false);
  });

  it("renders different urgencies simultaneously", async () => {
    await render(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test message" />
      </AriaAnnouncerProvider>,
    );
    clickSynchronously(page.getByRole("button", { name: BUTTON_TEXT_POLITE }));
    clickSynchronously(
      page.getByRole("button", { name: BUTTON_TEXT_ASSERTIVE }),
    );

    await expectLiveText("polite", "test message");
    await expectLiveText("assertive", "test message");
    await wait(removalWait);
    await expectLiveText("polite", "test message", false);
    await expectLiveText("assertive", "test message", false);
  });

  it("debounces to the last announcement", async () => {
    let increment = 0;
    await render(
      <AriaAnnouncerProvider>
        <TestComponent
          debounce={500}
          getAnnouncement={() => `test ${++increment}`}
        />
      </AriaAnnouncerProvider>,
    );
    const button = page.getByRole("button", {
      name: BUTTON_TEXT,
      exact: true,
    });
    clickSynchronously(button);
    clickSynchronously(button);
    clickSynchronously(button);
    await wait(600);

    await expectLiveText("polite", "test 3");
    await expectLiveText("polite", "test 1", false);
    await expectLiveText("polite", "test 2", false);
    await wait(removalWait);
    await expectLiveText("polite", "test 3", false);
  });

  it("renders queued announcements in order", async () => {
    let increment = 0;
    await render(
      <AriaAnnouncerProvider>
        <TestComponent getAnnouncement={() => `test ${++increment}`} />
      </AriaAnnouncerProvider>,
    );
    const button = page.getByRole("button", {
      name: BUTTON_TEXT,
      exact: true,
    });
    clickSynchronously(button);
    clickSynchronously(button);

    await expectLiveText("polite", "test 1");
    await expectLiveText("polite", "test 2");
    await wait(removalWait);
    await expectLiveText("polite", "test 1", false);
    await expectLiveText("polite", "test 2", false);
  });

  it("renders multiple messages in one region", async () => {
    let increment = 0;
    await render(
      <AriaAnnouncerProvider>
        <TestComponent
          ariaLive="polite"
          getAnnouncement={() => `message ${++increment}`}
        />
      </AriaAnnouncerProvider>,
    );
    const button = page.getByRole("button", {
      name: BUTTON_TEXT,
      exact: true,
    });
    clickSynchronously(button);
    await wait(50);
    clickSynchronously(button);
    await wait(50);
    clickSynchronously(button);

    for (const message of ["message 1", "message 2", "message 3"]) {
      await expectLiveText("polite", message);
    }
    await wait(removalWait);
    for (const message of ["message 1", "message 2", "message 3"]) {
      await expectLiveText("polite", message, false);
    }
  });

  it("clears timers when the provider unmounts", async () => {
    function AnnounceOnMount() {
      const { announce } = useAriaAnnouncer();
      useEffect(() => {
        announce("hello", { ariaLive: "polite" });
        announce("hello", { ariaLive: "assertive" });
      }, [announce]);
      return null;
    }

    function Wrapper() {
      const [mounted, setMounted] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setMounted(false)}>
            unmount provider
          </button>
          {mounted ? (
            <AriaAnnouncerProvider>
              <AnnounceOnMount />
            </AriaAnnouncerProvider>
          ) : null}
        </>
      );
    }

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await render(<Wrapper />);
    await expectLiveText("polite", "hello");
    await expectLiveText("assertive", "hello");
    await page.getByRole("button", { name: "unmount provider" }).click();
    await wait(removalWait);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("handles empty announcements", async () => {
    await render(
      <AriaAnnouncerProvider>
        <TestComponent announcement="" />
      </AriaAnnouncerProvider>,
    );
    await page.getByRole("button", { name: BUTTON_TEXT, exact: true }).click();
    expect(liveRegion("polite")).toBeInTheDocument();
    expect(liveRegion("assertive")).toBeInTheDocument();
  });

  it("handles rapid clicks without debounce", async () => {
    let increment = 0;
    await render(
      <AriaAnnouncerProvider>
        <TestComponent getAnnouncement={() => `test ${++increment}`} />
      </AriaAnnouncerProvider>,
    );
    const button = page.getByRole("button", {
      name: BUTTON_TEXT,
      exact: true,
    });
    clickSynchronously(button);
    clickSynchronously(button);
    clickSynchronously(button);
    for (const message of ["test 1", "test 2", "test 3"]) {
      await expectLiveText("polite", message);
    }
  });

  it("clears urgency regions independently", async () => {
    await render(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test message" />
      </AriaAnnouncerProvider>,
    );
    clickSynchronously(page.getByRole("button", { name: BUTTON_TEXT_POLITE }));
    await expectLiveText("polite", "test message");
    await wait(ANNOUNCEMENT_TIME_IN_DOM / 2);
    clickSynchronously(
      page.getByRole("button", { name: BUTTON_TEXT_ASSERTIVE }),
    );
    await expectLiveText("assertive", "test message");

    await wait(ANNOUNCEMENT_TIME_IN_DOM / 2 + 100);
    await expectLiveText("polite", "test message", false);
    await expectLiveText("assertive", "test message");
    await wait(ANNOUNCEMENT_TIME_IN_DOM / 2 + 100);
    await expectLiveText("assertive", "test message", false);
  });
});
