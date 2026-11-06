import { FileDropZoneTrigger } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { dropFiles } from "~browser-test-utils/interactions";
import { act, renderWithSalt } from "~browser-test-utils/render";
import * as fileDropZoneStories from "~stories/file-drop-zone/file-drop-zone.stories";

const composedStories = composeStories(fileDropZoneStories);
const { Default } = composedStories;

function imageFile(name: string, contents = name) {
  return new File([contents], name, {
    lastModified: Date.now(),
    type: "image/jpg",
  });
}

// Chrome ignores `dropEffect` writes outside a real drag session, so make it
// writable to observe what the drop zone sets.
function withWritableDropEffect(dataTransfer: DataTransfer) {
  Object.defineProperty(dataTransfer, "dropEffect", {
    value: "unset",
    writable: true,
  });
  return dataTransfer;
}

function fileTransfer(files: File[]) {
  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  return withWritableDropEffect(dataTransfer);
}

function textTransfer() {
  const dataTransfer = new DataTransfer();
  dataTransfer.setData("text/plain", "not a file");
  return withWritableDropEffect(dataTransfer);
}

async function dispatchDrag(
  target: Element,
  type: "dragover" | "dragleave",
  init: DragEventInit,
) {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  await act(() => {
    target.dispatchEvent(event);
  });
  return event;
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

  describe("WHEN dragging over", () => {
    it("becomes active and allows copying when the drag contains files", async () => {
      const onDragOver = vi.fn();
      await renderWithSalt(<Default onDragOver={onDragOver} />);
      const dropZone = page.getByTestId("file-drop-zone-example");
      const dataTransfer = fileTransfer([imageFile("image")]);

      const event = await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer,
      });

      expect(event.defaultPrevented).toBe(true);
      expect(dataTransfer.dropEffect).toBe("copy");
      expect(onDragOver).toHaveBeenCalledTimes(1);
      await expect.element(dropZone).toHaveClass("saltFileDropZone-active");
    });

    it("rejects drags that don't contain files", async () => {
      await renderWithSalt(<Default />);
      const dropZone = page.getByTestId("file-drop-zone-example");
      const dataTransfer = textTransfer();

      const event = await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer,
      });

      expect(event.defaultPrevented).toBe(true);
      expect(dataTransfer.dropEffect).toBe("none");
      await expect.element(dropZone).not.toHaveClass("saltFileDropZone-active");
    });

    it("stops being active when the drag changes to one without files", async () => {
      await renderWithSalt(<Default />);
      const dropZone = page.getByTestId("file-drop-zone-example");

      await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer: fileTransfer([imageFile("image")]),
      });
      await expect.element(dropZone).toHaveClass("saltFileDropZone-active");

      await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer: textTransfer(),
      });
      await expect.element(dropZone).not.toHaveClass("saltFileDropZone-active");
    });

    it("rejects files and stays inactive when disabled", async () => {
      await renderWithSalt(<Default disabled />);
      const dropZone = page.getByTestId("file-drop-zone-example");
      const dataTransfer = fileTransfer([imageFile("image")]);

      const event = await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer,
      });

      expect(event.defaultPrevented).toBe(true);
      expect(dataTransfer.dropEffect).toBe("none");
      await expect.element(dropZone).not.toHaveClass("saltFileDropZone-active");
    });

    it("stops being active when files are dropped", async () => {
      await renderWithSalt(<Default />);
      const dropZone = page.getByTestId("file-drop-zone-example");
      const files = [imageFile("image")];

      await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer: fileTransfer(files),
      });
      await expect.element(dropZone).toHaveClass("saltFileDropZone-active");

      await act(() => {
        dropFiles(dropZone, files);
      });
      await expect.element(dropZone).not.toHaveClass("saltFileDropZone-active");
    });
  });

  describe("WHEN the drag leaves", () => {
    it("stops being active when the drag leaves the drop zone", async () => {
      const onDragLeave = vi.fn();
      await renderWithSalt(<Default onDragLeave={onDragLeave} />);
      const dropZone = page.getByTestId("file-drop-zone-example");

      await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer: fileTransfer([imageFile("image")]),
      });
      await expect.element(dropZone).toHaveClass("saltFileDropZone-active");

      await dispatchDrag(dropZone.element(), "dragleave", {
        relatedTarget: document.body,
      });
      await expect.element(dropZone).not.toHaveClass("saltFileDropZone-active");
      expect(onDragLeave).toHaveBeenCalledTimes(1);
    });

    it("stays active when the drag moves onto a child element", async () => {
      await renderWithSalt(<Default />);
      const dropZone = page.getByTestId("file-drop-zone-example");
      const trigger = page.getByTestId("file-input-trigger").element();

      await dispatchDrag(dropZone.element(), "dragover", {
        dataTransfer: fileTransfer([imageFile("image")]),
      });
      await expect.element(dropZone).toHaveClass("saltFileDropZone-active");

      await dispatchDrag(dropZone.element(), "dragleave", {
        relatedTarget: trigger,
      });
      await expect.element(dropZone).toHaveClass("saltFileDropZone-active");
    });
  });

  it("opens the file picker and calls onClick when the trigger is clicked", async () => {
    const onClick = vi.fn();
    const { container } = await renderWithSalt(
      <FileDropZoneTrigger onClick={onClick} />,
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) throw new Error("FileDropZoneTrigger did not render an input");
    const onInputClick = vi.fn((event: Event) => {
      // Stop the native file picker from opening.
      event.preventDefault();
    });
    input.addEventListener("click", onInputClick);

    await page.getByRole("button", { name: "Browse files" }).click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onInputClick).toHaveBeenCalledTimes(1);
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
