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
      [] as (string | undefined)[],
    )
    .filter(Boolean) as string[];

export type FilesValidator<ErrorType = string> = (
  files: readonly File[],
) =>
  | readonly (ErrorType | string | undefined)[]
  | ErrorType
  | string
  | undefined;

const trimSlashAsterisk = (type: string) => type.replace(/\/.*$/, "");

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
    const validateFile = (file: File) => {
      const acceptedTypes = accept.toLowerCase().split(",");
      const fileName = (file.name || "").toLowerCase();
      const fileType = (file.type || "").toLowerCase();

      const accepted = acceptedTypes.some((acceptedType) => {
        const type = acceptedType.trim();
        if (type.startsWith(".")) {
          return fileName.endsWith(type);
        }
        if (type.endsWith("/*")) {
          return trimSlashAsterisk(fileType) === trimSlashAsterisk(type);
        }
        return fileType === type;
      });

      if (!accepted) {
        return getError
          ? getError(file)
          : `File ${file.name} does not have an accepted type.`;
      }
    };

    return files.map(validateFile);
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
