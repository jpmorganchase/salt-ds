import "@testing-library/cypress/add-commands";
import { mount as cypressMount } from "cypress/react18";
import type { MountReturn, MountOptions } from "cypress/react";
import { PerformanceResult, PerformanceTester } from "./PerformanceTester";
import { ReactNode } from "react";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { AnnouncementListener } from "./AnnouncementListener";

const SupportedThemeValues = ["light", "dark"] as const;
type SupportedTheme = typeof SupportedThemeValues[number];
const SupportedDensityValues = ["touch", "low", "medium", "high"];
type SupportedDensity = typeof SupportedDensityValues[number];

// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    // unsure why this Subject is unused, nor what to do with it...
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      /**
       * Set Theme
       * @example
       * cy.setTheme('light')
       */
      setTheme(theme: SupportedTheme): Chainable<void>;

      /**
       * Set Density
       *
       * @example
       * cy.setDensity('medium')
       */
      setDensity(theme: SupportedDensity): Chainable<void>;

      mountPerformance: (
        jsx: ReactNode,
        options?: MountOptions
      ) => Chainable<MountReturn>;
      mount: (jsx: ReactNode, options?: MountOptions) => Chainable<MountReturn>;
      getRenderCount(): Chainable<number>;
      getRenderTime(): Chainable<number>;
      paste(string: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("setTheme", function (theme) {
  if (SupportedThemeValues.includes(theme)) {
    this.theme;
  } else {
    cy.log("Unsupported theme", theme);
  }
});

Cypress.Commands.add("setDensity", function (density) {
  if (SupportedDensityValues.includes(density)) {
    this.density = density;
  } else {
    cy.log("Unsupported density", density);
  }
});

Cypress.Commands.add("mount", function (children, options) {
  const handleAnnouncement = (announcement: string) => {
    // @ts-ignore
    cy.state("announcement", announcement);
  };

  return cypressMount(
    <ToolkitProvider density={this.density} theme={this.theme}>
      {children}
      <AnnouncementListener onAnnouncement={handleAnnouncement} />
    </ToolkitProvider>,
    options
  );
});

Cypress.Commands.add("mountPerformance", function (children, options) {
  const handleRender = (result: PerformanceResult) => {
    // @ts-ignore
    cy.state("performanceResult", result);
  };

  return cy.mount(
    <PerformanceTester onRender={handleRender}>{children}</PerformanceTester>,
    options
  );
});

Cypress.Commands.add("getRenderTime", function () {
  // @ts-ignore
  return cy.state("performanceResult").renderTime;
});

Cypress.Commands.add("getRenderCount", function () {
  // @ts-ignore
  return cy.state("performanceResult").renderCount;
});

Cypress.Commands.add("paste", { prevSubject: "element" }, (input, value) => {
  // taken from https://stackoverflow.com/a/69552958/11217233
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;

  if (nativeInputValueSetter) {
    cy.wrap(input).then((input) => {
      nativeInputValueSetter.call(input[0], value);
      input[0].dispatchEvent(
        new Event("input", {
          bubbles: true,
          composed: true,
        })
      );
    });
  }
});

// Workaround for an issue in Cypress, where ResizeObserver fails with the message
// ResizeObserver loop limit exceeded
// Seems to occur for us in Cypress but never in browser in normal use
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver")) {
    return false;
  }
});

export {};
