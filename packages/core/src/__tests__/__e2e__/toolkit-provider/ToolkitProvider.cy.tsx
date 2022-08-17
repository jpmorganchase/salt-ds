import { useContext } from "react";
import {
  characteristic,
  useAriaAnnouncer,
  ToolkitContext,
  ToolkitProvider,
  useDensity,
  useTheme,
} from "@jpmorganchase/uitk-core";

const TestComponent = ({
  id = "test-1",
  className = "",
  displayVariableValue,
}: {
  id?: string;
  className?: string;
  displayVariableValue?: [characteristic, string];
}) => {
  const density = useDensity();
  const themes = useTheme();
  const { announce } = useAriaAnnouncer();
  const announcerPresent = typeof announce === "function";
  const [theme] = themes;
  let variableValue;

  if (theme && displayVariableValue) {
    const [characteristicName, variant] = displayVariableValue;
    variableValue = theme.getCharacteristicValue(characteristicName, variant);
  }

  return (
    <div
      id={id}
      className={className}
      data-density={density}
      data-theme={theme?.id}
      data-variable-value={variableValue}
      data-announcer={announcerPresent}
    />
  );
};

describe("Given a ToolkitProvider", () => {
  describe("with no props set", () => {
    it("should create uitk-theme element with correct classes applied", () => {
      cy.mount(
        <ToolkitProvider>
          <TestComponent />
        </ToolkitProvider>
      );

      cy.get("uitk-theme")
        .should("have.length", 2)
        .and("have.attr", "class", "uitk-light uitk-density-medium");
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
        .and("have.attr", "data-theme", "uitk-light")
        .and("have.attr", "data-announcer", "true");
      cy.get("[aria-live]").should("exist");
    });
  });

  describe("with props set", () => {
    it("should apply correct default value for Density and add an AriaAnnouncer", () => {
      cy.mount(
        <ToolkitProvider theme="dark">
          <TestComponent />
        </ToolkitProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-theme", "uitk-dark")
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
        .and("have.attr", "data-theme", "uitk-light")
        .and("have.attr", "data-announcer", "true");
    });

    it("should apply values specified in props", () => {
      cy.mount(
        <ToolkitProvider density="high" theme="dark">
          <TestComponent />
        </ToolkitProvider>
      );
      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-theme", "uitk-dark")
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
        <ToolkitProvider density="high" theme="dark">
          <TestComponent />
          <ToolkitProvider density="medium">
            <TestComponent id="test-2" />
          </ToolkitProvider>
        </ToolkitProvider>
      );

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "data-density", "high")
        .and("have.attr", "data-theme", "uitk-dark")
        .and("have.attr", "data-announcer", "true");

      cy.get("#test-2")
        .should("exist")
        .and("have.attr", "data-density", "medium")
        .and("have.attr", "data-theme", "uitk-dark")
        .and("have.attr", "data-announcer", "true");
    });
  });

  describe("when applyClassesToChild is true", () => {
    it("should not create a uitk-theme element", () => {
      cy.mount(
        <ToolkitProvider density="high" theme="dark" applyClassesToChild>
          <TestComponent />
        </ToolkitProvider>
      );

      // cy.mount adds a ToolkitProvider
      cy.get("uitk-theme").should("have.length", 1);

      cy.get("#test-1")
        .should("exist")
        .and("have.attr", "class", "uitk-dark uitk-density-high");
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
