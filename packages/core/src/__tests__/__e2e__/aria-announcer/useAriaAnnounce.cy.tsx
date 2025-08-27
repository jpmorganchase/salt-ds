import {
  AriaAnnounce,
  AriaAnnouncerProvider,
  DEFAULT_ANNOUNCEMENT_DURATION,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { mount } from "cypress/react18";
import { type ReactNode, useState } from "react";

const BUTTON_LEGACY_TEXT = "LEGACY";
const BUTTON_TEXT = "CLICK ME";
const ANNOUNCEMENT = "ANNOUNCEMENT";

const TestWrapper = ({ children }: { children?: ReactNode }) => (
  <AriaAnnouncerProvider>{children}</AriaAnnouncerProvider>
);

interface SimpleTestContentProps {
  announcement?: string;
  delay?: number;
  debounce?: number;
  duration?: number;
  getAnnouncement?: () => string;
}

const SimpleTestContent = ({
  announcement,
  delay,
  debounce,
  duration,
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
          if (message != null) announce(message, { duration });
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
        {BUTTON_LEGACY_TEXT}
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

      cy.findByText(BUTTON_TEXT).realClick().realClick();
      cy.findByText("Announcement 1").should("exist");
      cy.wait(DEFAULT_ANNOUNCEMENT_DURATION);
      cy.findByText("Announcement 1").should("not.exist");
      cy.wait(DEFAULT_ANNOUNCEMENT_DURATION);
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

      cy.findByText(BUTTON_TEXT).realClick().realClick().realClick();
      cy.get("[aria-live]").should("have.text", "Announcement 3");
      cy.wait(DEFAULT_ANNOUNCEMENT_DURATION);
      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "");
    });
  });

  describe("Delayed Announcements", () => {
    it("legacy API, delays individual announcements, when configured to do so", () => {
      mount(
        <TestWrapper>
          <SimpleTestContent announcement={ANNOUNCEMENT} delay={250} />
        </TestWrapper>,
      );

      cy.findByText(BUTTON_LEGACY_TEXT).realClick();
      cy.findByText(ANNOUNCEMENT).should("exist");
      cy.wait(250);
      cy.findByText(ANNOUNCEMENT).should("not.exist");
    });
  });
});
