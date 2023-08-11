import "@testing-library/cypress/add-commands";
import { mount as cypressMount } from "cypress/react18";
import type { MountOptions, MountReturn } from "cypress/react";
import "cypress-axe";
import { Options } from "cypress-axe";
import { PerformanceResult, PerformanceTester } from "./PerformanceTester";
import { ReactNode } from "react";
import { SaltProvider } from "@salt-ds/core";
import { AnnouncementListener } from "./AnnouncementListener";

const SupportedThemeModeValues = ["light", "dark"] as const;
type SupportedThemeMode = typeof SupportedThemeModeValues[number];
const SupportedDensityValues = ["touch", "low", "medium", "high"];
type SupportedDensity = typeof SupportedDensityValues[number];

// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    // unsure why this Subject is unused, nor what to do with it...
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      /**
       * Set Theme Mode
       * @example
       * cy.setMode('light')
       */
      setMode(theme: SupportedThemeMode): Chainable<void>;

      /**
       * Set Density
       *
       * @example
       * cy.setDensity('medium')
       */
      setDensity(theme: SupportedDensity): Chainable<void>;
      /**
       * Set Density
       *
       * @example
       * cy.checkAxeComponent()
       */
      checkAxeComponent(
        options?: Options,
        enableFailures?: boolean
      ): Chainable<void>;

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

Cypress.Commands.add("setMode", function (mode) {
  if (SupportedThemeModeValues.includes(mode)) {
    this.mode;
  } else {
    cy.log("Unsupported mode", mode);
  }
});

Cypress.Commands.add("setDensity", function (density) {
  if (SupportedDensityValues.includes(density)) {
    this.density = density;
  } else {
    cy.log("Unsupported density", density);
  }
});

Cypress.Commands.add(
  "checkAxeComponent",
  (options: Options = {}, enableFailures = false) => {
    cy.injectAxe();
    cy.checkA11y(
      //So the region rule does not have to be disabled globally
      "[data-cy-root]",
      options,
      (a11yErrors) => {
        // Don't output the violations twice
        if (Cypress.browser.isHeadless) {
          for (const a11yError of a11yErrors) {
            cy.task("log", a11yError);
          }
        }
      },
      !enableFailures
    );
  }
);

Cypress.Commands.add("mount", function (children, options) {
  const handleAnnouncement = (announcement: string) => {
    // @ts-ignore
    cy.state("announcement", announcement);
  };

  return cypressMount(
    <SaltProvider density={this.density} mode={this.mode}>
      {children}
      <AnnouncementListener onAnnouncement={handleAnnouncement} />
    </SaltProvider>,
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
