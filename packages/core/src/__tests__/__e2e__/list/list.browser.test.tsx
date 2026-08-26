import {
  Button,
  Dialog,
  DialogContent,
  Link,
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { DocumentIcon } from "@salt-ds/icons";
import {
  type ComponentPropsWithoutRef,
  createRef,
  forwardRef,
  useState,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";

const RouterLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }
>(function RouterLink({ to, ...rest }, ref) {
  return <a {...rest} href={to} ref={ref} />;
});

function FormExample({ renderSubmit = false }: { renderSubmit?: boolean }) {
  const [submissions, setSubmissions] = useState(0);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmissions((count) => count + 1);
      }}
    >
      <List>
        <ListItem>
          <ListItemAction
            render={renderSubmit ? <button type="submit" /> : undefined}
          >
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>
      <output aria-label="Submission count">{submissions}</output>
    </form>
  );
}

function DialogExample({ onOpenChange }: { onOpenChange: () => void }) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      initialFocus={0}
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange();
        setOpen(nextOpen);
      }}
    >
      <DialogContent>
        <List aria-label="Dialog reports">
          <ListItem>
            <ListItemAction>
              <ListItemContent>Open dialog report</ListItemContent>
            </ListItemAction>
            <ListItemActions>
              <Button aria-label="More dialog report actions" />
            </ListItemActions>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}

function OverlayExample({ onOpenChange }: { onOpenChange: () => void }) {
  const [open, setOpen] = useState(true);

  return (
    <Overlay
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange();
        setOpen(nextOpen);
      }}
    >
      <OverlayTrigger>
        <Button>Show reports</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelContent>
          <List aria-label="Overlay reports">
            <ListItem>
              <ListItemAction>
                <ListItemContent>Open overlay report</ListItemContent>
              </ListItemAction>
              <ListItemActions>
                <Button aria-label="More overlay report actions" />
              </ListItemActions>
            </ListItem>
          </List>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
}

describe("List", () => {
  it("renders native unordered and ordered list structures", async () => {
    const unorderedRef = createRef<HTMLUListElement>();
    const orderedRef = createRef<HTMLUListElement>();

    await renderWithSalt(
      <>
        <List className="reports" data-list="unordered" ref={unorderedRef}>
          <ListItem>Unordered item</ListItem>
        </List>
        <List
          data-list="ordered"
          data-source="list"
          ref={orderedRef}
          render={
            <ol className="ordered-render" data-source="render" start={2} />
          }
        >
          <ListItem>Ordered item</ListItem>
        </List>
      </>,
    );

    const unorderedList = document.querySelector('ul[data-list="unordered"]');
    expect(unorderedList).toHaveClass("saltList", "reports");
    expect(unorderedList?.children).toHaveLength(1);

    const orderedList = document.querySelector('ol[data-list="ordered"]');
    expect(orderedList).toHaveAttribute("start", "2");
    expect(orderedList).toHaveAttribute("data-source", "render");
    expect(orderedList).toHaveClass("saltList", "ordered-render");
    expect(orderedList?.children).toHaveLength(1);
    expect(unorderedRef.current?.tagName).toBe("UL");
    expect(orderedRef.current?.tagName).toBe("OL");
  });

  it("passes complete root props to a callback render", async () => {
    const listRef = createRef<HTMLUListElement>();
    const renderSpy = vi.fn();

    await renderWithSalt(
      <List
        aria-label="Ordered reports"
        className="reports"
        data-list="callback"
        ref={listRef}
        render={(props) => {
          renderSpy(props);
          return <ol {...props} data-render="callback" />;
        }}
      >
        <ListItem>First report</ListItem>
      </List>,
    );

    const list = page.getByRole("list", { name: "Ordered reports" });
    await expect.element(list).toHaveClass("saltList", "reports");
    await expect.element(list).toHaveAttribute("data-list", "callback");
    await expect.element(list).toHaveAttribute("data-render", "callback");
    expect(list.element().tagName).toBe("OL");
    expect(list.element().children).toHaveLength(1);
    expect(renderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        "aria-label": "Ordered reports",
        children: expect.anything(),
        className: expect.any(String),
        ref: expect.any(Object),
      }),
    );
    expect(listRef.current?.tagName).toBe("OL");
  });

  it("keeps passive rows structural and out of the tab order", async () => {
    await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Quarterly report</ListItemContent>
        </ListItem>
      </List>,
    );

    await expect
      .element(page.getByRole("list", { name: "Reports" }))
      .toBeInTheDocument();
    await expect.element(page.getByRole("listitem")).toHaveLength(1);
    for (const element of document.querySelectorAll("ul, li")) {
      expect(element).not.toHaveAttribute("tabindex");
    }
    expect(
      document.querySelector(
        '[role="menu"], [role="listbox"], [role="option"], [role="menuitem"]',
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector("button, a, input, select, textarea, [tabindex]"),
    ).not.toBeInTheDocument();
  });

  it("tabs only through secondary controls in passive rows", async () => {
    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemContent>Quarterly report</ListItemContent>
          <ListItemActions>
            <Button aria-label="Download quarterly report" />
            <Button aria-label="Delete quarterly report" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Download quarterly report" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Delete quarterly report" }))
      .toHaveFocus();
  });

  it("uses native button activation and preserves submit overrides", async () => {
    const clickSpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemAction onClick={clickSpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    const button = page.getByRole("button", { name: "Run report" });
    await expect.element(button).toHaveAttribute("type", "button");
    await button.click();
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(clickSpy).toHaveBeenCalledTimes(3);

    await renderWithSalt(<FormExample />);
    await page.getByRole("button", { name: "Run report" }).click();
    await expect
      .element(page.getByRole("status", { name: "Submission count" }))
      .toHaveTextContent("0");

    await renderWithSalt(<FormExample renderSubmit />);
    const submitButton = page.getByRole("button", { name: "Run report" });
    await expect.element(submitButton).toHaveAttribute("type", "submit");
    await submitButton.click();
    await expect
      .element(page.getByRole("status", { name: "Submission count" }))
      .toHaveTextContent("1");
  });

  it("uses native link attributes and keyboard activation", async () => {
    const clickSpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemAction
            aria-current="page"
            download="quarterly.csv"
            href="#quarterly"
            onClick={(event) => {
              event.preventDefault();
              clickSpy();
            }}
            rel="noreferrer"
            target="_blank"
          >
            <ListItemContent>Open report</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    const link = page.getByRole("link", { name: "Open report" });
    await expect.element(link).toHaveAttribute("href", "#quarterly");
    await expect.element(link).toHaveAttribute("target", "_blank");
    await expect.element(link).toHaveAttribute("rel", "noreferrer");
    await expect.element(link).toHaveAttribute("download", "quarterly.csv");
    await expect.element(link).toHaveAttribute("aria-current", "page");
    await expect.element(link).not.toHaveAttribute("type");
    link.element().focus();
    await userEvent.keyboard("{Enter}");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("keeps primary and secondary actions as independent siblings", async () => {
    await renderWithSalt(
      <List>
        <ListItem data-row="button">
          <ListItemAction>
            <ListItemContent>Button report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More button report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem data-row="link">
          <ListItemAction href="#link-report">
            <ListItemContent>Link report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More link report actions" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    expect(
      document.querySelector('[data-row="button"] > button + div'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-row="link"] > a + div'),
    ).toBeInTheDocument();
    expect(
      document.querySelector("button button, button a, a button, a a"),
    ).not.toBeInTheDocument();

    for (const [role, name] of [
      ["button", "Button report"],
      ["button", "More button report actions"],
      ["link", "Link report"],
      ["button", "More link report actions"],
    ] as const) {
      await userEvent.tab();
      await expect
        .element(page.getByRole(role, { name, exact: true }))
        .toHaveFocus();
    }
  });

  it("keeps the row clickable around multiple secondary actions", async () => {
    const primarySpy = vi.fn();
    const firstSecondarySpy = vi.fn();
    const secondSecondarySpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem data-clickable-row>
          <ListItemAction onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="Download report" onClick={firstSecondarySpy} />
            <Button
              aria-label="More report actions"
              onClick={secondSecondarySpy}
            />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    const row = document.querySelector<HTMLElement>("[data-clickable-row]");
    if (!row) throw new Error("Clickable list row missing");
    const rowRect = row.getBoundingClientRect();
    const secondaryActions = row.querySelectorAll(
      ".saltListItemActions > button",
    );
    const firstActionRect = secondaryActions[0].getBoundingClientRect();
    const secondActionRect = secondaryActions[1].getBoundingClientRect();

    await userEvent.click(row, {
      position: {
        x:
          firstActionRect.right +
          (secondActionRect.left - firstActionRect.right) / 2 -
          rowRect.left,
        y: rowRect.height / 2,
      },
    });
    await userEvent.click(row, {
      position: { x: rowRect.width - 2, y: rowRect.height / 2 },
    });

    expect(primarySpy).toHaveBeenCalledTimes(2);
    await page.getByRole("button", { name: "More report actions" }).click();
    expect(secondSecondarySpy).toHaveBeenCalledOnce();
    expect(firstSecondarySpy).not.toHaveBeenCalled();
    expect(primarySpy).toHaveBeenCalledTimes(2);
  });

  it("does not leak secondary activation to the primary action", async () => {
    const primarySpy = vi.fn();
    const secondarySpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemAction onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More report actions" onClick={secondarySpy} />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    const secondaryAction = page.getByRole("button", {
      name: "More report actions",
    });
    await secondaryAction.click();
    await userEvent.keyboard("{Enter}");
    expect(secondarySpy).toHaveBeenCalledTimes(2);
    expect(primarySpy).not.toHaveBeenCalled();
  });

  it("disables only the primary button", async () => {
    const primarySpy = vi.fn();
    const secondarySpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemAction disabled onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="Download report" onClick={secondarySpy} />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    const primaryAction = page.getByRole("button", { name: "Run report" });
    await expect.element(primaryAction).toBeDisabled();
    await primaryAction.click({ force: true });
    expect(primarySpy).not.toHaveBeenCalled();
    await userEvent.tab();
    const secondaryAction = page.getByRole("button", {
      name: "Download report",
    });
    await expect.element(secondaryAction).toHaveFocus();
    await secondaryAction.click();
    expect(secondarySpy).toHaveBeenCalledOnce();
  });

  it("merges JSX and callback render props for both action branches", async () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const linkRef = createRef<HTMLAnchorElement>();
    const routerRef = createRef<HTMLAnchorElement>();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemAction
            aria-label="Custom button"
            className="consumer-button"
            data-consumer="button"
            ref={buttonRef}
            render={<button className="render-button" data-render="button" />}
          >
            <ListItemContent>Button label</ListItemContent>
          </ListItemAction>
        </ListItem>
        <ListItem>
          <ListItemAction
            className="consumer-link"
            href="#jsx-link"
            ref={linkRef}
            render={
              <a className="render-link" data-render="link" href="#jsx-link" />
            }
          >
            <ListItemContent>JSX link</ListItemContent>
          </ListItemAction>
        </ListItem>
        <ListItem>
          <ListItemAction
            href="/callback-link"
            ref={routerRef}
            render={({ href, ...props }) => (
              <RouterLink {...props} data-render="router" to={href} />
            )}
          >
            <ListItemContent>Callback link</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    const button = page.getByRole("button", { name: "Custom button" });
    await expect
      .element(button)
      .toHaveClass("saltListItemAction", "consumer-button", "render-button");
    await expect.element(button).toHaveAttribute("data-consumer", "button");
    await expect.element(button).toHaveAttribute("data-render", "button");
    await expect.element(button).toHaveTextContent("Button label");

    const jsxLink = page.getByRole("link", { name: "JSX link" });
    await expect.element(jsxLink).toHaveClass("consumer-link", "render-link");
    await expect.element(jsxLink).toHaveAttribute("href", "#jsx-link");

    const callbackLink = page.getByRole("link", { name: "Callback link" });
    await expect
      .element(callbackLink)
      .toHaveAttribute("href", "/callback-link");
    await expect.element(callbackLink).toHaveAttribute("data-render", "router");
    expect(buttonRef.current?.tagName).toBe("BUTTON");
    expect(linkRef.current?.tagName).toBe("A");
    expect(routerRef.current?.tagName).toBe("A");
  });

  it("forwards native props and refs to every primitive", async () => {
    const listRef = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const contentRef = createRef<HTMLSpanElement>();
    const actionRef = createRef<HTMLButtonElement>();
    const actionsRef = createRef<HTMLDivElement>();

    await renderWithSalt(
      <List aria-label="Reports" data-ref="list" ref={listRef}>
        <ListItem aria-label="Report row" data-ref="item" ref={itemRef}>
          <ListItemAction
            aria-describedby="description"
            data-ref="action"
            ref={actionRef}
          >
            <ListItemContent
              aria-label="Report content"
              data-ref="content"
              ref={contentRef}
            >
              Quarterly report
            </ListItemContent>
          </ListItemAction>
          <ListItemActions
            aria-label="Report controls"
            data-ref="actions"
            ref={actionsRef}
            role="group"
          >
            <Button aria-label="Download report" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    expect(document.querySelector('[data-ref="list"]')).toHaveAttribute(
      "aria-label",
      "Reports",
    );
    expect(document.querySelector('[data-ref="item"]')).toHaveAttribute(
      "aria-label",
      "Report row",
    );
    expect(document.querySelector('[data-ref="content"]')).toHaveAttribute(
      "aria-label",
      "Report content",
    );
    expect(document.querySelector('[data-ref="action"]')).toHaveAttribute(
      "aria-describedby",
      "description",
    );
    const actions = document.querySelector('[data-ref="actions"]');
    expect(actions).toHaveAttribute("role", "group");
    expect(actions).toHaveAttribute("aria-label", "Report controls");
    expect(listRef.current?.tagName).toBe("UL");
    expect(itemRef.current?.tagName).toBe("LI");
    expect(contentRef.current?.tagName).toBe("SPAN");
    expect(actionRef.current?.tagName).toBe("BUTTON");
    expect(actionsRef.current?.tagName).toBe("DIV");
  });

  it("passes accessibility checks for all canonical compositions", async () => {
    const { container } = await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Passive report</ListItemContent>
        </ListItem>
        <ListItem>
          <ListItemContent>Passive report with actions</ListItemContent>
          <ListItemActions>
            <Button aria-label="Download passive report" />
            <Button aria-label="Delete passive report" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemAction>
            <ListItemContent>Button report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More button report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemAction href="#linked-report">
            <ListItemContent>Linked report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="Download linked report" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    await runAxeScan(container);
  }, 30_000);

  it("keeps leading icons and trailing actions aligned to the first text line", async () => {
    await renderWithSalt(
      <List aria-label="Alignment examples" style={{ width: 280 }}>
        <ListItem data-alignment-row="short">
          <ListItemContent>
            <DocumentIcon aria-hidden size={2} />
            <span data-alignment-text>Short report</span>
          </ListItemContent>
          <ListItemActions>
            <Button aria-label="Short report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem data-alignment-row="long">
          <ListItemContent>
            <DocumentIcon aria-hidden size={2} />
            <span data-alignment-text>
              A report label that wraps onto at least three lines without moving
              its leading icon or trailing action away from the first line
            </span>
          </ListItemContent>
          <ListItemActions>
            <Button aria-label="Long report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem data-alignment-row="external">
          <ListItemAction
            href="https://example.com/reports"
            render={<Link target="_blank" />}
          >
            <ListItemContent>
              <span data-alignment-text>External report</span>
            </ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    const getMetrics = (row: HTMLElement) => {
      const rowRect = row.getBoundingClientRect();
      const iconRect = row
        .querySelector<HTMLElement>(".saltIcon")
        ?.getBoundingClientRect();
      const text = row.querySelector<HTMLElement>("[data-alignment-text]");
      const textRect = text?.getBoundingClientRect();
      const actionRect = row
        .querySelector<HTMLElement>(".saltListItemActions button")
        ?.getBoundingClientRect();

      expect(iconRect).toBeDefined();
      expect(text).not.toBeNull();
      expect(textRect).toBeDefined();
      expect(actionRect).toBeDefined();

      const lineHeight = Number.parseFloat(
        getComputedStyle(text as HTMLElement).lineHeight,
      );

      return {
        actionCenter:
          (actionRect as DOMRect).top +
          (actionRect as DOMRect).height / 2 -
          rowRect.top,
        firstLineCenter:
          (textRect as DOMRect).top + lineHeight / 2 - rowRect.top,
        iconCenter:
          (iconRect as DOMRect).top +
          (iconRect as DOMRect).height / 2 -
          rowRect.top,
        lineHeight,
        textHeight: (textRect as DOMRect).height,
      };
    };

    const shortRow = document.querySelector<HTMLElement>(
      '[data-alignment-row="short"]',
    );
    const longRow = document.querySelector<HTMLElement>(
      '[data-alignment-row="long"]',
    );
    if (!shortRow || !longRow) throw new Error("Alignment list rows missing");

    const short = getMetrics(shortRow);
    const long = getMetrics(longRow);
    expect(long.textHeight).toBeGreaterThan(long.lineHeight * 2);
    expect(Math.abs(short.iconCenter - short.firstLineCenter)).toBeLessThan(1);
    expect(Math.abs(long.iconCenter - long.firstLineCenter)).toBeLessThan(1);
    expect(Math.abs(short.actionCenter - short.firstLineCenter)).toBeLessThan(
      1,
    );
    expect(Math.abs(long.actionCenter - long.firstLineCenter)).toBeLessThan(1);
    expect(Math.abs(long.iconCenter - short.iconCenter)).toBeLessThan(1);
    expect(Math.abs(long.actionCenter - short.actionCenter)).toBeLessThan(1);

    const externalRow = document.querySelector<HTMLElement>(
      '[data-alignment-row="external"]',
    );
    if (!externalRow) throw new Error("External link list row missing");
    const rowRect = externalRow.getBoundingClientRect();
    const text = externalRow.querySelector<HTMLElement>(
      "[data-alignment-text]",
    );
    const textRect = text?.getBoundingClientRect();
    const externalAction = externalRow.querySelector<HTMLAnchorElement>(
      ".saltListItemAction",
    );
    const iconRect = externalRow
      .querySelector<HTMLElement>(".saltLink-icon")
      ?.getBoundingClientRect();

    expect(text).not.toBeNull();
    expect(textRect).toBeDefined();
    expect(externalAction).not.toBeNull();
    expect(iconRect).toBeDefined();

    const lineHeight = Number.parseFloat(
      getComputedStyle(text as HTMLElement).lineHeight,
    );
    const firstLineCenter =
      (textRect as DOMRect).top + lineHeight / 2 - rowRect.top;
    const iconCenter =
      (iconRect as DOMRect).top +
      (iconRect as DOMRect).height / 2 -
      rowRect.top;

    expect(Math.abs(iconCenter - firstLineCenter)).toBeLessThan(1);
    expect(
      (iconRect as DOMRect).left - (textRect as DOMRect).right,
    ).toBeLessThan(16);
    expect(
      getComputedStyle(externalAction as HTMLAnchorElement).textDecorationLine,
    ).toBe("none");
  });

  it("leaves focus containment and Escape handling to Dialog and Overlay", async () => {
    const dialogOpenChange = vi.fn();

    await renderWithSalt(<DialogExample onOpenChange={dialogOpenChange} />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Open dialog report" }))
      .toHaveFocus();
    for (const element of document.querySelectorAll("ul, li")) {
      expect(element).not.toHaveAttribute("tabindex");
    }
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(page.getByRole("button", { name: "Open dialog report" }))
      .toHaveFocus();
    await userEvent.tab();
    const dialogSecondaryAction = page.getByRole("button", {
      name: "More dialog report actions",
    });
    await expect.element(dialogSecondaryAction).toHaveFocus();
    await dialogSecondaryAction.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(dialogOpenChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(dialogOpenChange).toHaveBeenCalledOnce();

    const overlayOpenChange = vi.fn();
    await renderWithSalt(<OverlayExample onOpenChange={overlayOpenChange} />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Open overlay report" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(page.getByRole("button", { name: "Open overlay report" }))
      .toHaveFocus();
    await userEvent.tab();
    const overlaySecondaryAction = page.getByRole("button", {
      name: "More overlay report actions",
    });
    await expect.element(overlaySecondaryAction).toHaveFocus();
    await overlaySecondaryAction.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(overlayOpenChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(overlayOpenChange).toHaveBeenCalledOnce();
    await expect
      .element(page.getByRole("button", { name: "Show reports" }))
      .toHaveFocus();
  });
});
