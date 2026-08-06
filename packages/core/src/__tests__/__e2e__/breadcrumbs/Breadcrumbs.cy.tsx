import {
  Breadcrumb,
  BreadcrumbLabel,
  Breadcrumbs,
  BreadcrumbTrigger,
  Tooltip,
} from "@salt-ds/core";
import { type ComponentPropsWithoutRef, Fragment, forwardRef } from "react";

const TestRouterLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<"a">
>(function TestRouterLink(props, ref) {
  const { onClick, ...rest } = props;

  return (
    <a
      ref={ref}
      {...rest}
      href={rest.href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
});

function CollapsedBreadcrumbs({
  levelTwoHref = "#level-2",
}: {
  levelTwoHref?: string;
}) {
  return (
    <Breadcrumbs maxItems={3}>
      <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
      <Breadcrumb href={levelTwoHref}>Level 2 Entity</Breadcrumb>
      <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
      <Breadcrumb>Current Level Entity</Breadcrumb>
    </Breadcrumbs>
  );
}

describe("GIVEN a Breadcrumbs", () => {
  it("THEN renders a named navigation landmark with an ordered list", () => {
    cy.mount(
      <Breadcrumbs aria-label="Breadcrumb">
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("navigation", { name: "Breadcrumb" }).should("exist");
    cy.findByRole("list").should("match", "ol");
    cy.findAllByRole("listitem").should("have.length", 3);
    cy.get(".saltBreadcrumb-content").should("not.exist");
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
      .parents(".saltBreadcrumb-current")
      .should("have.attr", "aria-current", "page");
    cy.get(".saltBreadcrumb-separator")
      .should("have.length", 2)
      .and("have.attr", "aria-hidden", "true");
  });

  it("THEN supports native landmark labelling props", () => {
    cy.mount(
      <>
        <span id="breadcrumb-label">Page location</span>
        <Breadcrumbs aria-labelledby="breadcrumb-label">
          <Breadcrumb>Current Level Entity</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs aria-label="Secondary path">
          <Breadcrumb>Secondary Current Level Entity</Breadcrumb>
        </Breadcrumbs>
      </>,
    );

    cy.findByRole("navigation", { name: "Page location" }).should("exist");
    cy.findByRole("navigation", { name: "Secondary path" }).should("exist");
  });

  it("THEN defaults the final item to current and respects an explicit current item", () => {
    cy.mount(
      <>
        <Breadcrumbs>
          <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
          <Breadcrumb>Default Current Level Entity</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs>
          <Breadcrumb href="#root">Second Root Level Entity</Breadcrumb>
          <Breadcrumb current>Explicit Current Level Entity</Breadcrumb>
        </Breadcrumbs>
      </>,
    );

    cy.findByText("Default Current Level Entity")
      .parents(".saltBreadcrumb-current")
      .should("have.attr", "aria-current", "page");
    cy.findByText("Explicit Current Level Entity")
      .parents(".saltBreadcrumb-current")
      .should("have.attr", "aria-current", "page");
    cy.findByRole("link", { name: "Default Current Level Entity" }).should(
      "not.exist",
    );
    cy.findByRole("link", { name: "Explicit Current Level Entity" }).should(
      "not.exist",
    );
  });

  it("THEN keeps linked current items in the focus order with aria-current", () => {
    cy.mount(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb current href="#level-2">
          Current Level Entity
        </Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Root Level Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Current Level Entity" })
      .should("be.focused")
      .and("have.attr", "aria-current", "page");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
  });

  it("THEN renders linked current items without link visual treatment", () => {
    cy.mount(
      <>
        <Breadcrumbs>
          <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
          <Breadcrumb current href="#level-2">
            Current Level Entity
          </Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs>
          <Breadcrumb href="#other-root">Other Root Level Entity</Breadcrumb>
          <Breadcrumb current>Placeholder Current Level Entity</Breadcrumb>
        </Breadcrumbs>
      </>,
    );

    cy.findByText("Placeholder Current Level Entity")
      .parents(".saltBreadcrumb-current")
      .then(($text) => {
        const textColor = getComputedStyle($text[0]).color;

        cy.findByRole("link", { name: "Current Level Entity" })
          .as("currentLink")
          .should("have.class", "saltBreadcrumb-current")
          .and("have.attr", "href", "#level-2")
          .should(($link) => {
            const styles = getComputedStyle($link[0]);

            expect(styles.textDecorationLine).to.equal("none");
            expect(styles.cursor).to.equal("text");
            expect(styles.color).to.equal(textColor);
          });
      });

    cy.get("@currentLink")
      .realHover()
      .should(($link) => {
        expect(getComputedStyle($link[0]).textDecorationLine).to.equal("none");
      });
    cy.get("@currentLink")
      .focus()
      .should(($link) => {
        expect(getComputedStyle($link[0]).textDecorationLine).to.equal("none");
      });
  });

  it("THEN renders non-current items without navigation as placeholder links", () => {
    cy.mount(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb current>Current Level Entity</Breadcrumb>
        <Breadcrumb>Non navigable Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("link", { name: "Non navigable Level Entity" }).should(
      "not.exist",
    );
    cy.findByText("Non navigable Level Entity")
      .parents(".saltBreadcrumb-trigger")
      .should("match", "a")
      .and("not.have.class", "saltBreadcrumb-link")
      .and("not.have.attr", "aria-current");
  });

  it("THEN supports text children shorthand and explicit trigger composition", () => {
    cy.mount(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">
          <BreadcrumbTrigger data-testid="custom-trigger">
            <span aria-hidden>Icon</span>
            <BreadcrumbLabel>Custom Level 2 Entity</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
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
      .parents(".saltBreadcrumb-current")
      .should("have.attr", "aria-current", "page");
  });

  it("THEN supports routed links for shorthand and composed breadcrumb triggers", () => {
    const render = cy
      .stub()
      .as("render")
      .callsFake((props: ComponentPropsWithoutRef<"a">) => (
        <TestRouterLink {...props} data-router-link="shared" />
      ));

    cy.mount(
      <Breadcrumbs render={render}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">
          <BreadcrumbTrigger data-testid="composed-trigger">
            <BreadcrumbLabel>Level 2 Entity</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("link", { name: "Root Level Entity" })
      .should("have.attr", "data-router-link", "shared")
      .and("have.attr", "href", "#root");
    cy.findByTestId("composed-trigger")
      .should("have.attr", "data-router-link", "shared")
      .and("have.attr", "href", "#level-2");
    cy.get("@render").should("have.been.called");
  });

  it("THEN does not invoke custom renderers for non-navigable items", () => {
    const render = cy
      .stub()
      .as("render")
      .callsFake((props: ComponentPropsWithoutRef<"a">) => (
        <TestRouterLink {...props} />
      ));

    cy.mount(
      <Breadcrumbs render={render}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("link", { name: "Root Level Entity" }).should("exist");
    cy.findByRole("link", { name: "Current Level Entity" }).should("not.exist");
    cy.findByText("Current Level Entity")
      .parents(".saltBreadcrumb-trigger")
      .should("match", "a")
      .should("not.have.attr", "href");
    cy.get("@render").should((stub) => {
      expect(stub).to.have.been.called;

      for (const call of (stub as unknown as sinon.SinonStub).getCalls()) {
        expect(call.args[0].href, "renderer only receives navigable items").to
          .not.be.undefined;
      }
    });
  });

  it("THEN lets item render override the shared routed link renderer", () => {
    cy.mount(
      <Breadcrumbs render={<TestRouterLink data-router-link="shared" />}>
        <Breadcrumb
          href="#root"
          render={<TestRouterLink data-router-link="item" />}
        >
          Root Level Entity
        </Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("link", { name: "Root Level Entity" }).should(
      "have.attr",
      "data-router-link",
      "item",
    );
    cy.findByRole("link", { name: "Level 2 Entity" }).should(
      "have.attr",
      "data-router-link",
      "shared",
    );
  });

  it("THEN warns for empty breadcrumb children without rendering placeholder text", () => {
    cy.stub(console, "warn").as("warn");

    cy.mount(
      <Breadcrumbs>
        <Breadcrumb />
      </Breadcrumbs>,
    );

    cy.get("@warn").should(
      "have.been.calledWith",
      Cypress.sinon.match("Breadcrumb requires children"),
    );
    cy.findByText("I am Breadcrumb").should("not.exist");
    cy.get("a").should("not.exist");
  });

  it("THEN keeps keyboard focus order as visible link order", () => {
    cy.mount(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Root Level Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
  });

  it("THEN does not collapse without a maxItems threshold", () => {
    cy.mount(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" }).should(
      "not.exist",
    );
    cy.findByText("Level 2 Entity").should("exist");
    cy.findByText("Level 3 Entity").should("exist");
  });

  it("THEN collapses the middle range when the threshold is exceeded", () => {
    cy.mount(
      <Breadcrumbs maxItems={3}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByText("Root Level Entity").should("exist");
    cy.findByText("Level 2 Entity").should("not.exist");
    cy.findByText("Level 3 Entity").should("not.exist");
    cy.findByText("Current Level Entity").should("exist");
    cy.findByRole("button", { name: "Additional breadcrumbs" }).should("exist");
    cy.findByRole("button", { name: "Show all breadcrumbs" }).should(
      "not.exist",
    );
  });

  it("THEN supports custom collapse ranges and overflow at the start", () => {
    cy.mount(
      <>
        <Breadcrumbs
          itemsAfterCollapse={2}
          itemsBeforeCollapse={2}
          maxItems={4}
        >
          <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
          <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
          <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
          <Breadcrumb href="#level-4">Level 4 Entity</Breadcrumb>
          <Breadcrumb>Current Level Entity</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs itemsBeforeCollapse={0} maxItems={3}>
          <Breadcrumb href="#start-root">Start Root Level Entity</Breadcrumb>
          <Breadcrumb href="#start-level-2">Start Level 2 Entity</Breadcrumb>
          <Breadcrumb href="#start-level-3">Start Level 3 Entity</Breadcrumb>
          <Breadcrumb>Start Current Level Entity</Breadcrumb>
        </Breadcrumbs>
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
        <Breadcrumbs maxItems={2} wrap>
          <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
          <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
          <Breadcrumb>Current Level Entity</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs
          itemsAfterCollapse={2}
          itemsBeforeCollapse={2}
          maxItems={3}
        >
          <Breadcrumb href="#other-root">Other Root Level Entity</Breadcrumb>
          <Breadcrumb href="#other-level-2">Other Level 2 Entity</Breadcrumb>
          <Breadcrumb>Other Current Level Entity</Breadcrumb>
        </Breadcrumbs>
      </>,
    );

    cy.findAllByRole("button", { name: "Additional breadcrumbs" }).should(
      "have.length",
      0,
    );
    cy.findByText("Level 2 Entity").should("exist");
    cy.findByText("Other Level 2 Entity").should("exist");
  });

  it("THEN opens hidden breadcrumb disclosure without moving focus from the trigger", () => {
    cy.mount(<CollapsedBreadcrumbs />);

    cy.findByRole("button", { name: "Additional breadcrumbs" })
      .as("trigger")
      .focus();
    cy.realPress("Enter");
    cy.get("@trigger")
      .should("be.focused")
      .and("have.attr", "aria-expanded", "true");
    cy.findByRole("list", { name: "Hidden breadcrumb levels" }).within(() => {
      cy.findAllByRole("listitem").then((items) => {
        expect(items[0]).to.have.text("Level 2 Entity");
        expect(items[1]).to.have.text("Level 3 Entity");
      });
    });

    cy.realPress("Escape");
    cy.get("@trigger")
      .should("be.focused")
      .and("have.attr", "aria-expanded", "false");
    cy.realPress("Space");
    cy.get("@trigger")
      .should("be.focused")
      .and("have.attr", "aria-expanded", "true");
  });

  it("THEN renders linked hidden breadcrumb disclosure items without link visual treatment", () => {
    cy.mount(<CollapsedBreadcrumbs />);

    cy.findByRole("button", { name: "Additional breadcrumbs" }).realClick();
    cy.findByRole("link", { name: "Level 2 Entity" })
      .as("hiddenLink")
      .should("have.class", "saltBreadcrumbs-disclosureItem")
      .should(($link) => {
        const styles = getComputedStyle($link[0]);

        expect(styles.textDecorationLine).to.equal("none");
      });

    cy.get("@hiddenLink")
      .realHover()
      .should(($link) => {
        expect(getComputedStyle($link[0]).textDecorationLine).to.equal("none");
      });
    cy.get("@hiddenLink")
      .focus()
      .should(($link) => {
        expect(getComputedStyle($link[0]).textDecorationLine).to.equal("none");
      });
  });

  it("THEN moves focus into hidden breadcrumb links with Tab and navigates with Enter", () => {
    cy.mount(<CollapsedBreadcrumbs levelTwoHref="#native-enter-level-2" />);

    cy.findByRole("button", { name: "Additional breadcrumbs" }).focus();
    cy.realPress("Enter");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
    cy.realPress("Enter");
    cy.location("hash").should("eq", "#native-enter-level-2");
  });

  it("THEN tabs through hidden breadcrumb links and closes the disclosure at the boundary", () => {
    cy.mount(<CollapsedBreadcrumbs />);

    cy.findByRole("button", { name: "Additional breadcrumbs" })
      .as("trigger")
      .focus();
    cy.realPress("Enter");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.get("@trigger")
      .should("be.focused")
      .and("have.attr", "aria-expanded", "false");

    cy.realPress("Enter");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("link", { name: "Level 2 Entity" }).should("be.focused");
    cy.realPress(["Shift", "Tab"]);
    cy.get("@trigger")
      .should("be.focused")
      .and("have.attr", "aria-expanded", "false");
  });

  it("THEN navigates natively from hidden breadcrumb disclosure item clicks", () => {
    cy.mount(<CollapsedBreadcrumbs levelTwoHref="#native-click-level-2" />);

    cy.findByRole("button", { name: "Additional breadcrumbs" }).realClick();
    cy.findByRole("link", { name: "Level 2 Entity" }).realClick();
    cy.location("hash").should("eq", "#native-click-level-2");
  });

  it("THEN renders composed hidden breadcrumb levels in the disclosure", () => {
    cy.mount(
      <Breadcrumbs maxItems={3}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="/level-2">
          <BreadcrumbTrigger data-testid="hidden-composed-trigger">
            <span aria-hidden>Icon</span>
            <BreadcrumbLabel>Custom Level 2 Entity</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" }).realClick();
    cy.findByRole("link", { name: "Custom Level 2 Entity" })
      .should("have.attr", "href", "/level-2")
      .and("have.attr", "data-testid", "hidden-composed-trigger")
      .and("have.text", "IconCustom Level 2 Entity");
  });

  it("THEN renders wrapped hidden breadcrumb triggers in the disclosure", () => {
    cy.mount(
      <Breadcrumbs maxItems={3}>
        <Fragment key="wrapped-breadcrumbs">
          <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
          <Breadcrumb href="#level-2">
            <Tooltip content="Level 2 tooltip">
              <BreadcrumbTrigger>
                <Fragment key="trigger-content">
                  <span aria-hidden>Icon</span>
                  <BreadcrumbLabel>Level 2 Entity</BreadcrumbLabel>
                </Fragment>
              </BreadcrumbTrigger>
            </Tooltip>
          </Breadcrumb>
        </Fragment>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" }).realClick();
    cy.findByRole("link", { name: "Level 2 Entity" }).should(
      "have.attr",
      "href",
      "#level-2",
    );
  });

  it("THEN supports routed links inside the hidden breadcrumb disclosure", () => {
    const render = cy
      .stub()
      .as("render")
      .callsFake((props: ComponentPropsWithoutRef<"a">) => (
        <TestRouterLink {...props} data-router-link="shared" />
      ));

    cy.mount(
      <Breadcrumbs maxItems={3} render={render}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" })
      .as("trigger")
      .realClick();
    cy.findByRole("link", { name: "Level 2 Entity" })
      .should("have.attr", "data-router-link", "shared")
      .and("have.attr", "href", "#level-2")
      .trigger("click", {
        bubbles: true,
        cancelable: true,
        eventConstructor: "MouseEvent",
      });
    cy.get("@trigger").should("have.attr", "aria-expanded", "false");
    cy.get("@render").should("have.been.called");
  });

  it("THEN lets item render override the shared renderer inside the hidden breadcrumb disclosure", () => {
    cy.mount(
      <Breadcrumbs
        maxItems={3}
        render={<TestRouterLink data-router-link="shared" />}
      >
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb
          href="#level-2"
          render={<TestRouterLink data-router-link="item" />}
        >
          Level 2 Entity
        </Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" }).realClick();
    cy.findByRole("link", { name: "Level 2 Entity" }).should(
      "have.attr",
      "data-router-link",
      "item",
    );
    cy.findByRole("link", { name: "Level 3 Entity" }).should(
      "have.attr",
      "data-router-link",
      "shared",
    );
  });

  it("THEN keeps hidden non-navigable breadcrumbs out of disclosure focus movement", () => {
    cy.mount(
      <Breadcrumbs maxItems={3}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb>Non navigable Level Entity</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" })
      .as("trigger")
      .focus();
    cy.realPress("Enter");
    cy.findByText("Non navigable Level Entity")
      .parents(".saltBreadcrumbs-disclosureItem")
      .should("not.have.attr", "href");
    cy.findByRole("link", { name: "Non navigable Level Entity" }).should(
      "not.exist",
    );
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
    cy.realPress("Home");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("link", { name: "Level 3 Entity" }).should("be.focused");
  });

  it("THEN preserves composed trigger attributes and handlers inside the hidden breadcrumb disclosure", () => {
    const onClick = cy.stub().as("onClick");

    cy.mount(
      <Breadcrumbs maxItems={3}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">
          <BreadcrumbTrigger data-trigger-placement="hidden" onClick={onClick}>
            <BreadcrumbLabel>Level 2 Entity</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    cy.findByRole("button", { name: "Additional breadcrumbs" })
      .as("trigger")
      .realClick();
    cy.findByRole("link", { name: "Level 2 Entity" })
      .should("have.attr", "data-trigger-placement", "hidden")
      .realClick();
    cy.get("@onClick").should("have.been.calledOnce");
    cy.get("@trigger").should("have.attr", "aria-expanded", "false");
  });
});
