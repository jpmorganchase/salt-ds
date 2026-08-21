import { List, ListItem } from "@salt-ds/lab";
import { version } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

function listItem(index: number) {
  const element = document.getElementById(`list-item-${index}`);
  if (!element) throw new Error(`Missing list item ${index}`);
  return page.elementLocator(element);
}

describe("GIVEN a declarative List", () => {
  it("renders every child", async () => {
    await renderWithSalt(
      <List>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>,
    );
    for (const label of ["list item 1", "list item 2", "list item 3"]) {
      await expect.element(page.getByText(label)).toBeInTheDocument();
    }
  });

  it("highlights a hovered item", async () => {
    await renderWithSalt(
      <List id="list">
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>,
    );
    await listItem(1).hover();
    await expect
      .poll(() => listItem(1).element().className)
      .toMatch(/saltHighlighted/);
  });

  const selectionTest = version.startsWith("18") ? it.skip : it;
  selectionTest("selects a clicked item", async () => {
    const onSelectionChange = vi.fn();
    const onSelect = vi.fn();
    await renderWithSalt(
      <List id="list" onSelectionChange={onSelectionChange} onSelect={onSelect}>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>,
    );
    await listItem(1).click();
    await expect.element(listItem(1)).toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange.mock.calls[0][1]).toBe("list item 2");
    expect(onSelect.mock.calls[0][1]).toBe("list item 2");
  });
});

describe("GIVEN a declarative List with a disabled item", () => {
  let onChange = vi.fn<React.FormEventHandler<HTMLDivElement>>();
  beforeEach(async () => {
    onChange = vi.fn();
    await renderWithSalt(
      <List id="list" onChange={onChange}>
        <ListItem>list item 1</ListItem>
        <ListItem disabled>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>,
    );
  });

  it("renders the disabled style", async () => {
    await expect.element(listItem(1)).toHaveClass("saltDisabled");
  });

  it("does not select a disabled item", async () => {
    await listItem(1).click({ force: true });
    await expect
      .element(listItem(1))
      .not.toHaveAttribute("aria-selected", "true");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not highlight a disabled item", async () => {
    await listItem(1).hover();
    await expect
      .poll(() => listItem(1).element().className)
      .not.toMatch(/saltHighlighted/);
  });
});

describe("GIVEN a disabled declarative List", () => {
  let onChange = vi.fn<React.FormEventHandler<HTMLDivElement>>();
  beforeEach(async () => {
    onChange = vi.fn();
    await renderWithSalt(
      <List id="list" disabled onChange={onChange}>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>,
    );
  });

  it("uses the disabled style", async () => {
    await expect.element(page.getByRole("listbox")).toHaveClass("saltDisabled");
  });

  it("does not select any item", async () => {
    for (let index = 0; index < 3; index += 1)
      await listItem(index).click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });
});
