import {
  ownerWindow,
  SaltProvider,
  SaltProviderNext,
  useAriaAnnouncer,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import { WindowProvider } from "@salt-ds/window";
import { mount } from "cypress/react18";
import { type ReactNode, useCallback, useState } from "react";
import { createPortal } from "react-dom";

const TestComponent = ({
  id = "test-1",
  className = "",
}: {
  id?: string;
  className?: string;
}) => {
  const density = useDensity();
  const {
    theme,
    mode,
    themeNext,
    corner,
    accent,
    actionFont,
    headingFont,
    // Test backwards compatibilty using `UNSTABLE_` variables
    UNSTABLE_corner,
    UNSTABLE_accent,
    UNSTABLE_actionFont,
    UNSTABLE_headingFont,
  } = useTheme();
  const { announce } = useAriaAnnouncer();
  const announcerPresent = typeof announce === "function";

  return (
    <div
      id={id}
      className={className}
      data-density={density}
      data-theme={theme}
      data-mode={mode}
      data-announcer={announcerPresent}
      data-corner={corner}
      data-accent={accent}
      data-heading-font={headingFont}
      data-action-font={actionFont}
      data-themeNext={themeNext}
      // Test backwards compatibilty using `UNSTABLE_` variables
      data-unstable-corner={UNSTABLE_corner}
      data-unstable-accent={UNSTABLE_accent}
      data-unstable-heading-font={UNSTABLE_headingFont}
      data-unstable-action-font={UNSTABLE_actionFont}
    />
  );
};

describe("Given a SaltProvider", () => {
  describe("with no props set", () => {
    it("should apply the given theme and density class names to the html element", () => {
      mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>,
      );

      cy.get("div.salt-provider").should("have.length", 0);

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "light")
        .and("have.class", "salt-density-medium");
    });
    it("should apply correct default values for Density and Theme and add an AriaAnnouncer", () => {
      mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>,
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true");
      cy.get("[aria-live]").should("exist");
    });

    it("should not have theme next class and attributes applied", () => {
      mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>,
      );

      cy.get(".salt-theme-next").should("have.length", 0);
      cy.get("html").should("exist").and("not.have.attr", "data-corner");
    });
  });

  describe("with props set", () => {
    it("should apply correct default value for density and add an AriaAnnouncer", () => {
      mount(
        <SaltProvider mode="dark">
          <TestComponent />
        </SaltProvider>,
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply correct default value for mode and add an AriaAnnouncer", () => {
      mount(
        <SaltProvider density="high">
          <TestComponent />
        </SaltProvider>,
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply values specified in props", () => {
      mount(
        <SaltProvider density="high" mode="dark" theme="custom-theme">
          <TestComponent />
        </SaltProvider>,
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-theme", "custom-theme")
        .and("have.attr", "data-announcer", "true");
    });

    it("should allow pass in multiple theme names", () => {
      mount(
        <SaltProvider
          density="high"
          mode="dark"
          theme="custom-theme-1 custom-theme-2"
        >
          <TestComponent />
        </SaltProvider>,
      );

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "custom-theme-1 custom-theme-2")
        .and("have.class", "salt-density-high");

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-theme", "custom-theme-1 custom-theme-2")
        .and("have.attr", "data-announcer", "true");
    });
  });

  describe("when nested", () => {
    it("should only create a single AriaAnnouncer", () => {
      mount(
        <SaltProvider>
          <SaltProvider>
            <TestComponent />
          </SaltProvider>
        </SaltProvider>,
      );

      cy.get("[aria-live]").should("have.length", 1);
    });

    it("should inherit values not passed as props", () => {
      mount(
        <SaltProvider density="high" mode="dark">
          <TestComponent />
          <SaltProvider density="medium">
            <TestComponent id="test-2" />
          </SaltProvider>
        </SaltProvider>,
      );

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");

      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");
    });
  });

  describe("when child is passed to applyClassesTo", () => {
    it("should not create a div element", () => {
      mount(
        <SaltProvider density="high" mode="dark" applyClassesTo={"child"}>
          <TestComponent />
        </SaltProvider>,
      );

      cy.get("div.salt-provider").should("have.length", 0);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "salt-theme")
        .and("have.class", "salt-density-high");
    });
  });

  describe("when root is passed to applyClassesTo", () => {
    it("should apply the given theme and density class names to the html element", () => {
      mount(
        <SaltProvider
          density="high"
          mode="dark"
          theme="custom-theme"
          applyClassesTo={"root"}
        >
          <TestComponent />
        </SaltProvider>,
      );

      cy.get("div.salt-provider").should("have.length", 0);

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "custom-theme")
        .and("have.class", "salt-density-high");
    });
  });

  describe("when scope is passed to applyClassesTo", () => {
    it("should create div element with correct classes applied even if it is the root level provider", () => {
      mount(
        <SaltProvider
          density="high"
          mode="dark"
          theme="custom-theme"
          applyClassesTo="scope"
        >
          <TestComponent />
        </SaltProvider>,
      );

      cy.get("div.salt-provider")
        .should("have.length", 1)
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "custom-theme")
        .and("have.class", "salt-density-high");
    });
  });

  it("should warn when two providers are set to apply to root", () => {
    cy.spy(console, "warn").as("consoleSpy");

    mount(
      <SaltProvider applyClassesTo={"root"}>
        <SaltProvider applyClassesTo={"root"}>
          <TestComponent />
        </SaltProvider>
      </SaltProvider>,
    );

    cy.get("@consoleSpy").should(
      "have.been.calledWith",
      "Multiple providers targeting the same window. There can be only one level root level SaltProvider per window.",
    );
  });

  function FakeWindow({ children }: { children?: ReactNode }) {
    const [mountNode, setMountNode] = useState<HTMLElement | undefined>(
      undefined,
    );

    const handleFrameRef = useCallback((node: HTMLIFrameElement) => {
      setMountNode(node?.contentWindow?.document?.body);
    }, []);

    return (
      <iframe ref={handleFrameRef} title="Fake Window">
        <WindowProvider window={ownerWindow(mountNode)}>
          {mountNode && createPortal(children, mountNode)}
        </WindowProvider>
      </iframe>
    );
  }

  it("should not warn when two providers are set to apply to root but are in different windows", () => {
    cy.spy(console, "warn").as("consoleSpy");

    mount(
      <SaltProvider applyClassesTo={"root"}>
        <FakeWindow>
          <SaltProvider applyClassesTo={"root"}>
            <TestComponent />
          </SaltProvider>
        </FakeWindow>
      </SaltProvider>,
    );

    cy.get("@consoleSpy").should("not.have.been.called");
  });

  it("should warn when two deeply providers are set to apply to root", () => {
    cy.spy(console, "warn").as("consoleSpy");

    mount(
      <SaltProvider applyClassesTo={"root"}>
        <FakeWindow>
          <SaltProvider applyClassesTo={"root"}>
            <WindowProvider window={window}>
              <SaltProvider applyClassesTo={"root"}>
                <TestComponent />
              </SaltProvider>
            </WindowProvider>
          </SaltProvider>
        </FakeWindow>
      </SaltProvider>,
    );

    cy.get("@consoleSpy").should(
      "have.been.calledWith",
      "Multiple providers targeting the same window. There can be only one level root level SaltProvider per window.",
    );
  });
});

describe("Given a SaltProviderNext", () => {
  describe("with no props set", () => {
    it("should apply default theme attributes to the html element", () => {
      mount(
        <SaltProviderNext>
          <TestComponent />
        </SaltProviderNext>,
      );

      cy.get("div.salt-provider").should("have.length", 0);

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-corner", "sharp")
        .and("have.attr", "data-accent", "blue")
        .and("have.attr", "data-heading-font", "Open Sans")
        .and("have.attr", "data-action-font", "Open Sans")
        .and("have.class", "salt-theme")
        .and("have.class", "salt-theme-next")
        .and("have.class", "salt-density-medium");
    });
    it("should read correct default values from provider and add an AriaAnnouncer", () => {
      mount(
        <SaltProviderNext>
          <TestComponent />
        </SaltProviderNext>,
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true")
        .and("have.attr", "data-themeNext", "true")
        .and("have.attr", "data-corner", "sharp")
        .and("have.attr", "data-accent", "blue")
        .and("have.attr", "data-heading-font", "Open Sans")
        .and("have.attr", "data-action-font", "Open Sans")
        .and("have.attr", "data-unstable-corner", "sharp")
        .and("have.attr", "data-unstable-accent", "blue")
        .and("have.attr", "data-unstable-heading-font", "Open Sans")
        .and("have.attr", "data-unstable-action-font", "Open Sans");
      cy.get("[aria-live]").should("exist");
    });
  });

  describe("with props set", () => {
    it("should allow pass in multiple theme names", () => {
      mount(
        <SaltProviderNext
          density="high"
          mode="dark"
          corner="rounded"
          accent="teal"
          theme="custom-theme-1 custom-theme-2"
        >
          <TestComponent />
        </SaltProviderNext>,
      );

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-accent", "teal")
        .and("have.attr", "data-corner", "rounded")
        .and("have.class", "salt-theme")
        .and("have.class", "salt-theme-next")
        .and("have.class", "custom-theme-1")
        .and("have.class", "custom-theme-2")
        .and("have.class", "salt-density-high");

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-accent", "teal")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-theme", "custom-theme-1 custom-theme-2")
        .and("have.attr", "data-announcer", "true");
    });
  });

  describe("when nested", () => {
    it("should inherit values not passed as props", () => {
      mount(
        <SaltProviderNext
          density="high"
          mode="dark"
          corner="rounded"
          accent="teal"
          headingFont="Amplitude"
          actionFont="Amplitude"
        >
          <TestComponent />
          <SaltProviderNext density="medium">
            <TestComponent id="test-2" />
          </SaltProviderNext>
        </SaltProviderNext>,
      );

      cy.get("html.salt-theme-next").should("have.length", 1);
      cy.get(".salt-provider.salt-theme-next").should("have.length", 1);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-accent", "teal")
        .and("have.attr", "data-heading-font", "Amplitude")
        .and("have.attr", "data-action-font", "Amplitude")
        .and("have.attr", "data-unstable-corner", "rounded")
        .and("have.attr", "data-unstable-accent", "teal")
        .and("have.attr", "data-unstable-heading-font", "Amplitude")
        .and("have.attr", "data-unstable-action-font", "Amplitude")
        .and("have.attr", "data-announcer", "true");

      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-accent", "teal")
        .and("have.attr", "data-heading-font", "Amplitude")
        .and("have.attr", "data-action-font", "Amplitude")
        .and("have.attr", "data-unstable-corner", "rounded")
        .and("have.attr", "data-unstable-accent", "teal")
        .and("have.attr", "data-unstable-heading-font", "Amplitude")
        .and("have.attr", "data-unstable-action-font", "Amplitude")
        .and("have.attr", "data-announcer", "true");
    });
    it("should take different values set as props", () => {
      mount(
        <SaltProviderNext
          density="high"
          mode="dark"
          corner="rounded"
          accent="teal"
          headingFont="Amplitude"
          actionFont="Amplitude"
        >
          <TestComponent />
          <SaltProviderNext
            density="medium"
            corner="sharp"
            accent="blue"
            headingFont="Open Sans"
            actionFont="Open Sans"
          >
            <TestComponent id="test-2" />
          </SaltProviderNext>
        </SaltProviderNext>,
      );

      cy.get("html.salt-theme-next").should("have.length", 1);
      cy.get(".salt-provider.salt-theme-next").should("have.length", 1);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-accent", "teal")
        .and("have.attr", "data-heading-font", "Amplitude")
        .and("have.attr", "data-action-font", "Amplitude")
        .and("have.attr", "data-unstable-corner", "rounded")
        .and("have.attr", "data-unstable-accent", "teal")
        .and("have.attr", "data-unstable-heading-font", "Amplitude")
        .and("have.attr", "data-unstable-action-font", "Amplitude")
        .and("have.attr", "data-announcer", "true");

      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "sharp")
        .and("have.attr", "data-accent", "blue")
        .and("have.attr", "data-heading-font", "Open Sans")
        .and("have.attr", "data-action-font", "Open Sans")
        .and("have.attr", "data-unstable-corner", "sharp")
        .and("have.attr", "data-unstable-accent", "blue")
        .and("have.attr", "data-unstable-heading-font", "Open Sans")
        .and("have.attr", "data-unstable-action-font", "Open Sans")
        .and("have.attr", "data-announcer", "true");
    });
  });
});
