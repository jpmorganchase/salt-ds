import { DragEvent } from "react";
import { FilesValidator } from "../validators";

export const toArray = (obj: any) => Object.keys(obj).map((key) => obj[key]);

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
      return toArray(e.dataTransfer.files);
    }

    if (e.target) {
      return toArray((e.target as HTMLInputElement).files);
    }
  }

  return [];
};

export const validateFiles = ({
  files = [],
  validate = [],
}: {
  files: readonly File[];
  validate: readonly FilesValidator[];
}) =>
  validate
    .reduce(
      (result, validator) => result.concat(validator(files)),
      [] as (string | undefined)[]
    )
    .filter(Boolean) as string[];
