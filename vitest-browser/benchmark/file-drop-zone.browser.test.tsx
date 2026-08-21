import { FileDropZoneTrigger } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as fileDropZoneStories from "~stories/file-drop-zone/file-drop-zone.stories";
import { dropFiles } from "../interactions";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(fileDropZoneStories);
const { Default } = composedStories;

function imageFile(name: string, contents = name) {
  return new File([contents], name, {
    lastModified: Date.now(),
    type: "image/jpg",
  });
}

describe("Given a file drop zone", () => {
  checkAccessibility(composedStories);

  it("renders an input that accepts one file", async () => {
    const { container } = await renderWithSalt(<Default />);
    expect(container.querySelector("input")).toHaveAttribute("type", "file");
  });

  it("accepts files on drop", async () => {
    await renderWithSalt(<Default />);
    const dropZone = page.getByTestId("file-drop-zone-example");
    dropFiles(dropZone, [imageFile("image", "file")]);
    await expect.element(dropZone).toHaveClass("saltFileDropZone-success");
  });

  it("accepts multiple files", async () => {
    const onDrop = vi.fn();
    await renderWithSalt(<Default multiple onDrop={onDrop} />);
    const dropZone = page.getByTestId("file-drop-zone-example");
    dropFiles(dropZone, [imageFile("image1"), imageFile("image2")]);

    await expect.poll(() => onDrop.mock.calls.length).toBe(1);
    await expect.element(dropZone).toHaveClass("saltFileDropZone-success");
  });

  it("selects the same file from the button after reset", async () => {
    const onChange = vi.fn();
    const { container } = await renderWithSalt(
      <Default multiple onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) throw new Error("FileDropZone did not render a file input");
    const fileInput = page.elementLocator(input);
    const file = imageFile("image1");

    await userEvent.upload(fileInput, file);
    await expect.poll(() => onChange.mock.calls.length).toBe(1);
    await page.getByRole("button", { name: "Reset" }).click();
    await userEvent.upload(fileInput, file);
    await expect.poll(() => onChange.mock.calls.length).toBe(2);
  });

  it("triggers onDrop when files are dropped", async () => {
    const onDrop = vi.fn();
    await renderWithSalt(<Default onDrop={onDrop} />);
    dropFiles(page.getByTestId("file-drop-zone-example"), [
      imageFile("image1"),
    ]);
    await expect.poll(() => onDrop.mock.calls.length).toBe(1);
  });

  it("prevents native behavior without onDrop for non-files", async () => {
    const onDrop = vi.fn();
    await renderWithSalt(<Default onDrop={onDrop} />);
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/uri-list", "https://example.com");
    const event = new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    });

    expect(
      page.getByTestId("file-drop-zone-example").element().dispatchEvent(event),
    ).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("does not accept dropped files when disabled", async () => {
    const onDrop = vi.fn();
    await renderWithSalt(<Default disabled onDrop={onDrop} />);
    const dropZone = page.getByTestId("file-drop-zone-example");
    dropFiles(dropZone, [imageFile("image", "file")]);

    expect(onDrop).not.toHaveBeenCalled();
    await expect.element(dropZone).not.toHaveClass("saltFileDropZone-success");
  });

  it("is disabled when the prop is passed", async () => {
    const { container } = await renderWithSalt(<Default disabled />);
    expect(container.querySelector("input")).toBeDisabled();
    await expect.element(page.getByTestId("file-input-trigger")).toBeDisabled();
  });

  it("focuses the file input trigger in tab order", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(page.getByTestId("file-input-trigger")).toHaveFocus();
  });

  it("applies the name prop to the file input", async () => {
    const { container } = await renderWithSalt(
      <FileDropZoneTrigger name="attachments" data-testid="named-trigger" />,
    );
    expect(container.querySelector('input[type="file"]')).toHaveAttribute(
      "name",
      "attachments",
    );
  });
});
