import { NavigationItem } from "@salt-ds/lab";
import { NotificationIcon } from "@salt-ds/icons";

describe("GIVEN a NavItem", () => {
  describe("AND `href` is passed", () => {
    it("should render a link with a href", () => {
      cy.mount(
        <NavigationItem href="https://www.saltdesignsystem.com">
          Navigation Item
        </NavigationItem>
      );
      cy.findByRole("link").should(
        "have.attr",
        "href",
        "https://www.saltdesignsystem.com"
      );
    });
  });

  describe("AND `href` is NOT passed", () => {
    it("should render a button", () => {
      cy.mount(<NavigationItem>Navigation Item</NavigationItem>);
      cy.findByRole("button").should("exist");
    });
  });

  describe("AND it is active", () => {
    it('sets `aria-current="page"` when `active` is true', () => {
      cy.mount(
        <NavigationItem href="#" active={true}>
          Navigation Item
        </NavigationItem>
      );
      cy.findByRole("link").should("have.attr", "aria-current", "page");
    });

    it("should not have `aria-current` when `active` is false", () => {
      cy.mount(
        <NavigationItem href="#" active={false}>
          Navigation Item
        </NavigationItem>
      );
      cy.findByRole("link").should("not.have.attr", "aria-current");
    });
  });

  describe("AND `children` is passed", () => {
    it("should render the children as the label", () => {
      cy.mount(<NavigationItem>Navigation Item</NavigationItem>);
      cy.findByText("Navigation Item").should("exist");
    });
  });

  describe("AND an icon is passed", () => {
    it("should render the icon component", () => {
      cy.mount(
        <NavigationItem>
          <NotificationIcon />
          Navigation Item
        </NavigationItem>
      );
      cy.get('[data-testid="NotificationIcon"]').should("exist");
    });
  });

  describe("AND it is a parent", () => {
    it("should render an expansion button", () => {
      cy.mount(<NavigationItem parent={true}>Navigation Item</NavigationItem>);
      cy.findByRole("button", { name: "expand" }).should("exist");
      cy.findByRole("button", { name: "expand" }).should(
        "have.attr",
        "aria-expanded",
        "false"
      );
    });

    it("should call `onExpand` when the expansion button is clicked", () => {
      const expandSpy = cy.stub().as("expandSpy");
      cy.mount(
        <NavigationItem parent={true} onExpand={expandSpy}>
          Navigation Item
        </NavigationItem>
      );
      cy.findByRole("button", { name: "expand" }).realClick();
      cy.get("@expandSpy").should("have.been.calledOnce");
    });

    describe("AND it is expanded", () => {
      it("should set `aria-expanded` to `true`", () => {
        cy.mount(
          <NavigationItem parent={true} expanded={true}>
            Navigation Item
          </NavigationItem>
        );
        cy.findByRole("button", { name: "expand" }).should(
          "have.attr",
          "aria-expanded",
          "true"
        );
      });
    });
  });
});
