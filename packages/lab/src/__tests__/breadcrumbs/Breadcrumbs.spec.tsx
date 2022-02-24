import React from "react";
import { render } from "@testing-library/react";
import { Breadcrumb, Breadcrumbs } from "../../breadcrumbs";

describe("GIVEN Breadcrumbs", () => {
  describe("WHEN Breadcrumbs are passed as children", () => {
    it("THEN correctly renders the children", () => {
      const { getByText } = render(
        <Breadcrumbs>
          <Breadcrumb>Test</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
    });
  });

  describe("WHEN passing the hideCurrentLevel prop", () => {
    it("THEN does not render the last Breadcrumb", () => {
      const { queryByText, getByText } = render(
        <Breadcrumbs hideCurrentLevel>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(queryByText("Test2")).toBeNull();
    });
  });

  describe("WHEN passing more than 3 children", () => {
    it("THEN by default renders the overflow menu", () => {
      const { getByText, getByTestId, queryByText } = render(
        <Breadcrumbs>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(getByTestId("menu-trigger-button")).toBeDefined();
      expect(queryByText("Test2")).toBeNull();
      expect(queryByText("Test3")).toBeNull();
      expect(getByText("Test4")).toBeDefined();
    });
  });

  describe("WHEN passing more children than maxItems prop", () => {
    it("THEN renders the overflow menu", () => {
      const { getByText, getByTestId, queryByText } = render(
        <Breadcrumbs maxItems={2}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(getByTestId("menu-trigger-button")).toBeDefined();
      expect(queryByText("Test2")).toBeNull();
      expect(getByText("Test3")).toBeDefined();
    });
  });

  describe("WHEN passing more than maxItems children AND passing the itemsBeforeCollapse prop", () => {
    it("THEN renders the overflow menu with the correct number of Breadcrumb before the overflow menu", () => {
      const { getByText, getByTestId, queryByText } = render(
        <Breadcrumbs itemsBeforeCollapse={2} maxItems={3}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(getByText("Test2")).toBeDefined();
      expect(getByTestId("menu-trigger-button")).toBeDefined();
      expect(queryByText("Test3")).toBeNull();
      expect(getByText("Test4")).toBeDefined();
    });
  });

  describe("WHEN passing more than maxItems children AND passing the itemsAfterCollapse prop", () => {
    it("THEN renders the overflow menu with the correct number of Breadcrumb before the overflow menu", () => {
      const { getByText, getByTestId, queryByText } = render(
        <Breadcrumbs itemsAfterCollapse={2} maxItems={3}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(getByTestId("menu-trigger-button")).toBeDefined();
      expect(queryByText("Test2")).toBeNull();
      expect(getByText("Test3")).toBeDefined();
      expect(getByText("Test4")).toBeDefined();
    });
  });

  describe("WHEN passing more than maxItems children AND the Breadcrumb is wrapping", () => {
    it("THEN DOES NOT render the overflow menu", () => {
      const { getByText, queryByTestId } = render(
        <Breadcrumbs maxItems={3} wrap>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
          <Breadcrumb>Test4</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(queryByTestId("menu-trigger-button")).toBeNull();
      expect(getByText("Test2")).toBeDefined();
      expect(getByText("Test3")).toBeDefined();
      expect(getByText("Test4")).toBeDefined();
    });
  });

  describe("WHEN providing a custom separator", () => {
    it("THEN correctly renders the custom separators", () => {
      const customSeparator = <div>Separator</div>;
      const { getByText, queryByTestId, getAllByText } = render(
        <Breadcrumbs separator={customSeparator}>
          <Breadcrumb>Test</Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      expect(getByText("Test")).toBeDefined();
      expect(queryByTestId("menu-trigger-button")).toBeNull();
      expect(getByText("Test2")).toBeDefined();
      expect(getByText("Test3")).toBeDefined();
      expect(getAllByText("Separator").length).toBe(2);
    });
  });

  describe("WHEN providing the itemsMaxWidth prop", () => {
    it("THEN correctly applies max width styles to all Breadcrumb components", () => {
      const containerProps = { className: "item" };
      const { container } = render(
        <Breadcrumbs itemsMaxWidth={10}>
          <Breadcrumb ContainerProps={containerProps}>Test</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test2</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      const listItems = container.querySelectorAll(".item");
      listItems.forEach((item) =>
        expect((item as HTMLElement).style.maxWidth).toBe("10px")
      );
    });
  });

  describe("WHEN providing the itemsMaxWidth prop AND override it on a Breadcrumb", () => {
    it("THEN correctly override max width", () => {
      const { container } = render(
        <Breadcrumbs itemsMaxWidth={10}>
          <Breadcrumb ContainerProps={{ id: "Test1" }} maxWidth={20}>
            Test
          </Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      const test1 = container.querySelector("#Test1");
      expect((test1 as HTMLElement).style.maxWidth).toBe("20px");
    });
  });

  describe("WHEN providing the itemsMinWidth prop", () => {
    it("THEN correctly applies min width styles to all Breadcrumb components", () => {
      const containerProps = { className: "item" };
      const { container } = render(
        <Breadcrumbs itemsMinWidth={10}>
          <Breadcrumb ContainerProps={containerProps}>Test</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test2</Breadcrumb>
          <Breadcrumb ContainerProps={containerProps}>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      const listItems = container.querySelectorAll(".item");
      listItems.forEach((item) =>
        expect((item as HTMLElement).style.minWidth).toBe("10px")
      );
    });
  });

  describe("WHEN providing the itemsMinWidth prop AND override it on a Breadcrumb", () => {
    it("THEN correctly override min width", () => {
      const { container } = render(
        <Breadcrumbs itemsMinWidth={10}>
          <Breadcrumb ContainerProps={{ id: "Test1" }} minWidth={20}>
            Test
          </Breadcrumb>
          <Breadcrumb>Test2</Breadcrumb>
          <Breadcrumb>Test3</Breadcrumb>
        </Breadcrumbs>
      );

      const test1 = container.querySelector("#Test1");
      expect((test1 as HTMLElement).style.minWidth).toBe("20px");
    });
  });
});
