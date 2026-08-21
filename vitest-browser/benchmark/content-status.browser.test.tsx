import { ContentStatus } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

function liveRegionText() {
  return Array.from(document.querySelectorAll("[aria-live='polite']"))
    .map((element) => element.textContent ?? "")
    .join(" ");
}

describe("GIVEN ContentStatus", () => {
  it("renders the default info state without content", async () => {
    await renderWithSalt(<ContentStatus id="1" />);
    expect(page.getByRole("region").elements()).toHaveLength(0);
    await expect
      .element(page.getByRole("img", { name: "info" }))
      .toBeInTheDocument();
  });

  it("renders and announces loading", async () => {
    await renderWithSalt(<ContentStatus id="1" status="loading" />);
    expect(page.getByRole("region").elements()).toHaveLength(0);
    await expect.element(page.getByTestId("spinner-1")).toBeInTheDocument();
    await expect.poll(liveRegionText).toContain("loading");
  });

  it.each(["warning", "error", "success"] as const)(
    "renders and announces %s",
    async (status) => {
      await renderWithSalt(<ContentStatus id="1" status={status} />);
      expect(page.getByRole("region").elements()).toHaveLength(0);
      await expect
        .element(page.getByRole("img", { name: status }))
        .toBeInTheDocument();
      await expect.poll(liveRegionText).toContain(status);
    },
  );

  it("renders and announces a title", async () => {
    await renderWithSalt(<ContentStatus id="1" title="Test Title" />);
    await expect.poll(liveRegionText).toContain("Test Title info");
    expect(page.getByRole("region").element().children).toHaveLength(1);
    await expect.element(page.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders and announces a message", async () => {
    await renderWithSalt(<ContentStatus id="1" message="Test message" />);
    await expect.poll(liveRegionText).toContain("Test message info");
    expect(page.getByRole("region").element().children).toHaveLength(1);
    await expect.element(page.getByText("Test message")).toBeInTheDocument();
  });

  it("renders and invokes the default action", async () => {
    const onActionClick = vi.fn();
    await renderWithSalt(
      <ContentStatus
        actionLabel="My Label"
        id="1"
        onActionClick={onActionClick}
      />,
    );
    await expect.poll(liveRegionText).toContain("info");
    expect(page.getByRole("region").element().children).toHaveLength(1);
    await page.getByText("My Label").click();
    expect(onActionClick).toHaveBeenCalledOnce();
  });

  it("does not render an action without actionLabel", async () => {
    const onActionClick = vi.fn();
    await renderWithSalt(
      <ContentStatus id="1" onActionClick={onActionClick} />,
    );
    expect(page.getByRole("region").elements()).toHaveLength(0);
    expect(page.getByText("My Label").elements()).toHaveLength(0);
    expect(onActionClick).not.toHaveBeenCalled();
  });

  it("does not render an action without onActionClick", async () => {
    await renderWithSalt(<ContentStatus actionLabel="My Label" id="1" />);
    expect(page.getByRole("region").elements()).toHaveLength(0);
    expect(page.getByText("My Label").elements()).toHaveLength(0);
  });

  it("renders children as actions", async () => {
    await renderWithSalt(
      <ContentStatus id="1">
        <div>Test Children</div>
      </ContentStatus>,
    );
    expect(page.getByRole("region").element().children).toHaveLength(1);
    await expect.element(page.getByText("Test Children")).toBeInTheDocument();
  });

  it("calls buttonRef when the action mounts", async () => {
    const buttonRef = vi.fn();
    await renderWithSalt(
      <ContentStatus
        actionLabel="My Label"
        buttonRef={buttonRef}
        id="1"
        onActionClick={vi.fn()}
      />,
    );
    await expect.element(page.getByRole("button")).toBeInTheDocument();
    expect(buttonRef).toHaveBeenCalledOnce();
  });

  it("announces a new status without a spinner completion message", async () => {
    await renderWithSalt(<ContentStatus id="1" status="loading" />);
    await expect.poll(liveRegionText).toContain("loading");
    await renderWithSalt(<ContentStatus id="1" status="success" />);
    await expect.poll(liveRegionText).not.toContain("finished loading");
    await expect.poll(liveRegionText).toContain("success");
  });

  it("can disable announcements", async () => {
    await renderWithSalt(
      <ContentStatus disableAnnouncer id="1" status="loading" />,
    );
    expect(liveRegionText()).not.toContain("loading");
  });

  it("passes SpinnerProps through", async () => {
    await renderWithSalt(
      <ContentStatus
        SpinnerProps={{
          "aria-label": "Loading component",
          announcerInterval: 2000,
        }}
        status="loading"
      />,
    );
    await expect.poll(liveRegionText).toContain("Loading component");
  });
});
