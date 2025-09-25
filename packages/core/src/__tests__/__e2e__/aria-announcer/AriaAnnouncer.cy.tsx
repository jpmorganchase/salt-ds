import {
  ARIA_ANNOUNCE_DELAY,
  AriaAnnouncerProvider,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { mount } from "cypress/react18";

const BUTTON_TEXT = "CLICK ME";
const BUTTON_TEXT_WAIT = "CLICK ME AND WAIT";

const TestComponent = ({
  announcement,
  delay,
  debounce,
  getAnnouncement,
}: {
  delay?: number;
  debounce?: number;
} & (
    | { announcement?: never; getAnnouncement: () => string }
    | { announcement: string; getAnnouncement?: never }
  )) => {
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

describe("Given a AriaAnnouncerProvider", () => {
  it("should not affect the document flow", () => {
    mount(
      <div style={{ height: "100%", width: "100%" }}>
        <AriaAnnouncerProvider>
          <div style={{ height: "100%", width: "100%" }} />
        </AriaAnnouncerProvider>
      </div>,
    );

    cy.document().then((doc) => {
      const style = doc.createElement("style");
      style.innerHTML = `
                body, html {
                    height: 100%;
                    display: block;
                    min-height: auto;
                }
                [data-cy-root] {
                    height: 100%;
                }
            `;
      doc.head.appendChild(style);
      const documentHeight = doc.documentElement.getBoundingClientRect().height;
      const documentScrollHeight = document.documentElement.scrollHeight;
      expect(documentHeight).to.equal(documentScrollHeight);
      doc.head.removeChild(style);
    });
  });
  it.skip("should allow for style overrides on the [aria-live] element", () => {
    mount(<AriaAnnouncerProvider style={{ borderWidth: 1 }} />);

    // TODO: figure out why this doesn't work
    cy.get("[aria-live]").should("have.css", "border-width", "1px");
  });
});

describe("Given useAriaAnnouncer", () => {
  it("should trigger an announcement", () => {
    mount(
      <AriaAnnouncerProvider>
        <TestComponent announcement="test" />
      </AriaAnnouncerProvider>,
    );
    cy.findByText(BUTTON_TEXT).click();

    cy.get("[aria-live]").should("have.text", "test");
  });

  describe("given a delay", () => {
    it("should trigger an announcement after that delay", () => {
      mount(
        <AriaAnnouncerProvider >
          <TestComponent announcement="test" delay={500} />
        </AriaAnnouncerProvider>,
      );
      cy.findByText(BUTTON_TEXT_WAIT).click();

      cy.get("[aria-live]").should("not.have.text", "test");

      cy.wait(510);

      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "test");
    });
  });

  describe("given a debounce", () => {
    it("should create an announce method that triggers an announcement after that delay", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test" debounce={500} />
        </AriaAnnouncerProvider>,
      );
      cy.findByText(BUTTON_TEXT).click();

      cy.get("[aria-live]").should("not.have.text", "test");

      cy.wait(510);

      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "test");
    });
  });

  describe("given two queued up announcements", () => {
    it(`should render the queued announcements one after the other with a ${ARIA_ANNOUNCE_DELAY}ms delay`, () => {
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
      cy.findByText(BUTTON_TEXT).click().click();

      cy.get("[aria-live]").should("have.text", "test 1");

      cy.wait(ARIA_ANNOUNCE_DELAY);

      cy.get("[aria-live]", { timeout: 0 }).should("have.text", "test 2");
    });
  });
  describe("AriaAnnouncerProvider ariaAnnounce prop", () => {
    it("should set aria-live to 'assertive' by default", () => {
      mount(
        <AriaAnnouncerProvider>
          <TestComponent announcement="test" />
        </AriaAnnouncerProvider>
      );

      cy.get("[aria-live]").should("have.attr", "aria-live", "assertive");
    });

    it("should set aria-live to 'polite' when ariaAnnounce is 'polite'", () => {
      mount(
        <AriaAnnouncerProvider ariaAnnounce="polite">
          <TestComponent announcement="test" />
        </AriaAnnouncerProvider>
      );

      cy.get("[aria-live]").should("have.attr", "aria-live", "polite");
    });

    it("should set aria-live to 'off' when ariaAnnounce is 'off'", () => {
      mount(
        <AriaAnnouncerProvider ariaAnnounce="off">
          <TestComponent announcement="test" />
        </AriaAnnouncerProvider>
      );

      cy.get("[aria-live]").should("have.attr", "aria-live", "off");
    });

    it("should handle undefined ariaAnnounce by using default 'assertive'", () => {
      mount(
        <AriaAnnouncerProvider ariaAnnounce={undefined}>
          <TestComponent announcement="test" />
        </AriaAnnouncerProvider>
      );

      cy.get("[aria-live]").should("have.attr", "aria-live", "assertive");
    });
  });
});
