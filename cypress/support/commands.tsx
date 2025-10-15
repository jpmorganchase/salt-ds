import type { ReactNode } from "react";
import "@testing-library/cypress/add-commands";
import type { MountOptions, MountReturn } from "cypress/react";
import { mount as cypressMount } from "cypress/react";
import "cypress-axe";
import { SaltProvider } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { LocalizationProvider } from "@salt-ds/lab";
import type { Options } from "cypress-axe";
import { AnnouncementListener } from "./AnnouncementListener";
import { type PerformanceResult, PerformanceTester } from "./PerformanceTester";

const SupportedThemeModeValues = ["light", "dark"] as const;
type SupportedThemeMode = (typeof SupportedThemeModeValues)[number];
const SupportedDensityValues = ["mobile", "touch", "low", "medium", "high"];
type SupportedDensity = (typeof SupportedDensityValues)[number];

Cypress.Commands.add("setMode", (mode: SupportedThemeMode) => {
  if (SupportedThemeModeValues.includes(mode)) {
    Cypress.env("mode", mode);
  } else {
    cy.log("Unsupported mode", mode);
  }
});

Cypress.Commands.add("setDensity", (density: SupportedDensity) => {
  if (SupportedDensityValues.includes(density)) {
    Cypress.env("density", density);
  } else {
    cy.log("Unsupported density", density);
  }
});

Cypress.Commands.add(
  "setDateAdapter",
  // biome-ignore lint/suspicious/noExplicitAny: locale type varies between Date frameworks
  (adapter: SaltDateAdapter<DateFrameworkType, any>) => {
    Cypress.env("dateAdapter", adapter);
  },
);
// biome-ignore lint/suspicious/noExplicitAny: locale type varies between Date frameworks
Cypress.Commands.add("setDateLocale", (locale: any) => {
  Cypress.env("dateLocale", locale);
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
      !enableFailures,
    );
  },
);

Cypress.Commands.add(
  "mount",
  (
    children: ReactNode,
    options?: MountOptions,
  ): Cypress.Chainable<MountReturn> => {
    const handleAnnouncement = (announcement: string) => {
      // @ts-expect-error
      cy.state("announcement", announcement);
    };

    const density: "mobile" | "touch" | "low" | "medium" | "high" | undefined =
      Cypress.env("density");
    const mode: "light" | "dark" | undefined = Cypress.env("mode");
    const dateAdapter: SaltDateAdapter<DateFrameworkType> | undefined =
      Cypress.env("dateAdapter");
    // biome-ignore lint/suspicious/noExplicitAny: locale type varies between Date frameworks
    const dateLocale: any = Cypress.env("dateLocale");

    if (!SupportedDensityValues.includes(density as SupportedDensity)) {
      throw new Error(`Invalid density value: ${density}`);
    }
    if (!SupportedThemeModeValues.includes(mode as SupportedThemeMode)) {
      throw new Error(`Invalid mode value: ${mode}`);
    }

    const content = (
      <SaltProvider density={density} mode={mode}>
        {dateAdapter ? (
          <LocalizationProvider
            // biome-ignore lint/suspicious/noExplicitAny: ignore type
            DateAdapter={dateAdapter.constructor as any}
            locale={dateLocale}
          >
            {children}
            <AnnouncementListener onAnnouncement={handleAnnouncement} />
          </LocalizationProvider>
        ) : (
          <>
            {children}
            <AnnouncementListener onAnnouncement={handleAnnouncement} />
          </>
        )}
      </SaltProvider>
    );

    return cypressMount(content, options);
  },
);

Cypress.Commands.add("mountPerformance", (children, options) => {
  const handleRender = (result: PerformanceResult) => {
    // @ts-expect-error
    cy.state("performanceResult", result);
  };

  return cy.mount(
    <PerformanceTester onRender={handleRender}>{children}</PerformanceTester>,
    options,
  );
});

Cypress.Commands.add("getRenderTime", () => {
  // @ts-expect-error
  return cy.state("performanceResult").renderTime;
});

Cypress.Commands.add("getRenderCount", () => {
  // @ts-expect-error
  return cy.state("performanceResult").renderCount;
});

Cypress.Commands.add("paste", { prevSubject: "element" }, (input, value) => {
  // taken from https://stackoverflow.com/a/69552958/11217233
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;

  if (nativeInputValueSetter) {
    cy.wrap(input).then((input) => {
      nativeInputValueSetter.call(input[0], value);
      input[0].dispatchEvent(
        new Event("input", {
          bubbles: true,
          composed: true,
        }),
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

// Set default values for density and mode
const defaultDensity: SupportedDensity = "medium";
const defaultMode: SupportedThemeMode = "light";
before(() => {
  Cypress.env("density", defaultDensity);
  Cypress.env("mode", defaultMode);
  Cypress.env("dateLocale", undefined);
});
