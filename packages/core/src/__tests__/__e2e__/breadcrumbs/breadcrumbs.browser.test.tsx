import {
  Breadcrumb,
  BreadcrumbLabel,
  Breadcrumbs,
  BreadcrumbTrigger,
  Tooltip,
} from "@salt-ds/core";
import { type ComponentPropsWithoutRef, Fragment, forwardRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

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

function CollapsedBreadcrumbs({ levelTwoHref = "#level-2" }) {
  return (
    <Breadcrumbs maxItems={3}>
      <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
      <Breadcrumb href={levelTwoHref}>Level 2 Entity</Breadcrumb>
      <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
      <Breadcrumb>Current Level Entity</Breadcrumb>
    </Breadcrumbs>
  );
}

const disclosure = () =>
  page.getByRole("button", { name: "Additional breadcrumbs" });

afterEach(() => vi.restoreAllMocks());

describe("GIVEN Breadcrumbs", () => {
  it("renders a named navigation landmark and ordered list", async () => {
    await renderWithSalt(
      <Breadcrumbs aria-label="Breadcrumb">
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );
    await expect
      .element(page.getByRole("navigation", { name: "Breadcrumb" }))
      .toBeInTheDocument();
    expect(page.getByRole("list").element().tagName).toBe("OL");
    await expect.element(page.getByRole("listitem")).toHaveLength(3);
    await expect
      .element(page.getByRole("link", { name: "Root Level Entity" }))
      .toHaveAttribute("href", "#root");
    expect(document.querySelectorAll(".saltBreadcrumb-separator")).toHaveLength(
      2,
    );
    for (const separator of document.querySelectorAll(
      ".saltBreadcrumb-separator",
    ))
      expect(separator).toHaveAttribute("aria-hidden", "true");
  });

  it("supports native landmark labelling", async () => {
    await renderWithSalt(
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
    await expect
      .element(page.getByRole("navigation", { name: "Page location" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("navigation", { name: "Secondary path" }))
      .toBeInTheDocument();
  });

  it("defaults the final item to current and respects explicit current", async () => {
    await renderWithSalt(
      <>
        <Breadcrumbs>
          <Breadcrumb href="#root">Root</Breadcrumb>
          <Breadcrumb>Default current</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs>
          <Breadcrumb href="#other">Other root</Breadcrumb>
          <Breadcrumb current>Explicit current</Breadcrumb>
        </Breadcrumbs>
      </>,
    );
    for (const text of ["Default current", "Explicit current"]) {
      const current = page
        .getByText(text)
        .element()
        .closest(".saltBreadcrumb-current");
      expect(current).toHaveAttribute("aria-current", "page");
      await expect
        .element(page.getByRole("link", { name: text }))
        .not.toBeInTheDocument();
    }
  });

  it("keeps linked current items in focus order", async () => {
    await renderWithSalt(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root</Breadcrumb>
        <Breadcrumb current href="#level-2">
          Current
        </Breadcrumb>
        <Breadcrumb href="#level-3">Level 3</Breadcrumb>
      </Breadcrumbs>,
    );
    for (const name of ["Root", "Current", "Level 3"]) {
      await userEvent.tab();
      await expect.element(page.getByRole("link", { name })).toHaveFocus();
    }
    await expect
      .element(page.getByRole("link", { name: "Current" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("renders non-navigable items without a link role", async () => {
    await renderWithSalt(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root</Breadcrumb>
        <Breadcrumb current>Current</Breadcrumb>
        <Breadcrumb>Non navigable</Breadcrumb>
      </Breadcrumbs>,
    );
    await expect
      .element(page.getByRole("link", { name: "Non navigable" }))
      .not.toBeInTheDocument();
    const trigger = page.getByText("Non navigable").element().closest("a");
    expect(trigger).not.toHaveAttribute("href");
    expect(trigger).not.toHaveAttribute("aria-current");
  });

  it("supports shorthand and explicit trigger composition", async () => {
    await renderWithSalt(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root</Breadcrumb>
        <Breadcrumb href="#level-2">
          <BreadcrumbTrigger data-testid="custom-trigger">
            <span aria-hidden>Icon</span>
            <BreadcrumbLabel>Custom level</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>,
    );
    await expect
      .element(page.getByTestId("custom-trigger"))
      .toHaveAttribute("href", "#level-2");
    await expect
      .element(page.getByTestId("custom-trigger"))
      .toHaveTextContent("IconCustom level");
  });

  it("supports shared routed renderers and item overrides", async () => {
    const render = vi.fn((props: ComponentPropsWithoutRef<"a">) => (
      <TestRouterLink {...props} data-router-link="shared" />
    ));
    await renderWithSalt(
      <Breadcrumbs render={render}>
        <Breadcrumb
          href="#root"
          render={<TestRouterLink data-router-link="item" />}
        >
          Root
        </Breadcrumb>
        <Breadcrumb href="#level-2">Level 2</Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>,
    );
    await expect
      .element(page.getByRole("link", { name: "Root" }))
      .toHaveAttribute("data-router-link", "item");
    await expect
      .element(page.getByRole("link", { name: "Level 2" }))
      .toHaveAttribute("data-router-link", "shared");
    expect(render).toHaveBeenCalled();
    for (const [props] of render.mock.calls) expect(props.href).toBeDefined();
  });

  it("warns for empty children without placeholder content", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await renderWithSalt(
      <Breadcrumbs>
        <Breadcrumb />
      </Breadcrumbs>,
    );
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("Breadcrumb requires children"),
    );
    expect(document.querySelector("a")).not.toBeInTheDocument();
  });

  it("does not collapse without maxItems", async () => {
    await renderWithSalt(
      <Breadcrumbs>
        <Breadcrumb href="#root">Root</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3</Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>,
    );
    await expect.element(disclosure()).not.toBeInTheDocument();
    await expect.element(page.getByText("Level 2")).toBeInTheDocument();
  });

  it("collapses its middle range", async () => {
    await renderWithSalt(<CollapsedBreadcrumbs />);
    await expect
      .element(page.getByText("Root Level Entity"))
      .toBeInTheDocument();
    await expect
      .element(page.getByText("Level 2 Entity"))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByText("Level 3 Entity"))
      .not.toBeInTheDocument();
    await expect.element(disclosure()).toBeInTheDocument();
  });

  it("supports custom collapse ranges and wrap opt-out", async () => {
    await renderWithSalt(
      <>
        <Breadcrumbs
          itemsAfterCollapse={2}
          itemsBeforeCollapse={2}
          maxItems={4}
        >
          <Breadcrumb href="#root">Root</Breadcrumb>
          <Breadcrumb href="#two">Two</Breadcrumb>
          <Breadcrumb href="#three">Three</Breadcrumb>
          <Breadcrumb href="#four">Four</Breadcrumb>
          <Breadcrumb>Current</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs maxItems={2} wrap>
          <Breadcrumb href="#wrapped-root">Wrapped root</Breadcrumb>
          <Breadcrumb href="#wrapped-two">Wrapped two</Breadcrumb>
          <Breadcrumb>Wrapped current</Breadcrumb>
        </Breadcrumbs>
      </>,
    );
    await expect
      .element(page.getByText("Two", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByText("Three", { exact: true }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByText("Four", { exact: true }))
      .toBeInTheDocument();
    await expect.element(page.getByText("Wrapped two")).toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Additional breadcrumbs" }))
      .toHaveLength(1);
  });

  it("opens and closes disclosure without moving trigger focus", async () => {
    await renderWithSalt(<CollapsedBreadcrumbs />);
    disclosure().element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(disclosure()).toHaveFocus();
    await expect.element(disclosure()).toHaveAttribute("aria-expanded", "true");
    const hidden = page.getByRole("list", { name: "Hidden breadcrumb levels" });
    await expect.element(hidden.getByRole("listitem")).toHaveLength(2);
    await userEvent.keyboard("{Escape}");
    await expect
      .element(disclosure())
      .toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard(" ");
    await expect.element(disclosure()).toHaveAttribute("aria-expanded", "true");
  });

  it("tabs through hidden links and closes at either boundary", async () => {
    await renderWithSalt(<CollapsedBreadcrumbs />);
    disclosure().element().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Level 2 Entity" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Level 3 Entity" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(disclosure()).toHaveFocus();
    await expect
      .element(disclosure())
      .toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect.element(disclosure()).toHaveFocus();
    await expect
      .element(disclosure())
      .toHaveAttribute("aria-expanded", "false");
  });

  it("uses the shared renderer for hidden links activated with Enter", async () => {
    const render = vi.fn((props: ComponentPropsWithoutRef<"a">) => (
      <TestRouterLink {...props} data-router-link="shared" />
    ));
    await renderWithSalt(
      <Breadcrumbs maxItems={3} render={render}>
        <Breadcrumb href="#root">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#level-2">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3 Entity</Breadcrumb>
        <Breadcrumb>Current Level Entity</Breadcrumb>
      </Breadcrumbs>,
    );

    disclosure().element().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    const hiddenLink = page.getByRole("link", { name: "Level 2 Entity" });
    await expect.element(hiddenLink).toHaveFocus();
    await expect
      .element(hiddenLink)
      .toHaveAttribute("data-router-link", "shared");
    await userEvent.keyboard("{Enter}");
    await expect
      .element(disclosure())
      .toHaveAttribute("aria-expanded", "false");
    expect(render).toHaveBeenCalled();
  });

  it("uses item renderers ahead of the shared renderer for hidden links", async () => {
    await renderWithSalt(
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

    await disclosure().click();
    await expect
      .element(page.getByRole("link", { name: "Level 2 Entity" }))
      .toHaveAttribute("data-router-link", "item");
    await expect
      .element(page.getByRole("link", { name: "Level 3 Entity" }))
      .toHaveAttribute("data-router-link", "shared");
  });

  it("supports native navigation from hidden links", async () => {
    await renderWithSalt(
      <CollapsedBreadcrumbs levelTwoHref="#native-click-level-2" />,
    );
    await disclosure().click();
    await page.getByRole("link", { name: "Level 2 Entity" }).click();
    expect(window.location.hash).toBe("#native-click-level-2");
  });

  it("preserves composed hidden trigger content and handlers", async () => {
    const onClick = vi.fn();
    await renderWithSalt(
      <Breadcrumbs maxItems={3}>
        <Breadcrumb href="#root">Root</Breadcrumb>
        <Breadcrumb href="#level-2">
          <BreadcrumbTrigger data-trigger-placement="hidden" onClick={onClick}>
            <span aria-hidden>Icon</span>
            <BreadcrumbLabel>Level 2</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Breadcrumb>
        <Breadcrumb href="#level-3">Level 3</Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>,
    );
    await disclosure().click();
    const link = page.getByRole("link", { name: "Level 2" });
    await expect
      .element(link)
      .toHaveAttribute("data-trigger-placement", "hidden");
    await expect.element(link).toHaveTextContent("IconLevel 2");
    await link.click();
    expect(onClick).toHaveBeenCalledOnce();
    await expect
      .element(disclosure())
      .toHaveAttribute("aria-expanded", "false");
  });

  it("renders wrapped hidden breadcrumb triggers", async () => {
    await renderWithSalt(
      <Breadcrumbs maxItems={3}>
        <Fragment key="wrapped">
          <Breadcrumb href="#root">Root</Breadcrumb>
          <Breadcrumb href="#level-2">
            <Tooltip content="Level 2 tooltip">
              <BreadcrumbTrigger>
                <BreadcrumbLabel>Level 2</BreadcrumbLabel>
              </BreadcrumbTrigger>
            </Tooltip>
          </Breadcrumb>
        </Fragment>
        <Breadcrumb href="#level-3">Level 3</Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>,
    );
    await disclosure().click();
    await expect
      .element(page.getByRole("link", { name: "Level 2" }))
      .toHaveAttribute("href", "#level-2");
  });

  it("skips non-navigable hidden items during focus movement", async () => {
    await renderWithSalt(
      <Breadcrumbs maxItems={3}>
        <Breadcrumb href="#root">Root</Breadcrumb>
        <Breadcrumb>Non navigable</Breadcrumb>
        <Breadcrumb href="#level-3">Level 3</Breadcrumb>
        <Breadcrumb>Current</Breadcrumb>
      </Breadcrumbs>,
    );
    disclosure().element().focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("link", { name: "Non navigable" }))
      .not.toBeInTheDocument();
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Level 3" }))
      .toHaveFocus();
  });
});
