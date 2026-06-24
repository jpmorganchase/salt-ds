import {
  BreadcrumbNext,
  BreadcrumbNextLabel,
  BreadcrumbNextTrigger,
  BreadcrumbsNext,
} from "@salt-ds/lab";
import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";

const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<"a">>(
  function RouterLink(props, ref) {
    return <a {...props} data-router-link="" ref={ref} />;
  },
);

function CollapsedRouterBreadcrumbs({
  onNavigate,
}: {
  onNavigate: (event: unknown) => void;
}) {
  const MenuRouterLink = forwardRef<
    HTMLAnchorElement,
    ComponentPropsWithoutRef<"a">
  >(function MenuRouterLink({ onClick, ...rest }, ref) {
    return (
      <RouterLink
        {...rest}
        onClick={(event) => {
          onClick?.(event);
          onNavigate(event);
        }}
        ref={ref}
      />
    );
  });

  return (
    <BreadcrumbsNext maxItems={3}>
      <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
      <BreadcrumbNext
        href="#level-2"
        render={(linkProps) => <MenuRouterLink {...linkProps} />}
      >
        Level 2 Entity
      </BreadcrumbNext>
      <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
      <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
    </BreadcrumbsNext>
  );
}

describe("GIVEN a BreadcrumbsNext", () => {
  it("THEN renders a named navigation landmark with an ordered list", () => {
    cy.mount(
      <BreadcrumbsNext aria-label="Breadcrumb">
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("navigation", { name: "Breadcrumb" }).should("exist");
    cy.findByRole("list").should("match", "ol");
    cy.findAllByRole("listitem").should("have.length", 3);
    cy.get(".saltBreadcrumbNext-content").should("not.exist");
    cy.findByRole("link", { name: "Root Level Entity" }).should(
      "have.attr",
      "href",
      "#root",
    );
    cy.findByRole("link", { name: "Level 2 Entity" }).should(
      "have.attr",
      "href",
      "#level-2",
    );
    cy.findByText("Current Level Entity")
      .parents(".saltBreadcrumbNext-current")
      .should("have.attr", "aria-current", "page");
    cy.get(".saltBreadcrumbNext-separator")
      .should("have.length", 2)
      .and("have.attr", "aria-hidden", "true");
  });

  it("THEN supports native landmark labelling props", () => {
    cy.mount(
      <>
        <span id="breadcrumb-label">Page location</span>
        <BreadcrumbsNext aria-labelledby="breadcrumb-label">
          <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
        <BreadcrumbsNext aria-label="Secondary path">
          <BreadcrumbNext>Secondary Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
      </>,
    );

    cy.findByRole("navigation", { name: "Page location" }).should("exist");
    cy.findByRole("navigation", { name: "Secondary path" }).should("exist");
  });

  it("THEN defaults the final item to current and respects an explicit current item", () => {
    cy.mount(
      <>
        <BreadcrumbsNext>
          <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
          <BreadcrumbNext>Default Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
        <BreadcrumbsNext>
          <BreadcrumbNext href="#root">Second Root Level Entity</BreadcrumbNext>
          <BreadcrumbNext current>Explicit Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
      </>,
    );

    cy.findByText("Default Current Level Entity")
      .parents(".saltBreadcrumbNext-current")
      .should("have.attr", "aria-current", "page");
    cy.findByText("Explicit Current Level Entity")
      .parents(".saltBreadcrumbNext-current")
      .should("have.attr", "aria-current", "page");
  });

  it("THEN keeps explicit current items out of the link focus order", () => {
    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext current href="#level-2">
          Current Level Entity
        </BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Root Level Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
  });

  it("THEN renders non-current items without navigation as text", () => {
    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext current>Current Level Entity</BreadcrumbNext>
        <BreadcrumbNext>Non navigable Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("link", { name: "Non navigable Level Entity" }).should(
      "not.exist",
    );
    cy.findByText("Non navigable Level Entity")
      .parents(".saltBreadcrumbNext-trigger")
      .should("not.have.class", "saltBreadcrumbNext-link")
      .and("not.have.attr", "aria-current");
  });

  it("THEN supports router render props for visible links", () => {
    const mockRender = cy
      .stub()
      .as("render")
      .callsFake((props) => <RouterLink {...props} />);

    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext href="/root" render={mockRender}>
          Root Level Entity
        </BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("link", { name: "Root Level Entity" })
      .should("have.attr", "href", "/root")
      .and("have.attr", "data-router-link");
    cy.get("@render").should("have.been.calledWithMatch", {
      className: Cypress.sinon.match.string,
      href: "/root",
    });
  });

  it("THEN supports label shorthand and explicit trigger composition", () => {
    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext href="#root" label="Root Level Entity" />
        <BreadcrumbNext href="#level-2" label="Level 2 Entity">
          <BreadcrumbNextTrigger data-testid="custom-trigger">
            <span aria-hidden>Icon</span>
            <BreadcrumbNextLabel>Custom Level 2 Entity</BreadcrumbNextLabel>
          </BreadcrumbNextTrigger>
        </BreadcrumbNext>
        <BreadcrumbNext label="Current Level Entity" />
      </BreadcrumbsNext>,
    );

    cy.findByRole("link", { name: "Root Level Entity" }).should(
      "have.attr",
      "href",
      "#root",
    );
    cy.findByTestId("custom-trigger")
      .should("have.attr", "href", "#level-2")
      .and("have.text", "IconCustom Level 2 Entity");
    cy.findByText("Current Level Entity")
      .parents(".saltBreadcrumbNext-current")
      .should("have.attr", "aria-current", "page");
  });

  it("THEN does not render placeholder text for empty children", () => {
    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext />
      </BreadcrumbsNext>,
    );

    cy.findByText("I am BreadcrumbNext").should("not.exist");
  });

  it("THEN keeps keyboard focus order as visible link order", () => {
    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Root Level Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
  });

  it("THEN does not collapse without a maxItems threshold", () => {
    cy.mount(
      <BreadcrumbsNext>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("button", { name: "Show breadcrumb levels" }).should(
      "not.exist",
    );
    cy.findByText("Level 2 Entity").should("exist");
    cy.findByText("Level 3 Entity").should("exist");
  });

  it("THEN collapses the middle range when the threshold is exceeded", () => {
    cy.mount(
      <BreadcrumbsNext maxItems={3}>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByText("Root Level Entity").should("exist");
    cy.findByText("Level 2 Entity").should("not.exist");
    cy.findByText("Level 3 Entity").should("not.exist");
    cy.findByText("Current Level Entity").should("exist");
    cy.findByRole("button", { name: "Show breadcrumb levels" }).should("exist");
  });

  it("THEN supports custom collapse ranges and overflow at the start", () => {
    cy.mount(
      <>
        <BreadcrumbsNext
          itemsAfterCollapse={2}
          itemsBeforeCollapse={2}
          maxItems={4}
        >
          <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
          <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
          <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
          <BreadcrumbNext href="#level-4">Level 4 Entity</BreadcrumbNext>
          <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
        <BreadcrumbsNext itemsBeforeCollapse={0} maxItems={3}>
          <BreadcrumbNext href="#start-root">
            Start Root Level Entity
          </BreadcrumbNext>
          <BreadcrumbNext href="#start-level-2">
            Start Level 2 Entity
          </BreadcrumbNext>
          <BreadcrumbNext href="#start-level-3">
            Start Level 3 Entity
          </BreadcrumbNext>
          <BreadcrumbNext>Start Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
      </>,
    );

    cy.findByText("Root Level Entity").should("exist");
    cy.findByText("Level 2 Entity").should("exist");
    cy.findByText("Level 3 Entity").should("not.exist");
    cy.findByText("Level 4 Entity").should("exist");
    cy.findByText("Current Level Entity").should("exist");

    cy.findByText("Start Root Level Entity").should("not.exist");
    cy.findByText("Start Level 2 Entity").should("not.exist");
    cy.findByText("Start Level 3 Entity").should("not.exist");
    cy.findByText("Start Current Level Entity").should("exist");
  });

  it("THEN does not collapse when wrapping or when the configuration hides no items", () => {
    cy.mount(
      <>
        <BreadcrumbsNext maxItems={2} wrap>
          <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
          <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
          <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
        <BreadcrumbsNext
          itemsAfterCollapse={2}
          itemsBeforeCollapse={2}
          maxItems={3}
        >
          <BreadcrumbNext href="#other-root">
            Other Root Level Entity
          </BreadcrumbNext>
          <BreadcrumbNext href="#other-level-2">
            Other Level 2 Entity
          </BreadcrumbNext>
          <BreadcrumbNext>Other Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
      </>,
    );

    cy.findAllByRole("button", { name: "Show breadcrumb levels" }).should(
      "have.length",
      0,
    );
    cy.findByText("Level 2 Entity").should("exist");
    cy.findByText("Other Level 2 Entity").should("exist");
  });

  it("THEN renders hidden breadcrumb levels in menu order with navigation", () => {
    const onNavigate = cy.stub().as("onNavigate");

    cy.mount(<CollapsedRouterBreadcrumbs onNavigate={onNavigate} />);

    cy.findByRole("button", { name: "Show breadcrumb levels" }).focus();
    cy.realPress("Enter");
    cy.findAllByRole("menuitem").then((items) => {
      expect(items[0]).to.have.text("Level 2 Entity");
      expect(items[1]).to.have.text("Level 3 Entity");
    });
    cy.findByRole("link", { name: "Level 2 Entity" })
      .should("have.attr", "href", "#level-2")
      .and("have.attr", "data-router-link");
    cy.findByRole("menuitem", { name: "Level 2 Entity" }).should("be.focused");
    cy.realPress("Enter");
    cy.get("@onNavigate").should("have.been.calledOnce");
  });

  it("THEN activates hidden breadcrumb router links once with Space", () => {
    const onNavigate = cy.stub().as("onNavigate");

    cy.mount(<CollapsedRouterBreadcrumbs onNavigate={onNavigate} />);

    cy.findByRole("button", { name: "Show breadcrumb levels" }).focus();
    cy.realPress("Enter");
    cy.findByRole("menuitem", { name: "Level 2 Entity" }).should("be.focused");
    cy.realPress("Space");
    cy.get("@onNavigate").should("have.been.calledOnce");
  });

  it("THEN activates hidden breadcrumb router links once from menu item clicks", () => {
    const onNavigate = cy.stub().as("onNavigate");

    cy.mount(<CollapsedRouterBreadcrumbs onNavigate={onNavigate} />);

    cy.findByRole("button", { name: "Show breadcrumb levels" }).realClick();
    cy.findByRole("menuitem", { name: "Level 2 Entity" }).trigger("click");
    cy.get("@onNavigate").should("have.been.calledOnce");
  });

  it("THEN activates hidden breadcrumb router links once from direct link clicks", () => {
    const onNavigate = cy.stub().as("onNavigate");

    cy.mount(<CollapsedRouterBreadcrumbs onNavigate={onNavigate} />);

    cy.findByRole("button", { name: "Show breadcrumb levels" }).realClick();
    cy.findByRole("link", { name: "Level 2 Entity" }).realClick();
    cy.get("@onNavigate").should("have.been.calledOnce");
  });

  it("THEN renders composed hidden breadcrumb levels in the menu", () => {
    cy.mount(
      <BreadcrumbsNext maxItems={3}>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext
          href="/level-2"
          label="Level 2 Entity"
          render={(linkProps) => <RouterLink {...linkProps} />}
        >
          <BreadcrumbNextTrigger>
            <span aria-hidden>Icon</span>
            <BreadcrumbNextLabel>Custom Level 2 Entity</BreadcrumbNextLabel>
          </BreadcrumbNextTrigger>
        </BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("button", { name: "Show breadcrumb levels" }).realClick();
    cy.findByRole("link", { name: "Level 2 Entity" })
      .should("have.attr", "href", "/level-2")
      .and("have.attr", "data-router-link");
    cy.findByRole("menuitem", { name: "Level 2 Entity" }).should("exist");
    cy.findByRole("menuitem", { name: "Custom Level 2 Entity" }).should(
      "not.exist",
    );
  });

  it("THEN reveals hidden breadcrumbs with uncontrolled inline expansion", () => {
    cy.mount(
      <BreadcrumbsNext collapseMode="expand" maxItems={3}>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByText("Level 2 Entity").should("not.exist");
    cy.findByText("Level 3 Entity").should("not.exist");
    cy.findByRole("button", { name: "Show all breadcrumbs" }).realClick();
    cy.findByText("Level 2 Entity").should("exist");
    cy.findByText("Level 3 Entity").should("exist");
  });

  it("THEN moves focus to the first revealed breadcrumb after keyboard inline expansion", () => {
    cy.mount(
      <BreadcrumbsNext collapseMode="expand" maxItems={3}>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2">Level 2 Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("button", { name: "Show all breadcrumbs" }).focus();
    cy.realPress("Space");
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
  });

  it("THEN skips newly revealed breadcrumbs that are not focusable after keyboard inline expansion", () => {
    cy.mount(
      <BreadcrumbsNext collapseMode="expand" maxItems={3}>
        <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
        <BreadcrumbNext href="#level-2" label="Level 2 Entity">
          <BreadcrumbNextTrigger tabIndex={-1}>
            <BreadcrumbNextLabel>Level 2 Entity</BreadcrumbNextLabel>
          </BreadcrumbNextTrigger>
        </BreadcrumbNext>
        <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
        <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
      </BreadcrumbsNext>,
    );

    cy.findByRole("button", { name: "Show all breadcrumbs" }).focus();
    cy.realPress("Space");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
  });

  it("THEN supports controlled inline expansion and router render props after expansion", () => {
    const onExpandedChange = cy.stub().as("onExpandedChange");

    function ControlledBreadcrumbsNext() {
      const [expanded, setExpanded] = useState(false);

      return (
        <BreadcrumbsNext
          collapseMode="expand"
          expanded={expanded}
          maxItems={3}
          onExpandedChange={(event, nextExpanded) => {
            onExpandedChange(event, nextExpanded);
            setExpanded(nextExpanded);
          }}
        >
          <BreadcrumbNext href="#root">Root Level Entity</BreadcrumbNext>
          <BreadcrumbNext
            href="/level-2"
            render={(linkProps) => <RouterLink {...linkProps} />}
          >
            Level 2 Entity
          </BreadcrumbNext>
          <BreadcrumbNext href="#level-3">Level 3 Entity</BreadcrumbNext>
          <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
        </BreadcrumbsNext>
      );
    }

    cy.mount(<ControlledBreadcrumbsNext />);
    cy.findByText("Level 2 Entity").should("not.exist");
    cy.findByRole("button", { name: "Show all breadcrumbs" }).realClick();
    cy.get("@onExpandedChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      true,
    );
    cy.findByRole("link", { name: "Level 2 Entity" })
      .should("have.attr", "href", "/level-2")
      .and("have.attr", "data-router-link");
  });
});
