import { clsx } from "clsx";
import {
  ownerWindow,
  SaltProvider,
  useAriaAnnouncer,
  useDensity,
  useTheme,
  UNSTABLE_SaltProviderNext,
} from "@salt-ds/core";
import { mount } from "cypress/react18";
import { WindowProvider } from "@salt-ds/window";
import { ReactNode, useCallback, useState } from "react";
import { createPortal } from "react-dom";

const TestComponent = ({
  id = "test-1",
  className = "",
}: {
  id?: string;
  className?: string;
}) => {
  const density = useDensity();
  const { theme, mode, UNSTABLE_corner, themeNext } = useTheme();
  const { announce } = useAriaAnnouncer();
  const announcerPresent = typeof announce === "function";

  return (
    <div
      id={id}
      className={className}
      data-density={density}
      data-theme={clsx(theme)}
      data-mode={mode}
      data-announcer={announcerPresent}
      data-corner={UNSTABLE_corner}
      data-themeNext={themeNext}
    />
  );
};

describe("Given a SaltProvider", () => {
  describe("with no props set", () => {
    it("should apply the given theme and density class names to the html element", () => {
      mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>
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
        </SaltProvider>
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
        </SaltProvider>
      );

      cy.get(".salt-theme-next").should("have.length", 0);
      cy.get("html").should("exist").and("not.have.attr", "data-corner");
    });
  });

  describe("with props set", () => {
    it("should apply correct default value for Density and add an AriaAnnouncer", () => {
      mount(
        <SaltProvider mode="dark">
          <TestComponent />
        </SaltProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply correct default value for Theme and add an AriaAnnouncer", () => {
      mount(
        <SaltProvider density="high">
          <TestComponent />
        </SaltProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply density and mode values specified in props", () => {
      mount(
        <SaltProvider density="high" mode="dark">
          <TestComponent />
        </SaltProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply theme (string) prop specified in props", () => {
      mount(
        <SaltProvider theme="custom-theme">
          <TestComponent />
        </SaltProvider>
      );
      cy.get("html")
        .should("exist")
        .and("have.class", "salt-theme")
        .and("have.class", "custom-theme");
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-theme", "custom-theme");
    });

    it("should apply theme (string[]) prop specified in props", () => {
      mount(
        <SaltProvider theme={["custom-theme-1", "custom-theme-2"]}>
          <TestComponent />
        </SaltProvider>
      );
      cy.get("html")
        .should("exist")
        .and("have.class", "salt-theme")
        .and("have.class", "custom-theme-1")
        .and("have.class", "custom-theme-2");
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-theme", "custom-theme-1 custom-theme-2");
    });
  });

  describe("when nested", () => {
    it("should only create a single AriaAnnouncer", () => {
      mount(
        <SaltProvider>
          <SaltProvider>
            <TestComponent />
          </SaltProvider>
        </SaltProvider>
      );

      cy.get("[aria-live]").should("have.length", 1);
    });

    it("should inherit values not passed as props", () => {
      mount(
        <SaltProvider density="high" mode="dark" theme="custom-theme-1">
          <TestComponent />
          <SaltProvider density="medium" theme="custom-theme-2">
            <TestComponent id="test-2" />
          </SaltProvider>
        </SaltProvider>
      );

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true")
        .and("have.attr", "data-theme", "custom-theme-1");
      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true")
        .and("have.attr", "data-theme", "custom-theme-2");
    });
  });

  describe("when child is passed to applyClassesTo", () => {
    it("should not create a div element", () => {
      mount(
        <SaltProvider density="high" mode="dark" applyClassesTo={"child"}>
          <TestComponent />
        </SaltProvider>
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
        <SaltProvider density="high" mode="dark" applyClassesTo={"root"}>
          <TestComponent />
        </SaltProvider>
      );

      cy.get("div.salt-provider").should("have.length", 0);

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "salt-density-high");
    });
  });

  describe("when scope is passed to applyClassesTo", () => {
    it("should create div element with correct classes applied even if it is the root level provider", () => {
      mount(
        <SaltProvider density="high" mode="dark" applyClassesTo={"scope"}>
          <TestComponent />
        </SaltProvider>
      );

      cy.get("div.salt-provider")
        .should("have.length", 1)
        .and("have.attr", "data-mode", "dark")
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
      </SaltProvider>
    );

    cy.get("@consoleSpy").should(
      "have.been.calledWith",
      "SaltProvider can only apply CSS classes to the root if it is the root level SaltProvider."
    );
  });

  function FakeWindow({ children }: { children?: ReactNode }) {
    const [mountNode, setMountNode] = useState<HTMLElement | undefined>(
      undefined
    );

    const handleFrameRef = useCallback((node: HTMLIFrameElement) => {
      setMountNode(node?.contentWindow?.document?.body);
    }, []);

    return (
      <iframe ref={handleFrameRef}>
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
      </SaltProvider>
    );

    cy.get("@consoleSpy").should("not.have.been.called");
  });
});

describe("Given a SaltProviderNext", () => {
  describe("with no props set", () => {
    it("should apply default theme attributes to the html element", () => {
      mount(
        <UNSTABLE_SaltProviderNext>
          <TestComponent />
        </UNSTABLE_SaltProviderNext>
      );

      cy.get("div.salt-provider").should("have.length", 0);

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-corner", "sharp")
        .and("have.class", "salt-theme-next")
        .and("have.class", "salt-density-medium");
    });
    it("should read correct default values from provider and add an AriaAnnouncer", () => {
      mount(
        <UNSTABLE_SaltProviderNext>
          <TestComponent />
        </UNSTABLE_SaltProviderNext>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true")
        .and("have.attr", "data-corner", "sharp")
        .and("have.attr", "data-themeNext", "true");
      cy.get("[aria-live]").should("exist");
    });
  });

  describe("when nested", () => {
    it("should inherit values not passed as props", () => {
      mount(
        <UNSTABLE_SaltProviderNext density="high" mode="dark" corner="rounded">
          <TestComponent />
          <UNSTABLE_SaltProviderNext density="medium">
            <TestComponent id="test-2" />
          </UNSTABLE_SaltProviderNext>
        </UNSTABLE_SaltProviderNext>
      );

      cy.get("html.salt-theme-next").should("have.length", 1);
      cy.get(".salt-provider.salt-theme-next").should("have.length", 1);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-announcer", "true");

      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-announcer", "true");
    });
    it("should take different values set as props", () => {
      mount(
        <UNSTABLE_SaltProviderNext density="high" mode="dark" corner="rounded">
          <TestComponent />
          <UNSTABLE_SaltProviderNext density="medium" corner="sharp">
            <TestComponent id="test-2" />
          </UNSTABLE_SaltProviderNext>
        </UNSTABLE_SaltProviderNext>
      );

      cy.get("html.salt-theme-next").should("have.length", 1);
      cy.get(".salt-provider.salt-theme-next").should("have.length", 1);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "rounded")
        .and("have.attr", "data-announcer", "true");

      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-corner", "sharp")
        .and("have.attr", "data-announcer", "true");
    });
  });
});
