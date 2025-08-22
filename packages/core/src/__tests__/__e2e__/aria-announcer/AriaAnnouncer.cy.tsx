import {
  AriaAnnouncerProvider,
  DEFAULT_ANNOUNCEMENT_DURATION,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { mount } from "cypress/react18";

const BUTTON_TEXT = "CLICK ME";
const BUTTON_TEXT_WAIT = "CLICK ME AND WAIT";

const TestComponent = ({
  announcement,
  delay,
  debounce,
  duration,
  getAnnouncement,
}: {
  announcement?: string;
  delay?: number;
  duration?: number;
  debounce?: any;
  getAnnouncement?: any;
}) => {
  const { announce } = useAriaAnnouncer({ debounce });
  const getMessageToAnnounce = () =>
    getAnnouncement ? getAnnouncement() : announcement;

  return (
    <>
      <button
        onClick={() => {
          announce(getMessageToAnnounce(), { duration });
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

describe("Given useAriaAnnouncer", () => {
  it("should trigger an announcement", () => {
    mount(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test" />
      </AriaAnnouncerProvider>,
    );
    cy.findByText(BUTTON_TEXT).realClick();
    cy.get("[aria-live]").should("have.attr", "aria-live", "assertive");
    cy.get("[aria-live]").should("have.text", "test");
  });

  describe("given a legacy delay", () => {
    it("should trigger an announcement after that delay", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test" delay={500} />
        </AriaAnnouncerProvider>,
      );
      cy.findByText(BUTTON_TEXT_WAIT).realClick();
      cy.get("[aria-live]").should("not.have.text", "test");
      cy.wait(510);
      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "test");
    });
  });

  describe("given a duration", () => {
    it("should trigger an announcement which persists in the DOM for a duration", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test" duration={250} />
        </AriaAnnouncerProvider>,
      );
      cy.findByText(BUTTON_TEXT).realClick();
      cy.get("[aria-live]").should("have.text", "test");
      cy.wait(250);
      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "");
    });
  });

  describe("given a debounce", () => {
    let increment = 0;
    it("should create an announce method that triggers an announcement after that delay", () => {
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
      cy.findByText(BUTTON_TEXT).realClick().realClick().realClick();
      cy.get("[aria-live]").should("have.text", "test 3");
      cy.wait(DEFAULT_ANNOUNCEMENT_DURATION);
      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "");
    });
  });

  describe("given two queued up announcements", () => {
    it("should render the queued announcements one after the other with a delay", () => {
      let increment = 0;
      mount(
        <AriaAnnouncerProvider>
          <TestComponent
            duration={250}
            getAnnouncement={() => {
              increment++;
              return `test ${increment}`;
            }}
          />
        </AriaAnnouncerProvider>,
      );
      cy.findByText(BUTTON_TEXT).realClick().realClick();
      cy.get("[aria-live]").should("have.text", "test 1");
      cy.wait(250);
      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "");
      cy.wait(250);
      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "test 2");
    });
  });
});
