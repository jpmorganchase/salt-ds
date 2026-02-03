import {
  ANNOUNCEMENT_TIME_IN_DOM,
  type AnnounceFnOptions,
  AriaAnnouncerProvider,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { mount } from "cypress/react";

const BUTTON_TEXT = "CLICK ME";
const BUTTON_TEXT_WAIT = "CLICK ME AND WAIT";
const BUTTON_TEXT_POLITE = "CLICK ME POLITE";
const BUTTON_TEXT_ASSERTIVE = "CLICK ME ASSERTIVE";

const TestComponent = ({
  announcement,
  ariaLive,
  delay,
  debounce,
  getAnnouncement,
}: {
  announcement?: string;
  ariaLive?: AnnounceFnOptions["ariaLive"];
  delay?: number;
  debounce?: number;
  getAnnouncement?: () => string;
}) => {
  const { announce } = useAriaAnnouncer({ debounce });
  const getMessageToAnnounce = (): string =>
    getAnnouncement ? getAnnouncement() : (announcement ?? "");

  return (
    <>
      <button
        onClick={() => {
          announce(getMessageToAnnounce(), { ariaLive });
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
      <button
        onClick={() => {
          announce(getMessageToAnnounce(), { ariaLive: "polite" });
        }}
      >
        {BUTTON_TEXT_POLITE}
      </button>
      <button
        onClick={() => {
          announce(getMessageToAnnounce(), { ariaLive: "assertive" });
        }}
      >
        {BUTTON_TEXT_ASSERTIVE}
      </button>
    </>
  );
};

describe("Given useAriaAnnouncer", () => {
  it("should trigger an announcement in the polite region by default", () => {
    mount(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test" />
      </AriaAnnouncerProvider>,
    );

    cy.findByText(BUTTON_TEXT).should("exist").should("be.visible").realClick();

    // Verify announcement appears in polite region
    cy.get('[role="log"][aria-live="polite"]')
      .should("exist")
      .should("contain.text", "test");

    // Wait for announcement to be cleared
    cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
    cy.get('[role="log"][aria-live="polite"]').should(
      "not.contain.text",
      "test",
    );
  });

  describe("given a legacy delay", () => {
    it("should trigger an announcement after that delay", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test" delay={500} />
        </AriaAnnouncerProvider>,
      );
      cy.findByText(BUTTON_TEXT_WAIT).click();

      cy.get("[aria-live]").should("not.have.text", "test");

      cy.wait(510);

      // Verify announcement is not present immediately
      cy.get('[role="log"]').should("not.contain.text", "test");

      // Wait for delay and verify announcement appears
      cy.get('[role="log"][aria-live="polite"]', { timeout: 1000 }).should(
        "contain.text",
        "test",
      );

      // Wait for announcement to be cleared
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test",
      );
    });
  });

  describe("given an ariaLive", () => {
    it("should trigger an announcement with polite urgency", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test polite" ariaLive="polite" />
        </AriaAnnouncerProvider>,
      );

      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick();

      // Verify announcement appears in polite region
      cy.get('[role="log"][aria-live="polite"]')
        .should("exist")
        .should("contain.text", "test polite");

      // Verify it's NOT in assertive region
      cy.get('[role="log"][aria-live="assertive"]').should(
        "not.contain.text",
        "test polite",
      );

      // Wait for announcement to be cleared
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test polite",
      );
    });

    it("should trigger an announcement with assertive urgency", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test assertive" ariaLive="assertive" />
        </AriaAnnouncerProvider>,
      );

      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick();

      // Verify announcement appears in assertive region
      cy.get('[role="log"][aria-live="assertive"]')
        .should("exist")
        .should("contain.text", "test assertive");

      // Verify it's NOT in polite region
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test assertive",
      );

      // Wait for announcement to be cleared
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="assertive"]').should(
        "not.contain.text",
        "test assertive",
      );
    });
  });

  describe("given multiple announcements with different urgencies", () => {
    it("should render announcements in their respective regions simultaneously", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test message" />
        </AriaAnnouncerProvider>,
      );

      // Click polite button
      cy.findByText(BUTTON_TEXT_POLITE)
        .should("exist")
        .should("be.visible")
        .realClick();

      // Click assertive button
      cy.findByText(BUTTON_TEXT_ASSERTIVE)
        .should("exist")
        .should("be.visible")
        .realClick();

      // Both announcements should be present in their respective regions
      cy.get('[role="log"][aria-live="polite"]').should(
        "contain.text",
        "test message",
      );
      cy.get('[role="log"][aria-live="assertive"]').should(
        "contain.text",
        "test message",
      );

      // Wait for announcements to be cleared
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test message",
      );
      cy.get('[role="log"][aria-live="assertive"]').should(
        "not.contain.text",
        "test message",
      );
    });
  });

  describe("given a debounce", () => {
    it("should create an announce method that triggers only the last announcement after debounce delay", () => {
      let increment = 0;

      mount(
        <AriaAnnouncerProvider>
          <TestComponent
            debounce={500}
            getAnnouncement={() => {
              increment++;
              return `test ${increment}`;
            }}
          />
        </AriaAnnouncerProvider>,
      );

      // Click three times rapidly
      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick()
        .realClick()
        .realClick();

      // Wait for debounce to settle
      cy.wait(600);

      // Should only show the last announcement (test 3)
      cy.get('[role="log"][aria-live="polite"]', { timeout: 1000 }).should(
        "contain.text",
        "test 3",
      );

      // Should NOT contain earlier announcements
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test 1",
      );
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test 2",
      );

      // Wait for announcement to be removed
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test 3",
      );
    });
  });

  describe("given two queued up announcements", () => {
    it("should render the queued announcements one after the other with a delay", () => {
      let increment = 0;

      mount(
        <AriaAnnouncerProvider>
          <TestComponent
            getAnnouncement={() => {
              increment++;
              return `test ${increment}`;
            }}
          />
        </AriaAnnouncerProvider>,
      );

      // Click twice to queue two announcements
      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick()
        .realClick();

      // First announcement should appear
      cy.get('[role="log"][aria-live="polite"]', { timeout: 1000 }).should(
        "contain.text",
        "test 1",
      );
      // Second announcement should appear
      cy.get('[role="log"][aria-live="polite"]', {
        timeout: ANNOUNCEMENT_TIME_IN_DOM + 100,
      }).should("contain.text", "test 2");

      // Wait for announcement(s) to be removed
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test 1",
      );
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test 2",
      );
    });
  });

  describe("given multiple announcements in the same region", () => {
    it("should render multiple messages simultaneously in the same region", () => {
      let increment = 0;

      mount(
        <AriaAnnouncerProvider>
          <TestComponent
            ariaLive="polite"
            getAnnouncement={() => {
              increment++;
              return `message ${increment}`;
            }}
          />
        </AriaAnnouncerProvider>,
      );

      // Click multiple times rapidly (before ANNOUNCEMENT_TIME_IN_DOM)
      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick();

      cy.wait(50); // Small delay to ensure separate announcements

      cy.findByText(BUTTON_TEXT).realClick();

      cy.wait(50);

      cy.findByText(BUTTON_TEXT).realClick();

      // All messages should be present in the polite region
      cy.get('[role="log"][aria-live="polite"]')
        .should("contain.text", "message 1")
        .should("contain.text", "message 2")
        .should("contain.text", "message 3");

      // Wait for all announcements to be cleared
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM + 100);
      cy.get('[role="log"][aria-live="polite"]')
        .should("not.contain.text", "message 1")
        .should("not.contain.text", "message 2")
        .should("not.contain.text", "message 3");
    });
  });

  describe("edge cases", () => {
    it("should handle empty announcements gracefully", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="" />
        </AriaAnnouncerProvider>,
      );

      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick();

      // Both regions should exist but may be empty
      cy.get('[role="log"][aria-live="polite"]').should("exist");
      cy.get('[role="log"][aria-live="assertive"]').should("exist");
    });

    it("should handle rapid clicks without debounce", () => {
      let increment = 0;

      mount(
        <AriaAnnouncerProvider>
          <TestComponent
            getAnnouncement={() => {
              increment++;
              return `test ${increment}`;
            }}
          />
        </AriaAnnouncerProvider>,
      );

      cy.findByText(BUTTON_TEXT)
        .should("exist")
        .should("be.visible")
        .realClick()
        .realClick()
        .realClick();

      // All announcements should be queued in assertive region
      cy.get('[role="log"][aria-live="polite"]', { timeout: 1000 })
        .should("contain.text", "test 1")
        .should("contain.text", "test 2")
        .should("contain.text", "test 3");
    });

    it("should clear announcements independently in each region", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test message" />
        </AriaAnnouncerProvider>,
      );

      // Add announcement to polite region
      cy.findByText(BUTTON_TEXT_POLITE)
        .should("exist")
        .should("be.visible")
        .realClick();

      cy.get('[role="log"][aria-live="polite"]').should(
        "contain.text",
        "test message",
      );

      // Wait half the announcement time
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM / 2);

      // Add announcement to assertive region
      cy.findByText(BUTTON_TEXT_ASSERTIVE)
        .should("exist")
        .should("be.visible")
        .realClick();

      cy.get('[role="log"][aria-live="assertive"]').should(
        "contain.text",
        "test message",
      );

      // Wait for polite announcement to clear
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM / 2 + 100);
      cy.get('[role="log"][aria-live="polite"]').should(
        "not.contain.text",
        "test message",
      );

      // Assertive should still be present
      cy.get('[role="log"][aria-live="assertive"]').should(
        "contain.text",
        "test message",
      );

      // Wait for assertive to clear
      cy.wait(ANNOUNCEMENT_TIME_IN_DOM / 2 + 100);
      cy.get('[role="log"][aria-live="assertive"]').should(
        "not.contain.text",
        "test message",
      );
    });
  });
});
