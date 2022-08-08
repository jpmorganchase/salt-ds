import { Breadcrumbs, Breadcrumb } from "@jpmorganchase/uitk-lab";

describe("GIVEN a Breadcrumbs component", () => {
  describe("WHEN Breadcrumbs are passed as children", () => {
    it("THEN correctly renders the children", () => {
      cy.mount(
        <Breadcrumbs>
          <Breadcrumb>Test</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
    });
  });

  describe("WHEN Breadcrumbs are passed as children", () => {
    it("THEN by default items are not truncated and tooltip doesn't show", () => {
      cy.mount(
        <Breadcrumbs>
          <Breadcrumb>Test 1</Breadcrumb>
          <Breadcrumb>Test 2</Breadcrumb>
          <Breadcrumb>Test 3</Breadcrumb>
        </Breadcrumbs>
      );
      cy.realPress("Tab");
      cy.findByRole("tooltip").should("not.exist");

      cy.realPress("Escape");

      cy.findByText("Test 1").realHover();
      cy.findByRole("tooltip").should("not.exist");
    });
  });

  describe("WHEN passing the hideCurrentLevel prop", () => {
    it("THEN does not render the last Breadcrumb", () => {
      cy.mount(
        <Breadcrumbs hideCurrentLevel>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByText("Test2").should("not.exist");
    });
  });

  describe("WHEN passing more than 3 children", () => {
    it("THEN by default renders the overflow menu", () => {
      cy.mount(
        <Breadcrumbs>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByTestId("menu-trigger-button").should("exist");
      cy.findByText("Test2").should("not.exist");
      cy.findByText("Test3").should("not.exist");
      cy.findByText("Test4").should("exist");
    });
  });

  describe("WHEN passing more children than maxItems prop", () => {
    it("THEN renders the overflow menu", () => {
      cy.mount(
        <Breadcrumbs maxItems={2}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByTestId("menu-trigger-button").should("exist");
      cy.findByText("Test2").should("not.exist");
      cy.findByText("Test3").should("exist");
    });
  });

  describe("WHEN passing more than maxItems children AND passing the itemsBeforeCollapse prop", () => {
    it("THEN renders the overflow menu with the correct number of Breadcrumb before the overflow menu", () => {
      cy.mount(
        <Breadcrumbs itemsBeforeCollapse={2} maxItems={3}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByText("Test2").should("exist");
      cy.findByTestId("menu-trigger-button").should("exist");
      cy.findByText("Test3").should("not.exist");
      cy.findByText("Test4").should("exist");
    });
  });

  describe("WHEN passing more than maxItems children AND passing the itemsAfterCollapse prop", () => {
    it("THEN renders the overflow menu with the correct number of Breadcrumb before the overflow menu", () => {
      cy.mount(
        <Breadcrumbs itemsAfterCollapse={2} maxItems={3}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByTestId("menu-trigger-button").should("exist");
      cy.findByText("Test2").should("not.exist");
      cy.findByText("Test3").should("exist");
      cy.findByText("Test4").should("exist");
    });
  });

  describe("WHEN passing more than maxItems children AND the Breadcrumb is wrapping", () => {
    it("THEN DOES NOT render the overflow menu", () => {
      cy.mount(
        <Breadcrumbs maxItems={3} wrap>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByTestId("menu-trigger-button").should("not.exist");
      cy.findByText("Test2").should("exist");
      cy.findByText("Test3").should("exist");
      cy.findByText("Test4").should("exist");
    });
  });

  describe("WHEN providing a custom separator", () => {
    it("THEN correctly renders the custom separators", () => {
      const customSeparator = <div>Separator</div>;
      cy.mount(
        <Breadcrumbs separator={customSeparator}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test").should("exist");
      cy.findByTestId("menu-trigger-button").should("not.exist");
      cy.findByText("Test2").should("exist");
      cy.findByText("Test3").should("exist");
      cy.findAllByText("Separator").should("have.length", 2);
    });
  });

  describe("WHEN providing the itemsMaxWidth prop", () => {
    it("THEN correctly applies max width styles to all Breadcrumb components", () => {
      const containerProps = { className: "item" };
      cy.mount(
        <Breadcrumbs itemsMaxWidth={10}>
          <Breadcrumb ContainerProps={containerProps}>Test</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test2</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      cy.get(".item")
        .should("have.length", 3)
        .and("have.css", "max-width", "10px");
    });
  });

  describe("WHEN providing the itemsMaxWidth prop AND override it on a Breadcrumb", () => {
    it("THEN correctly override max width", () => {
      cy.mount(
        <Breadcrumbs itemsMaxWidth={10}>
          <Breadcrumb ContainerProps={{ id: "Test1" }} maxWidth={20}>
            Test
          </Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      cy.get("#Test1").should("have.css", "max-width", "20px");
    });
  });

  describe("WHEN providing the itemsMaxWidth prop", () => {
    it("THEN correctly display Tooltip on hover and focus when truncating", () => {
      cy.mount(
        <Breadcrumbs itemsMaxWidth={30}>
          <Breadcrumb href="#">Root Level Entity</Breadcrumb>
          <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
          <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
        </Breadcrumbs>
      );
      cy.wait(1000);

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");

      cy.realPress("Escape");

      cy.get(".uitkText").realHover();
      cy.findByRole("tooltip").should("be.visible");
    });
  });

  describe("WHEN providing the itemsMinWidth prop", () => {
    it("THEN correctly applies min width styles to all Breadcrumb components", () => {
      const containerProps = { className: "item" };
      cy.mount(
        <Breadcrumbs itemsMinWidth={10}>
          <Breadcrumb ContainerProps={containerProps}>Test</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test2</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test3</Breadcrumb>
        </Breadcrumbs>
      );
      cy.get(".item")
        .should("have.length", 3)
        .and("have.css", "min-width", "10px");
    });
  });

  describe("WHEN providing the itemsMinWidth prop AND override it on a Breadcrumb", () => {
    it("THEN correctly override min width", () => {
      cy.mount(
        <Breadcrumbs itemsMinWidth={10}>
          <Breadcrumb ContainerProps={{ id: "Test1" }} minWidth={20}>
            Test
          </Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      cy.get("#Test1").should("have.css", "min-width", "20px");
    });
  });

  describe("WHEN passing 3 children", () => {
    it("THEN first two should be focusable and third should not", () => {
      cy.mount(
        <Breadcrumbs>
          <Breadcrumb>Test1</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      cy.findByText("Test1").should("exist").and("have.attr", "tabIndex", "0");
      cy.findByText("Test2").should("exist").and("have.attr", "tabIndex", "0");
      cy.findByText("Test3").should("exist").and("have.attr", "tabIndex", "-1");
    });
  });
});
