import {
  Banner,
  BannerContent,
  Button,
  FileDropZone,
  FileDropZoneIcon,
  type FileDropZoneIconProps,
  type FileDropZoneProps,
  FileDropZoneTrigger,
  type FileDropZoneTriggerProps,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type DragEvent,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

import {
  createFileTypeValidator,
  createTotalSizeValidator,
  type FilesValidator,
  validateFiles,
} from "./utils";

export default {
  title: "Core/File Drop Zone",
  component: FileDropZone,
} as Meta<typeof FileDropZone>;

const statusTitles = {
  success: "Upload completed",
  error: "Error uploading",
};

const FileDropzoneTemplate: StoryFn<
  FileDropZoneProps &
    FileDropZoneIconProps &
    FileDropZoneTriggerProps & {
      validate: readonly FilesValidator[];
    }
> = ({ accept, children, disabled, validate, onDrop, onChange, ...rest }) => {
  const [result, setResult] = useState<{
    files?: readonly File[];
    errors?: readonly string[];
  }>();
  const [status, setStatus] = useState<"success" | "error" | undefined>(
    undefined,
  );

  const handleFilesAccepted = (files: File[], event: SyntheticEvent) => {
    console.log("onFilesAccepted:", { files, event });
    setResult({ files });
    setStatus("success");
  };

  const handleFilesRejected = (errors: string[]) => {
    console.error("onFilesRejected:", { errors });
    setResult({ errors });
    setStatus("error");
  };

  const addFiles = (event: SyntheticEvent, files: File[]) => {
    if (!files) {
      const errors = ["Drop target doesn't contain any file."];
      return handleFilesRejected(errors);
    }
    if (files.length > 0) {
      const errors = validate ? validateFiles({ files, validate }) : [];
      if (errors && errors.length !== 0) {
        return handleFilesRejected(errors);
      }
      return handleFilesAccepted(files, event);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, files: File[]) => {
    addFiles(event, files);
    onDrop?.(event, files);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    files: File[],
  ) => {
    addFiles(event, files);
    onChange?.(event, files);
  };

  const reset = () => {
    setStatus(undefined);
    setResult({});
  };
  return (
    <StackLayout style={{ width: 250 }}>
      <Button onClick={reset}>Reset</Button>
      <FileDropZone
        data-testid="file-drop-zone-example"
        status={status}
        disabled={disabled}
        {...rest}
        onDrop={handleDrop}
      >
        <FileDropZoneIcon status={status} />
        <strong>
          {status !== undefined ? statusTitles[status] : "Drop files here or"}
        </strong>
        <FileDropZoneTrigger
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          data-testid="file-input-trigger"
        />
        {children}
      </FileDropZone>
      <Results result={result} />
    </StackLayout>
  );
};
export const Default = FileDropzoneTemplate.bind({});
Default.args = {};

export const Disabled = FileDropzoneTemplate.bind({});
Disabled.args = {
  disabled: true,
};

export const WithFileTypeValidation = FileDropzoneTemplate.bind({});
WithFileTypeValidation.args = {
  accept: ".png, .xls",
  children: "Only .png or .xls files.",
  validate: [createFileTypeValidator({ accept: ".png, .xls" })],
};

const validateFileType = createFileTypeValidator({ accept: "image/*" });
const validateTotalSize = createTotalSizeValidator({
  maxSize: 500 * 2 ** 10,
  getError: () => "The file/s exceed the maximum upload limit of 500KB.",
});
const validateFileName: FilesValidator = (files) =>
  files.map((file) => {
    if (file.name.length > 36) {
      return `File name ${file.name} is longer than 36 chars.`;
    }
    return undefined;
  });

export const WithMultipleValidations = FileDropzoneTemplate.bind({});
WithMultipleValidations.args = {
  accept: "image/*",
  children: (
    <Text>
      Images only.
      <br />
      500KB total file size limit.
      <br />
      36 chars File name limit.
    </Text>
  ),
  validate: [validateFileType, validateTotalSize, validateFileName],
};

interface ResultCardFile {
  name: string;
  size: number;
}

interface ResultCardType {
  files?: readonly ResultCardFile[];
  errors?: readonly string[];
  isUploading?: boolean;
}

interface ResultCardProps {
  result: ResultCardType | undefined;
}

const Results = ({ result }: ResultCardProps) => {
  const renderFiles = useCallback(
    (files: readonly ResultCardFile[]) =>
      files.length === 0 ? (
        <strong>No files selected.</strong>
      ) : (
        files.map(({ name, size }) => {
          const label = `${name} - ${size} bytes`;
          const longLabel = label.split("").length > 36;
          return (
            <Banner key={name} status="success" variant="secondary">
              <BannerContent>
                <Tooltip content={label} disabled={!longLabel}>
                  <Text maxRows={1}>{label}</Text>
                </Tooltip>
              </BannerContent>
            </Banner>
          );
        })
      ),
    [],
  );

  const renderErrors = useCallback(
    (errors: readonly string[]) =>
      errors.map((error) => {
        const longLabel = error.split("").length > 36;

        return (
          <Banner status="error" variant="secondary" key={error}>
            <BannerContent>
              <Tooltip content={error} disabled={!longLabel}>
                <Text maxRows={1}>{error}</Text>
              </Tooltip>
            </BannerContent>
          </Banner>
        );
      }),
    [],
  );
  return (
    <div style={{ height: 500, maxHeight: 500, overflow: "hidden" }}>
      {!result?.files && (
        <Banner>
          <BannerContent>
            <strong>No files have been added.</strong>
          </BannerContent>
        </Banner>
      )}
      {result?.files && renderFiles(result.files)}
      {result?.errors && renderErrors(result.errors)}
    </div>
  );
};
