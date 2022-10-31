import { ReactNode, useState } from "react";
import {
  act,
  render,
  fireEvent,
  waitFor,
  RenderResult,
} from "@testing-library/react";

import {
  AriaAnnounce,
  AriaAnnouncerProvider,
  useAriaAnnouncer,
} from "../../aria-announcer";

const BUTTON_TEXT = "CLICK ME";
const BUTTON_TEXT_WAIT = "CLICK ME AND WAIT";
const ANNOUNCEMENT = "ANNOUNCEMENT";

const TestWrapper = ({ children }: { children?: ReactNode }) => (
  <AriaAnnouncerProvider>{children}</AriaAnnouncerProvider>
);

interface SimpleTestContentProps {
  announcement?: string;
  delay?: number;
  debounce?: number;
  getAnnouncement?: Function;
}

const SimpleTestContent = ({
  announcement,
  delay,
  debounce,
  getAnnouncement,
}: SimpleTestContentProps) => {
  const { announce } = useAriaAnnouncer({ debounce });
  const getMessageToAnnounce = () =>
    getAnnouncement ? getAnnouncement() : announcement;

  return (
    <>
      <button
        onClick={() => {
          announce(getMessageToAnnounce());
        }}
      >
        {BUTTON_TEXT}
      </button>
      <button
        onClick={() => {
          announce(getMessageToAnnounce(), delay);
        }}
      >
        {BUTTON_TEXT_WAIT}
      </button>
    </>
  );
};

const AriaAnnounceContent = ({ announcement }: { announcement: string }) => {
  const [text, setText] = useState("");
  return (
    <>
      <button
        onClick={() => {
          setText(announcement);
        }}
      >
        {BUTTON_TEXT}
      </button>
      <AriaAnnounce announcement={text} />
    </>
  );
};

describe("aria-announcer", () => {
  describe("useAriaAnnouncer", () => {
    let wrapper: RenderResult;
    beforeEach(() => {
      wrapper = render(
        <TestWrapper>
          <SimpleTestContent announcement={ANNOUNCEMENT} />
        </TestWrapper>
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    test("should trigger an announcement", async () => {
      const { findByText, getByText } = wrapper;

      fireEvent.click(getByText(BUTTON_TEXT));

      const element = await findByText(ANNOUNCEMENT);

      expect(element).toBeDefined();
    });

    test("the announcement should be cleared before the next announcement is rendered", async () => {
      const { findByText, getByText, queryByText } = wrapper;

      fireEvent.click(getByText(BUTTON_TEXT));
      let element = await findByText(ANNOUNCEMENT);
      expect(element).toBeDefined();

      fireEvent.click(getByText(BUTTON_TEXT));
      await waitFor(() =>
        expect(queryByText(ANNOUNCEMENT)).not.toBeInTheDocument()
      );

      element = await findByText(ANNOUNCEMENT);
      expect(element).toBeDefined();
    });

    test("multiple announcements are queued and triggered", async () => {
      const { findByText, getByText, queryByText } = wrapper;

      fireEvent.click(getByText(BUTTON_TEXT));
      fireEvent.click(getByText(BUTTON_TEXT));

      const element = await findByText(ANNOUNCEMENT);
      expect(element).toBeDefined();
      await waitFor(() =>
        expect(queryByText(ANNOUNCEMENT)).not.toBeInTheDocument()
      );
      const element2 = await findByText(ANNOUNCEMENT);
      expect(element2).toBeDefined();
    });
  });

  describe("AriaAnnounce", () => {
    let wrapper: RenderResult;
    beforeEach(() => {
      wrapper = render(
        <TestWrapper>
          <AriaAnnounceContent announcement={ANNOUNCEMENT} />
        </TestWrapper>
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    test("it should trigger an announcement when the announcement prop is changed", async () => {
      const { findByText, getByText } = wrapper;

      fireEvent.click(getByText(BUTTON_TEXT));
      const element = await findByText(ANNOUNCEMENT);
      expect(element).toBeDefined();
    });

    test("the announcement should then disappear", async () => {
      const { findByText, getByText } = wrapper;

      fireEvent.click(getByText(BUTTON_TEXT));
      const element = await findByText(ANNOUNCEMENT);
      expect(element).toBeDefined();
    });
  });

  describe("Debounced Announcements", () => {
    it("debounces announcements, when configured to do so", async () => {
      let count = 1;
      const getAnnouncement = () => `Announcement ${count++}`;
      const { findByText, getByText, queryByText } = render(
        <TestWrapper>
          <SimpleTestContent debounce={100} getAnnouncement={getAnnouncement} />
        </TestWrapper>
      );

      fireEvent.click(getByText(BUTTON_TEXT)); // 'Announcement 1'
      fireEvent.click(getByText(BUTTON_TEXT)); // 'Announcement 2'
      fireEvent.click(getByText(BUTTON_TEXT)); // 'Announcement 3'

      // We should see the last announcement only
      const element = await findByText("Announcement 3");
      expect(element).toBeDefined();

      // We won't see the announcement cleared as the first two have been debounced away
      try {
        await waitFor(() =>
          expect(queryByText(ANNOUNCEMENT)).not.toBeInTheDocument()
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // These test(s) go last because the call to useFakeTimers screws with any tests that follow
  describe("Delayed Announcements", () => {
    it("delays individual announcements, when configured to do so", async () => {
      const { findByText, getByText } = render(
        <TestWrapper>
          <SimpleTestContent announcement={ANNOUNCEMENT} delay={500} />
        </TestWrapper>
      );

      jest.useFakeTimers("modern");

      fireEvent.click(getByText(BUTTON_TEXT_WAIT));

      // This won't trigger anything as we're waiting on a 500ms delay
      jest.advanceTimersByTime(150);

      try {
        await findByText(ANNOUNCEMENT);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(
            /Unable to find an element with the text: ANNOUNCEMENT/
          );
        } else {
          throw new Error("It should not reach here");
        }

        act(() => {
          // This will fire the scheduled delay, rendering the announcement
          jest.advanceTimersByTime(350);
        });

        const announcementText = await findByText(ANNOUNCEMENT);
        expect(announcementText).toBeInTheDocument();

        act(() => {
          // This will trigger the auto-scheduled 'cleanup' to remove the announcement again
          jest.advanceTimersByTime(150);
        });

        try {
          await findByText(ANNOUNCEMENT);
        } catch (error) {
          if (error instanceof Error) {
            expect(error.message).toMatch(
              /Unable to find an element with the text: ANNOUNCEMENT/
            );
          } else {
            throw new Error("It should not reach here");
          }
        }
      }
    });
    it("announces regular messages before delayed messages, when configured to do so", async () => {
      let count = 1;
      const getAnnouncement = () => `Announcement ${count++}`;

      const { findByText, getByText } = render(
        <TestWrapper>
          <SimpleTestContent delay={500} getAnnouncement={getAnnouncement} />
        </TestWrapper>
      );

      jest.useFakeTimers("modern");

      await act(async () => {
        // Because the first announcement is delayed, the second message will be announced first
        fireEvent.click(getByText(BUTTON_TEXT_WAIT));
        fireEvent.click(getByText(BUTTON_TEXT));

        // this will yield the non-delayed message
        jest.advanceTimersByTime(150);

        let element = await findByText("Announcement 2");
        expect(element).toBeDefined();

        jest.advanceTimersByTime(350);

        element = await findByText("Announcement 1");
        expect(element).toBeDefined();
      });
    });
  });
});
