import {
  Button,
  Link,
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
} from "@salt-ds/core";
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
          <ListItemTrigger
            render={renderSubmit ? <button type="submit" /> : undefined}
          >
            <ListItemContent>Run report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>
      <output aria-label="Submission count">{submissions}</output>
    </form>
  );
}

describe("List", () => {
  it("renders native list semantics and supports ordered-list rendering", async () => {
    await renderWithSalt(
      <>
        <List aria-label="Unordered reports">
          <ListItem>Unordered item</ListItem>
        </List>
        <List
          aria-label="Ordered reports"
          className="consumer-list"
          data-source="list"
          render={<ol className="render-list" data-source="render" start={2} />}
        >
          <ListItem>Ordered item</ListItem>
        </List>
      </>,
    );

    const unorderedList = page.getByRole("list", {
      name: "Unordered reports",
      exact: true,
    });
    expect(unorderedList.element().tagName).toBe("UL");
    await expect
      .element(unorderedList.getByRole("listitem"))
      .toHaveTextContent("Unordered item");

    const orderedList = page.getByRole("list", {
      name: "Ordered reports",
      exact: true,
    });
    expect(orderedList.element().tagName).toBe("OL");
    await expect.element(orderedList).toHaveAttribute("start", "2");
    await expect.element(orderedList).toHaveAttribute("data-source", "render");
    await expect
      .element(orderedList)
      .toHaveClass("consumer-list", "render-list");
    await expect
      .element(orderedList.getByRole("listitem"))
      .toHaveTextContent("Ordered item");
  });

  it("merges root props into the output of a callback render", async () => {
    const listRef = createRef<HTMLUListElement>();

    await renderWithSalt(
      <List
        aria-label="Ordered reports"
        className="reports"
        data-list="callback"
        ref={listRef}
        render={(props) => <ul {...props} data-render="callback" />}
      >
        <ListItem>First report</ListItem>
      </List>,
    );

    const list = page.getByRole("list", { name: "Ordered reports" });
    await expect.element(list).toHaveClass("reports");
    await expect.element(list).toHaveAttribute("data-list", "callback");
    await expect.element(list).toHaveAttribute("data-render", "callback");
    expect(list.element().tagName).toBe("UL");
    await expect
      .element(list.getByRole("listitem"))
      .toHaveTextContent("First report");
    expect(listRef.current).toBe(list.element());
  });

  it("keeps static rows structural and out of the tab order", async () => {
    await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Quarterly report</ListItemContent>
        </ListItem>
      </List>,
    );

    const list = page.getByRole("list", { name: "Reports" });
    const listItem = list.getByRole("listitem");
    await expect.element(listItem).toHaveLength(1);
    await expect.element(list).not.toHaveAttribute("tabindex");
    await expect.element(listItem).not.toHaveAttribute("tabindex");
    await expect.element(list.getByRole("button")).not.toBeInTheDocument();
    await expect.element(list.getByRole("link")).not.toBeInTheDocument();
  });

  it("tabs only through secondary controls in static rows", async () => {
    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemContent>Quarterly report</ListItemContent>
          <Button aria-label="Download quarterly report" />
          <Button aria-label="Delete quarterly report" />
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

  it("renders a native button and forwards activation", async () => {
    const clickSpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger onClick={clickSpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    const button = page.getByRole("button", { name: "Run report" });
    await expect.element(button).toHaveAttribute("type", "button");
    await button.click();
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("does not submit forms by default", async () => {
    await renderWithSalt(<FormExample />);
    await page.getByRole("button", { name: "Run report" }).click();
    await expect
      .element(page.getByRole("status", { name: "Submission count" }))
      .toHaveTextContent("0");
  });

  it("preserves submit behavior from a rendered button", async () => {
    await renderWithSalt(<FormExample renderSubmit />);
    const submitButton = page.getByRole("button", { name: "Run report" });
    await expect.element(submitButton).toHaveAttribute("type", "submit");
    await submitButton.click();
    await expect
      .element(page.getByRole("status", { name: "Submission count" }))
      .toHaveTextContent("1");
  });

  it("renders a native link and forwards its attributes", async () => {
    const clickSpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger
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
          </ListItemTrigger>
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
    await link.click();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("tabs through primary and secondary actions in document order", async () => {
    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger>
            <ListItemContent>Button report</ListItemContent>
          </ListItemTrigger>
          <Button aria-label="More button report actions" />
        </ListItem>
        <ListItem>
          <ListItemTrigger href="#link-report">
            <ListItemContent>Link report</ListItemContent>
          </ListItemTrigger>
          <Button aria-label="More link report actions" />
        </ListItem>
      </List>,
    );

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

  it("keeps the row clickable around grouped secondary actions", async () => {
    const primarySpy = vi.fn();
    const firstSecondarySpy = vi.fn();
    const secondSecondarySpy = vi.fn();

    await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemTrigger onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemTrigger>
          <span aria-label="Report actions" role="group">
            <Button aria-label="Download report" onClick={firstSecondarySpy} />
            <Button
              aria-label="More report actions"
              onClick={secondSecondarySpy}
            />
          </span>
        </ListItem>
      </List>,
    );

    const row = page
      .getByRole("list", { name: "Reports" })
      .getByRole("listitem")
      .element();
    const rowRect = row.getBoundingClientRect();
    const firstActionRect = page
      .getByRole("button", { name: "Download report" })
      .element()
      .getBoundingClientRect();
    const secondActionRect = page
      .getByRole("button", { name: "More report actions" })
      .element()
      .getBoundingClientRect();

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

  it("disables only the primary button", async () => {
    const primarySpy = vi.fn();
    const secondarySpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger disabled onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemTrigger>
          <Button aria-label="Download report" onClick={secondarySpy} />
        </ListItem>
      </List>,
    );

    const primaryAction = page.getByRole("button", { name: "Run report" });
    await expect.element(primaryAction).toBeDisabled();
    await userEvent.tab();
    const secondaryAction = page.getByRole("button", {
      name: "Download report",
    });
    await expect.element(secondaryAction).toHaveFocus();
    await secondaryAction.click();
    expect(secondarySpy).toHaveBeenCalledOnce();
    expect(primarySpy).not.toHaveBeenCalled();
  });

  it("merges JSX and callback render props and refs for both action branches", async () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const callbackButtonRef = createRef<HTMLButtonElement>();
    const jsxLinkRef = createRef<HTMLAnchorElement>();
    const callbackLinkRef = createRef<HTMLAnchorElement>();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger
            aria-label="Custom button"
            className="consumer-button"
            data-consumer="button"
            ref={buttonRef}
            render={<button className="render-button" data-render="button" />}
          >
            <ListItemContent>Button label</ListItemContent>
          </ListItemTrigger>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            aria-label="Callback button"
            data-consumer="callback-button"
            ref={callbackButtonRef}
            render={(props) => (
              <button
                {...props}
                data-render="callback-button"
                type={props.type}
              />
            )}
          >
            <ListItemContent>Callback button label</ListItemContent>
          </ListItemTrigger>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            className="consumer-link"
            data-consumer="link"
            href="/jsx-link"
            ref={jsxLinkRef}
            render={
              <a className="render-link" data-render="link" href="/jsx-link" />
            }
          >
            <ListItemContent>JSX link</ListItemContent>
          </ListItemTrigger>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            href="/callback-link"
            ref={callbackLinkRef}
            render={({ href, ...props }) => (
              <RouterLink {...props} data-render="router" to={href} />
            )}
          >
            <ListItemContent>Callback link</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    const button = page.getByRole("button", { name: "Custom button" });
    await expect
      .element(button)
      .toHaveClass("consumer-button", "render-button");
    await expect.element(button).toHaveAttribute("data-consumer", "button");
    await expect.element(button).toHaveAttribute("data-render", "button");
    await expect.element(button).toHaveTextContent("Button label");
    expect(buttonRef.current).toBe(button.element());

    const callbackButton = page.getByRole("button", {
      name: "Callback button",
    });
    await expect
      .element(callbackButton)
      .toHaveAttribute("data-consumer", "callback-button");
    await expect
      .element(callbackButton)
      .toHaveAttribute("data-render", "callback-button");
    await expect.element(callbackButton).toHaveAttribute("type", "button");
    await expect
      .element(callbackButton)
      .toHaveTextContent("Callback button label");
    expect(callbackButtonRef.current).toBe(callbackButton.element());

    const jsxLink = page.getByRole("link", { name: "JSX link" });
    await expect.element(jsxLink).toHaveClass("consumer-link", "render-link");
    await expect.element(jsxLink).toHaveAttribute("data-consumer", "link");
    await expect.element(jsxLink).toHaveAttribute("data-render", "link");
    await expect.element(jsxLink).toHaveAttribute("href", "/jsx-link");
    expect(jsxLinkRef.current).toBe(jsxLink.element());

    const callbackLink = page.getByRole("link", { name: "Callback link" });
    await expect
      .element(callbackLink)
      .toHaveAttribute("href", "/callback-link");
    await expect.element(callbackLink).toHaveAttribute("data-render", "router");
    expect(callbackLinkRef.current).toBe(callbackLink.element());
  });

  it("forwards native props and refs to every primitive", async () => {
    const listRef = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const contentRef = createRef<HTMLSpanElement>();
    const actionRef = createRef<HTMLButtonElement>();
    const linkActionRef = createRef<HTMLAnchorElement>();

    await renderWithSalt(
      <List aria-label="Reports" ref={listRef}>
        <ListItem ref={itemRef} title="Report row">
          <ListItemTrigger aria-label="Open quarterly report" ref={actionRef}>
            <ListItemContent ref={contentRef} title="Report content">
              Quarterly report
            </ListItemContent>
          </ListItemTrigger>
          <Button aria-label="Download report" />
        </ListItem>
        <ListItem>
          <ListItemTrigger href="/quarterly-report" ref={linkActionRef}>
            <ListItemContent>Quarterly report link</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    expect(listRef.current).toHaveAttribute("aria-label", "Reports");
    expect(itemRef.current).toHaveAttribute("title", "Report row");
    expect(contentRef.current).toHaveAttribute("title", "Report content");
    expect(actionRef.current).toHaveAttribute(
      "aria-label",
      "Open quarterly report",
    );
    expect(linkActionRef.current).toHaveAttribute("href", "/quarterly-report");
    expect(listRef.current?.tagName).toBe("UL");
    expect(itemRef.current?.tagName).toBe("LI");
    expect(contentRef.current?.tagName).toBe("SPAN");
    expect(actionRef.current?.tagName).toBe("BUTTON");
    expect(linkActionRef.current?.tagName).toBe("A");
    expect(listRef.current).toBe(
      page.getByRole("list", { name: "Reports" }).element(),
    );
    expect(actionRef.current).toBe(
      page.getByRole("button", { name: "Open quarterly report" }).element(),
    );
    expect(linkActionRef.current).toBe(
      page.getByRole("link", { name: "Quarterly report link" }).element(),
    );
  });

  it("has no automated accessibility violations in canonical compositions", async () => {
    const { container } = await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Static report</ListItemContent>
        </ListItem>
        <ListItem>
          <ListItemContent>Static report with actions</ListItemContent>
          <span aria-label="Static report actions" role="group">
            <Button aria-label="Download static report" />
            <Button aria-label="Delete static report" />
          </span>
        </ListItem>
        <ListItem>
          <ListItemTrigger>
            <ListItemContent>Button report</ListItemContent>
          </ListItemTrigger>
          <Button aria-label="More button report actions" />
        </ListItem>
        <ListItem>
          <ListItemTrigger href="#linked-report">
            <ListItemContent>Linked report</ListItemContent>
          </ListItemTrigger>
          <Button aria-label="Download linked report" />
        </ListItem>
        <ListItem>
          <ListItemTrigger
            href="https://example.com/reports"
            render={<Link rel="noopener" target="_blank" />}
          >
            <ListItemContent>External report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    await runAxeScan(container);
  }, 30_000);

  it("preserves the accessible name of a custom rendered link", async () => {
    await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemTrigger
            href="https://example.com/reports"
            render={<Link rel="noopener" target="_blank" />}
          >
            <ListItemContent>External report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    const externalAction = page.getByRole("link");
    await expect
      .element(externalAction)
      .toHaveAttribute("href", "https://example.com/reports");
    await expect.element(externalAction).toHaveAttribute("target", "_blank");
    await expect
      .element(externalAction)
      .toHaveAccessibleName("External report Opens in a new tab");
  });
});
