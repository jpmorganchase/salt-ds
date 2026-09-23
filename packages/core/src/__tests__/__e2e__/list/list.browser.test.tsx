import {
  Button,
  List,
  ListItem,
  ListItemActions,
  ListItemContent,
  ListItemTrigger,
} from "@salt-ds/core";
import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";
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

function FormExample({ submit = false }: { submit?: boolean }) {
  const [submissions, setSubmissions] = useState(0);
  const label = submit ? "Submit report" : "Run report";

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
            render={submit ? <button type="submit" /> : undefined}
          >
            <ListItemContent>{label}</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>
      <output aria-label={`${label} submission count`}>{submissions}</output>
    </form>
  );
}

describe("List", () => {
  it("uses native unordered and ordered list semantics", async () => {
    await renderWithSalt(
      <>
        <List aria-label="Recent reports">
          <ListItem>Quarterly report</ListItem>
        </List>
        <List aria-label="Report priority" render={<ol reversed start={3} />}>
          <ListItem>Annual report</ListItem>
        </List>
      </>,
    );

    const recentReports = page.getByRole("list", { name: "Recent reports" });
    expect(recentReports.element().tagName).toBe("UL");
    await expect
      .element(recentReports.getByRole("listitem"))
      .toHaveTextContent("Quarterly report");

    const reportPriority = page.getByRole("list", { name: "Report priority" });
    expect(reportPriority.element().tagName).toBe("OL");
    await expect.element(reportPriority).toHaveAttribute("reversed");
    await expect.element(reportPriority).toHaveAttribute("start", "3");
    await expect
      .element(reportPriority.getByRole("listitem"))
      .toHaveTextContent("Annual report");
  });

  it("keeps static rows out of the keyboard sequence", async () => {
    await renderWithSalt(
      <>
        <List aria-label="Reports">
          <ListItem>
            <ListItemContent>Static report</ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>Quarterly report</ListItemContent>
            <ListItemActions aria-label="Quarterly report actions" role="group">
              <Button aria-label="Download quarterly report" />
              <Button aria-label="Delete quarterly report" />
            </ListItemActions>
          </ListItem>
        </List>
        <Button>After list</Button>
      </>,
    );

    await expect
      .element(
        page.getByRole("list", { name: "Reports" }).getByRole("listitem"),
      )
      .toHaveLength(2);
    const actions = page.getByRole("group", {
      name: "Quarterly report actions",
    });

    await userEvent.tab();
    await expect
      .element(
        actions.getByRole("button", { name: "Download quarterly report" }),
      )
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(actions.getByRole("button", { name: "Delete quarterly report" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After list" }))
      .toHaveFocus();
  });

  it("moves through and activates row actions in document order", async () => {
    const runSpy = vi.fn();
    const linkSpy = vi.fn();

    await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemTrigger onClick={runSpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemTrigger>
          <ListItemActions>
            <Button aria-label="More run report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            href="#quarterly"
            onClick={(event) => {
              event.preventDefault();
              linkSpy();
            }}
          >
            <ListItemContent>Open quarterly report</ListItemContent>
          </ListItemTrigger>
          <ListItemActions>
            <Button aria-label="More quarterly report actions" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    const runReport = page.getByRole("button", { name: "Run report" });
    await userEvent.tab();
    await expect.element(runReport).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(runSpy).toHaveBeenCalledOnce();

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "More run report actions" }))
      .toHaveFocus();

    const quarterlyReport = page.getByRole("link", {
      name: "Open quarterly report",
    });
    await userEvent.tab();
    await expect.element(quarterlyReport).toHaveFocus();
    await expect.element(quarterlyReport).toHaveAttribute("href", "#quarterly");
    await userEvent.keyboard("{Enter}");
    expect(linkSpy).toHaveBeenCalledOnce();

    await userEvent.tab();
    await expect
      .element(
        page.getByRole("button", { name: "More quarterly report actions" }),
      )
      .toHaveFocus();
  });

  it("does not submit a form unless rendered as a submit button", async () => {
    await renderWithSalt(
      <>
        <FormExample />
        <FormExample submit />
      </>,
    );

    await page.getByRole("button", { name: "Run report" }).click();
    await expect
      .element(
        page.getByRole("status", { name: "Run report submission count" }),
      )
      .toHaveTextContent("0");

    await page.getByRole("button", { name: "Submit report" }).click();
    await expect
      .element(
        page.getByRole("status", { name: "Submit report submission count" }),
      )
      .toHaveTextContent("1");
  });

  it("integrates with routing links", async () => {
    const navigationSpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger
            href="/reports/quarterly"
            onClick={(event) => {
              event.preventDefault();
              navigationSpy();
            }}
            render={({ href, ...props }) => <RouterLink {...props} to={href} />}
          >
            <ListItemContent>Quarterly report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    const reportLink = page.getByRole("link", { name: "Quarterly report" });
    await expect
      .element(reportLink)
      .toHaveAttribute("href", "/reports/quarterly");
    await reportLink.click();
    expect(navigationSpy).toHaveBeenCalledOnce();
  });

  it("keeps secondary actions available when the primary action is disabled", async () => {
    const primarySpy = vi.fn();
    const downloadSpy = vi.fn();

    await renderWithSalt(
      <List>
        <ListItem>
          <ListItemTrigger disabled onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemTrigger>
          <ListItemActions>
            <Button aria-label="Download report" onClick={downloadSpy} />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    await expect
      .element(page.getByRole("button", { name: "Run report" }))
      .toBeDisabled();
    await userEvent.tab();

    const download = page.getByRole("button", { name: "Download report" });
    await expect.element(download).toHaveFocus();
    await download.click();
    expect(downloadSpy).toHaveBeenCalledOnce();
    expect(primarySpy).not.toHaveBeenCalled();
  });

  it("has no automated accessibility violations in canonical compositions", async () => {
    const { container } = await renderWithSalt(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Static report</ListItemContent>
        </ListItem>
        <ListItem>
          <ListItemContent>Static report with actions</ListItemContent>
          <ListItemActions aria-label="Static report actions" role="group">
            <Button aria-label="Download static report" />
            <Button aria-label="Delete static report" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemTrigger>
            <ListItemContent>Button report</ListItemContent>
          </ListItemTrigger>
          <ListItemActions>
            <Button aria-label="More button report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemTrigger href="#linked-report">
            <ListItemContent>Linked report</ListItemContent>
          </ListItemTrigger>
          <ListItemActions>
            <Button aria-label="Download linked report" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            aria-label="External report, opens in a new tab"
            href="https://example.com/reports"
            rel="noopener"
            target="_blank"
          >
            <ListItemContent>External report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>,
    );

    await runAxeScan(container);
  }, 30_000);
});
