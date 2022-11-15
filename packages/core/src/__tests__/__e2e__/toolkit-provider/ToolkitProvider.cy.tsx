import {
  ToolkitProvider,
  useAriaAnnouncer,
  useDensity,
  useTheme,
} from "@jpmorganchase/uitk-core";
import { mount } from "cypress/react";

const TestComponent = ({
  id = "test-1",
  className = "",
}: {
  id?: string;
  className?: string;
}) => {
  const density = useDensity();
  const { theme, mode } = useTheme();
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
    />
  );
};

describe("Given a ToolkitProvider", () => {
  describe("with no props set", () => {
    it("should create div element with correct classes applied", () => {
      cy.mount(
        <ToolkitProvider>
          <TestComponent />
        </ToolkitProvider>
      );

      cy.get("div.uitk-provider")
        .should("have.length", 2)
        .and("have.attr", "data-mode", "light")
        .and("have.class", "uitk-density-medium");
    });
    it("should apply correct default values for Density and Theme and add an AriaAnnouncer", () => {
      cy.mount(
        <ToolkitProvider>
          <TestComponent />
        </ToolkitProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true");
      cy.get("[aria-live]").should("exist");
    });
  });

  describe("with props set", () => {
    it("should apply correct default value for Density and add an AriaAnnouncer", () => {
      cy.mount(
        <ToolkitProvider mode="dark">
          <TestComponent />
        </ToolkitProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply correct default value for Theme and add an AriaAnnouncer", () => {
      cy.mount(
        <ToolkitProvider density="high">
          <TestComponent />
        </ToolkitProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "light")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply values specified in props", () => {
      cy.mount(
        <ToolkitProvider density="high" mode="dark">
          <TestComponent />
        </ToolkitProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-mode", "dark")
        .and("have.attr", "data-announcer", "true");
    });
  });

  describe("when nested", () => {
    it("should only create a single AriaAnnouncer", () => {
      cy.mount(
        <ToolkitProvider>
          <ToolkitProvider>
            <TestComponent />
          </ToolkitProvider>
        </ToolkitProvider>
      );

      cy.get("[aria-live]").should("have.length", 1);
    });

    it("should inherit values not passed as props", () => {
      cy.mount(
        <ToolkitProvider density="high" mode="dark">
          <TestComponent />
          <ToolkitProvider density="medium">
            <TestComponent id="test-2" />
          </ToolkitProvider>
        </ToolkitProvider>
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
      cy.mount(
        <ToolkitProvider density="high" mode="dark" applyClassesTo={"child"}>
          <TestComponent />
        </ToolkitProvider>
      );

      // cy.mount adds a ToolkitProvider
      cy.get("div.uitk-provider").should("have.length", 1);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "uitk-theme")
        .and("have.class", "uitk-density-high");
    });
  });

  describe("when root is passed to applyClassesTo", () => {
    it("should apply the given theme and density class names to the html element", () => {
      mount(
        <ToolkitProvider density="high" mode="dark" applyClassesTo={"root"}>
          <TestComponent />
        </ToolkitProvider>
      );

      cy.get("uitk-provider").should("have.length", 0);

      cy.get("html")
        .should("exist")
        .and("have.attr", "data-mode", "dark")
        .and("have.class", "uitk-density-high");
    });
  });

  // describe("when a theme is available", () => {
  //   it("provides programatic access to CSS variables", () => {
  //     cy.mount(
  //       <ToolkitProvider density="high" theme="dark">
  //         <TestComponent displayVariableValue={["spacing", "unit"]} />
  //         <ToolkitProvider density="medium">
  //           <TestComponent
  //             displayVariableValue={["spacing", "unit"]}
  //             id="test-2"
  //           />
  //         </ToolkitProvider>
  //       </ToolkitProvider>
  //     );

  //     cy.get("#test-1")
  //       .should("exist")
  //       .and("have.attr", "data-variable-value", "4px");

  //     cy.get("#test-2")
  //       .should("exist")
  //       .and("have.attr", "data-variable-value", "8px");
  //   });
  // });
});
