// TODO: verify whether we still needs to this library
// HTML5's `accept` should be ok for the browsers we want to support.
import accepts from "attr-accept";

export type FilesValidator<ErrorType = string> = (
  files: ReadonlyArray<File>
) =>
  | ReadonlyArray<ErrorType | string | undefined>
  | ErrorType
  | string
  | undefined;

/**
 * Factory method for creating a common file type validator.
 *
 * @param {string} accept - It is the same as 'accept' attribute for HTML <input>.
 * @param {function} getError - A callback function for generating a customised user error.
 */
export function createFileTypeValidator<ErrorType = string>({
  accept,
  getError,
}: {
  accept: string;
  getError?: (file: File) => ErrorType;
}): FilesValidator<ErrorType> {
  return (files) => {
    const validate = (file: File) => {
      if (!accepts(file, accept)) {
        return getError
          ? getError(file)
          : `File ${file.name} does not have an accepted type.`;
      }
    };

    return files.map(validate);
  };
}

/**
 * Factory method for creating a common total selection size validator.
 *
 * @param {number} maxSize - Max selection size in bytes.
 * @param {function} getError - A callback function for generating a customised user error.
 */
export function createTotalSizeValidator<ErrorType = string>({
  maxSize,
  getError,
}: {
  maxSize: number;
  getError?: (totalSize: number) => ErrorType;
}): FilesValidator<ErrorType> {
  return (files) => {
    const totalSize = files.reduce((size, file) => size + file.size, 0);

    if (totalSize > maxSize) {
      return getError
        ? getError(totalSize)
        : `The file/s exceed the maximum upload limit of ${maxSize} bytes.`;
    }
  };
}
