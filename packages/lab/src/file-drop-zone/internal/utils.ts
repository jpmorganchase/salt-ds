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
