import {
  ownerWindow,
  SaltProvider,
  SaltProviderNext,
  useAriaAnnouncer,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import { WindowProvider } from "@salt-ds/window";
import { type ReactNode, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-react";

function TestComponent({
  id = "test-1",
  className = "",
}: {
  id?: string;
  className?: string;
}) {
  const density = useDensity();
  const {
    theme,
    mode,
    themeNext,
    corner,
    accent,
    actionFont,
    headingFont,
    UNSTABLE_corner,
    UNSTABLE_accent,
    UNSTABLE_actionFont,
    UNSTABLE_headingFont,
  } = useTheme();
  const { announce } = useAriaAnnouncer();
  return (
    <div
      id={id}
      className={className}
      data-density={density}
      data-theme={theme}
      data-mode={mode}
      data-announcer={typeof announce === "function"}
      data-corner={corner}
      data-accent={accent}
      data-heading-font={headingFont}
      data-action-font={actionFont}
      data-themeNext={themeNext}
      data-unstable-corner={UNSTABLE_corner}
      data-unstable-accent={UNSTABLE_accent}
      data-unstable-heading-font={UNSTABLE_headingFont}
      data-unstable-action-font={UNSTABLE_actionFont}
    />
  );
}

async function mount(children: ReactNode) {
  await cleanup();
  return render(children);
}

async function expectAttributes(
  selector: string,
  attributes: Record<string, string>,
) {
  const element = document.querySelector(selector);
  expect(element).toBeInTheDocument();
  for (const [name, value] of Object.entries(attributes)) {
    expect(element).toHaveAttribute(name, value);
  }
}

function FakeWindow({ children }: { children?: ReactNode }) {
  const [mountNode, setMountNode] = useState<HTMLElement>();
  const handleFrameRef = useCallback((node: HTMLIFrameElement | null) => {
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

describe("Given a SaltProvider", () => {
  describe("with no props set", () => {
    it("should apply the given theme and density class names to the html element", async () => {
      await mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>,
      );
      expect(document.querySelectorAll("div.salt-provider")).toHaveLength(0);
      expect(document.documentElement).toHaveAttribute("data-mode", "light");
      expect(document.documentElement).toHaveClass("salt-density-medium");
    });

    it("should apply correct default values for Density and Theme and add an AriaAnnouncer", async () => {
      await mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>,
      );
      await expectAttributes("#test-1", {
        "data-density": "medium",
        "data-mode": "light",
        "data-announcer": "true",
      });
      expect(document.querySelector("[aria-live]")).toBeInTheDocument();
    });

    it("should not have theme next class and attributes applied", async () => {
      await mount(
        <SaltProvider>
          <TestComponent />
        </SaltProvider>,
      );
      expect(document.querySelectorAll(".salt-theme-next")).toHaveLength(0);
      expect(document.documentElement).not.toHaveAttribute("data-corner");
    });
  });

  describe("with props set", () => {
    it("should apply correct default value for density and add an AriaAnnouncer", async () => {
      await mount(
        <SaltProvider mode="dark">
          <TestComponent />
        </SaltProvider>,
      );
      await expectAttributes("#test-1", {
        "data-density": "medium",
        "data-mode": "dark",
        "data-announcer": "true",
      });
    });

    it("should apply correct default value for mode and add an AriaAnnouncer", async () => {
      await mount(
        <SaltProvider density="high">
          <TestComponent />
        </SaltProvider>,
      );
      await expectAttributes("#test-1", {
        "data-density": "high",
        "data-mode": "light",
        "data-announcer": "true",
      });
    });

    it("should apply values specified in props", async () => {
      await mount(
        <SaltProvider density="high" mode="dark" theme="custom-theme">
          <TestComponent />
        </SaltProvider>,
      );
      await expectAttributes("#test-1", {
        "data-density": "high",
        "data-mode": "dark",
        "data-theme": "custom-theme",
        "data-announcer": "true",
      });
    });

    it("should allow pass in multiple theme names", async () => {
      await mount(
        <SaltProvider
          density="high"
          mode="dark"
          theme="custom-theme-1 custom-theme-2"
        >
          <TestComponent />
        </SaltProvider>,
      );
      expect(document.documentElement).toHaveAttribute("data-mode", "dark");
      expect(document.documentElement).toHaveClass(
        "custom-theme-1",
        "custom-theme-2",
        "salt-density-high",
      );
      await expectAttributes("#test-1", {
        "data-density": "high",
        "data-mode": "dark",
        "data-theme": "custom-theme-1 custom-theme-2",
        "data-announcer": "true",
      });
    });
  });

  describe("when nested", () => {
    it("should only create a single AriaAnnouncer", async () => {
      await mount(
        <SaltProvider>
          <SaltProvider>
            <TestComponent />
          </SaltProvider>
        </SaltProvider>,
      );
      expect(document.querySelectorAll("[aria-live]")).toHaveLength(2);
    });

    it("should inherit values not passed as props", async () => {
      await mount(
        <SaltProvider density="high" mode="dark">
          <TestComponent />
          <SaltProvider density="medium">
            <TestComponent id="test-2" />
          </SaltProvider>
        </SaltProvider>,
      );
      await expectAttributes("#test-1", {
        "data-density": "high",
        "data-mode": "dark",
        "data-announcer": "true",
      });
      await expectAttributes("#test-2", {
        "data-density": "medium",
        "data-mode": "dark",
        "data-announcer": "true",
      });
    });

    it("should inherit themes", async () => {
      await mount(
        <SaltProvider theme="testTheme">
          <div />
          <SaltProvider>
            <div />
          </SaltProvider>
        </SaltProvider>,
      );
      expect(document.querySelectorAll(".testTheme")).toHaveLength(2);
    });
  });

  describe("when child is passed to applyClassesTo", () => {
    it("should not create a div element", async () => {
      await mount(
        <SaltProvider density="high" mode="dark" applyClassesTo="child">
          <TestComponent />
        </SaltProvider>,
      );
      expect(document.querySelectorAll("div.salt-provider")).toHaveLength(0);
      await expectAttributes("#test-1", { "data-mode": "dark" });
      expect(document.querySelector("#test-1")).toHaveClass(
        "salt-theme",
        "salt-density-high",
      );
    });
  });

  describe("when root is passed to applyClassesTo", () => {
    it("should apply the given theme and density class names to the html element", async () => {
      await mount(
        <SaltProvider
          density="high"
          mode="dark"
          theme="custom-theme"
          applyClassesTo="root"
        >
          <TestComponent />
        </SaltProvider>,
      );
      expect(document.querySelectorAll("div.salt-provider")).toHaveLength(0);
      expect(document.documentElement).toHaveAttribute("data-mode", "dark");
      expect(document.documentElement).toHaveClass(
        "custom-theme",
        "salt-density-high",
      );
    });
  });

  describe("when scope is passed to applyClassesTo", () => {
    it("should create div element with correct classes applied even if it is the root level provider", async () => {
      await mount(
        <SaltProvider
          density="high"
          mode="dark"
          theme="custom-theme"
          applyClassesTo="scope"
        >
          <TestComponent />
        </SaltProvider>,
      );
      const providers = document.querySelectorAll("div.salt-provider");
      expect(providers).toHaveLength(1);
      expect(providers[0]).toHaveAttribute("data-mode", "dark");
      expect(providers[0]).toHaveClass("custom-theme", "salt-density-high");
    });
  });

  it("should warn when two providers are set to apply to root", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    await mount(
      <SaltProvider applyClassesTo="root">
        <SaltProvider applyClassesTo="root">
          <TestComponent />
        </SaltProvider>
      </SaltProvider>,
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Multiple providers targeting the same window. There can be only one level root level SaltProvider per window.",
    );
    consoleSpy.mockRestore();
  });

  it("should not warn when two providers are set to apply to root but are in different windows", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    await mount(
      <SaltProvider applyClassesTo="root">
        <FakeWindow>
          <SaltProvider applyClassesTo="root">
            <TestComponent />
          </SaltProvider>
        </FakeWindow>
      </SaltProvider>,
    );
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should warn when two deeply providers are set to apply to root", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    await mount(
      <SaltProvider applyClassesTo="root">
        <FakeWindow>
          <SaltProvider applyClassesTo="root">
            <WindowProvider window={window}>
              <SaltProvider applyClassesTo="root">
                <TestComponent />
              </SaltProvider>
            </WindowProvider>
          </SaltProvider>
        </FakeWindow>
      </SaltProvider>,
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Multiple providers targeting the same window. There can be only one level root level SaltProvider per window.",
    );
    consoleSpy.mockRestore();
  });
});

const nextDefaults = {
  "data-density": "medium",
  "data-mode": "light",
  "data-announcer": "true",
  "data-themenext": "true",
  "data-corner": "sharp",
  "data-accent": "blue",
  "data-heading-font": "Open Sans",
  "data-action-font": "Open Sans",
  "data-unstable-corner": "sharp",
  "data-unstable-accent": "blue",
  "data-unstable-heading-font": "Open Sans",
  "data-unstable-action-font": "Open Sans",
};

describe("Given a SaltProviderNext", () => {
  describe("with no props set", () => {
    it("should apply default theme attributes to the html element", async () => {
      await mount(
        <SaltProviderNext>
          <TestComponent />
        </SaltProviderNext>,
      );
      expect(document.querySelectorAll("div.salt-provider")).toHaveLength(0);
      expect(document.documentElement).toHaveAttribute("data-mode", "light");
      expect(document.documentElement).toHaveAttribute("data-corner", "sharp");
      expect(document.documentElement).toHaveAttribute("data-accent", "blue");
      expect(document.documentElement).toHaveAttribute(
        "data-heading-font",
        "Open Sans",
      );
      expect(document.documentElement).toHaveAttribute(
        "data-action-font",
        "Open Sans",
      );
      expect(document.documentElement).toHaveClass(
        "salt-theme",
        "salt-theme-next",
        "salt-density-medium",
      );
    });

    it("should read correct default values from provider and add an AriaAnnouncer", async () => {
      await mount(
        <SaltProviderNext>
          <TestComponent />
        </SaltProviderNext>,
      );
      await expectAttributes("#test-1", nextDefaults);
      expect(document.querySelector("[aria-live]")).toBeInTheDocument();
    });
  });

  describe("with props set", () => {
    it("should allow pass in multiple theme names", async () => {
      await mount(
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
      expect(document.documentElement).toHaveAttribute("data-mode", "dark");
      expect(document.documentElement).toHaveAttribute("data-accent", "teal");
      expect(document.documentElement).toHaveAttribute(
        "data-corner",
        "rounded",
      );
      expect(document.documentElement).toHaveClass(
        "salt-theme",
        "salt-theme-next",
        "custom-theme-1",
        "custom-theme-2",
        "salt-density-high",
      );
      await expectAttributes("#test-1", {
        "data-density": "high",
        "data-mode": "dark",
        "data-accent": "teal",
        "data-corner": "rounded",
        "data-theme": "custom-theme-1 custom-theme-2",
        "data-announcer": "true",
      });
    });
  });

  describe("when nested", () => {
    const outerAttributes = {
      "data-density": "high",
      "data-mode": "dark",
      "data-corner": "rounded",
      "data-accent": "teal",
      "data-heading-font": "Amplitude",
      "data-action-font": "Amplitude",
      "data-unstable-corner": "rounded",
      "data-unstable-accent": "teal",
      "data-unstable-heading-font": "Amplitude",
      "data-unstable-action-font": "Amplitude",
      "data-announcer": "true",
    };

    it("should inherit values not passed as props", async () => {
      await mount(
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
      expect(document.querySelectorAll("html.salt-theme-next")).toHaveLength(1);
      expect(
        document.querySelectorAll(".salt-provider.salt-theme-next"),
      ).toHaveLength(1);
      await expectAttributes("#test-1", outerAttributes);
      await expectAttributes("#test-2", {
        ...outerAttributes,
        "data-density": "medium",
      });
    });

    it("should take different values set as props", async () => {
      await mount(
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
      expect(document.querySelectorAll("html.salt-theme-next")).toHaveLength(1);
      expect(
        document.querySelectorAll(".salt-provider.salt-theme-next"),
      ).toHaveLength(1);
      await expectAttributes("#test-1", outerAttributes);
      await expectAttributes("#test-2", {
        ...nextDefaults,
        "data-mode": "dark",
      });
    });

    it("should inherit themes", async () => {
      await mount(
        <SaltProviderNext theme="testTheme">
          <div />
          <SaltProviderNext>
            <div />
          </SaltProviderNext>
        </SaltProviderNext>,
      );
      expect(document.querySelectorAll(".testTheme")).toHaveLength(2);
    });
  });
});
