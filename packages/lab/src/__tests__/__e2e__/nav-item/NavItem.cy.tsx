import { NavItem } from "@salt-ds/lab";

describe("GIVEN a NavItem", () => {
  describe("AND `href` is passed", () => {
    it("should render a link with a href", () => {
      cy.mount(
        <NavItem href="https://www.saltdesignsystem.com">NavItem</NavItem>
      );
      cy.findByRole("link").should(
        "have.attr",
        "href",
        "https://www.saltdesignsystem.com"
      );
    });
  });

  describe("AND it is active", () => {
    it('sets `aria-current="page"` when `active` is true', () => {
      cy.mount(
        <NavItem href="#" active={true}>
          NavItem
        </NavItem>
      );
      cy.findByRole("link").should("have.attr", "aria-current", "page");
    });

    it("should not have `aria-current` when `active` is false", () => {
      cy.mount(
        <NavItem href="#" active={false}>
          NavItem
        </NavItem>
      );
      cy.findByRole("link").should("not.have.attr", "aria-current");
    });
  });

  describe("AND `children` is passed", () => {
    it("should render the children as the label", () => {
      cy.mount(<NavItem>NavItem</NavItem>);
      cy.findByText("NavItem").should("exist");
    });
  });

  describe("AND it is a parent", () => {
    it("should render an expansion button", () => {
      cy.mount(<NavItem parent={true}>NavItem</NavItem>);
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
        <NavItem parent={true} onExpand={expandSpy}>
          NavItem
        </NavItem>
      );
      cy.findByRole("button", { name: "expand" }).realClick();
      cy.get("@expandSpy").should("have.been.calledOnce");
    });

    describe("AND it is expanded", () => {
      it("should set `aria-expanded` to `true`", () => {
        cy.mount(
          <NavItem parent={true} expanded={true}>
            NavItem
          </NavItem>
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
