import {
  AriaAnnounce,
  AriaAnnouncerProvider,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { mount } from "cypress/react18";
import { type ReactNode, useState } from "react";

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
  getAnnouncement?: () => string;
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
          const message = getMessageToAnnounce();
          if (message != null) announce(message);
        }}
      >
        {BUTTON_TEXT}
      </button>
      <button
        onClick={() => {
          const message = getMessageToAnnounce();
          if (message != null) announce(message, delay);
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
    it("should trigger an announcement", () => {
      mount(
        <TestWrapper>
          <SimpleTestContent announcement={ANNOUNCEMENT} />
        </TestWrapper>,
      );

      cy.findByText(BUTTON_TEXT).realClick();
      cy.findByText(ANNOUNCEMENT).should("exist");
    });

    it("multiple announcements are queued and triggered", () => {
      let count = 1;
      const getAnnouncement = () => `Announcement ${count++}`;
      mount(
        <TestWrapper>
          <SimpleTestContent getAnnouncement={getAnnouncement} />
        </TestWrapper>,
      );

      cy.findByText(BUTTON_TEXT).realClick();
      cy.findByText(BUTTON_TEXT).realClick();

      cy.findByText("Announcement 1").should("exist");
      cy.findByText("Announcement 1").should("not.exist");
      cy.findByText("Announcement 2").should("exist");
    });
  });

  describe("AriaAnnounce", () => {
    it("it should trigger an announcement when the announcement prop is changed and disappear", () => {
      mount(
        <TestWrapper>
          <AriaAnnounceContent announcement={ANNOUNCEMENT} />
        </TestWrapper>,
      );

      cy.findByText(ANNOUNCEMENT).should("not.exist");
      cy.findByText(BUTTON_TEXT).realClick();
      cy.findByText(ANNOUNCEMENT).should("exist");
      cy.findByText(ANNOUNCEMENT).should("not.exist");
    });
  });

  describe("Debounced Announcements", () => {
    it("debounces announcements, when configured to do so", () => {
      let count = 1;
      const getAnnouncement = () => `Announcement ${count++}`;
      mount(
        <TestWrapper>
          <SimpleTestContent debounce={100} getAnnouncement={getAnnouncement} />
        </TestWrapper>,
      );

      cy.findByText(BUTTON_TEXT).realClick(); // 'Announcement 1'
      cy.findByText(BUTTON_TEXT).realClick(); // 'Announcement 2'
      cy.findByText(BUTTON_TEXT).realClick(); // 'Announcement 3'

      // We should see the last announcement only
      cy.findByText("Announcement 3").should("exist");
    });
  });

  describe("Delayed Announcements", () => {
    it("delays individual announcements, when configured to do so", () => {
      mount(
        <TestWrapper>
          <SimpleTestContent announcement={ANNOUNCEMENT} delay={500} />
        </TestWrapper>,
      );

      cy.clock();

      cy.findByText(BUTTON_TEXT_WAIT).realClick();

      // This won't trigger anything as we're waiting on a 500ms delay
      cy.tick(150);

      cy.findByText(ANNOUNCEMENT).should("not.exist");

      // This will fire the scheduled delay, rendering the announcement
      cy.tick(400);

      cy.findByText(ANNOUNCEMENT).should("exist");
      // This will trigger the auto-scheduled 'cleanup' to remove the announcement again
      cy.tick(200);

      cy.findByText(ANNOUNCEMENT).should("not.exist");
    });
    it("announces regular messages before delayed messages, when configured to do so", () => {
      let count = 1;
      const getAnnouncement = () => `Announcement ${count++}`;
      mount(
        <TestWrapper>
          <SimpleTestContent delay={500} getAnnouncement={getAnnouncement} />
        </TestWrapper>,
      );

      // Because the first announcement is delayed, the second message will be announced first
      cy.findByText(BUTTON_TEXT_WAIT).realClick();
      cy.findByText(BUTTON_TEXT).realClick();

      cy.findByText("Announcement 2").should("exist");

      cy.findByText("Announcement 1").should("exist");
    });
  });
});
