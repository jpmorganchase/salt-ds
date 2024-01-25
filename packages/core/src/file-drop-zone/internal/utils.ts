import { DragEvent } from "react";

export const containsFiles = (e: DragEvent) => {
  if (!e.dataTransfer) {
    const target = e.target as HTMLInputElement;
    return target?.files;
  }

  return Array.prototype.some.call(
    e.dataTransfer.types,
    (type) => type === "Files"
  );
};

export const extractFiles = (e: DragEvent): File[] => {
  if (containsFiles(e)) {
    if (e.dataTransfer) {
      return Array.from(e.dataTransfer.files);
    }

    if (e.target) {
      return Array.from((e.target as HTMLInputElement).files ?? []);
    }
  }

  return [];
};
