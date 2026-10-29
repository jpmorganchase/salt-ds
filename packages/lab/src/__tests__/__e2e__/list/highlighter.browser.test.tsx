import { Highlighter } from "@salt-ds/lab";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const text = "Lorem ipsum dolor sit amet";

describe("A highlighter", () => {
  it("handles empty text", async () => {
    await renderWithSalt(
      <span data-testid="test-string">
        <Highlighter text="" />
      </span>,
    );
    await expect.element(page.getByTestId("test-string")).toHaveTextContent("");
  });

  it("does not highlight without a match pattern", async () => {
    await renderWithSalt(<Highlighter text={text} />);
    await expect.element(page.getByText(text)).toBeInTheDocument();
  });

  it("does not highlight when a string does not match", async () => {
    await renderWithSalt(<Highlighter matchPattern="not found" text={text} />);
    await expect.element(page.getByText(text)).toBeInTheDocument();
  });

  it("highlights every string match and preserves the full text", async () => {
    await renderWithSalt(
      <span data-testid="test-string">
        <Highlighter matchPattern="OR" text={text} />
      </span>,
    );
    expect(
      document.querySelectorAll(".saltHighlighter-highlight"),
    ).toHaveLength(2);
    await expect
      .element(page.getByTestId("test-string"))
      .toHaveTextContent(text);
  });

  it("does not highlight when a regular expression does not match", async () => {
    await renderWithSalt(
      <Highlighter matchPattern={/(not found)/gi} text={text} />,
    );
    await expect.element(page.getByText(text)).toBeInTheDocument();
  });

  it("highlights every regular-expression match", async () => {
    await renderWithSalt(
      <span data-testid="test-string">
        <Highlighter matchPattern={/(\w{1,2}m)/gi} text={text} />
      </span>,
    );
    for (const match of ["rem", "sum", "am"]) {
      await expect
        .element(page.getByText(match, { exact: true }))
        .toHaveClass("saltHighlighter-highlight");
    }
    await expect
      .element(page.getByTestId("test-string"))
      .toHaveTextContent(text);
  });
});
