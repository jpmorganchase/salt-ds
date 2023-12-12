import {
  useState,
  useCallback,
  useEffect,
  SyntheticEvent,
  DragEvent,
} from "react";

import { Meta, StoryFn } from "@storybook/react";
import {
  Banner,
  BannerContent,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import {
  createFileTypeValidator,
  createTotalSizeValidator,
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneIconProps,
  FileDropZoneProps,
  FileDropZoneTrigger,
  FileDropZoneTriggerProps,
  FilesValidator,
} from "@salt-ds/lab";
import { AllRenderer } from "docs/components";
import {
  containsFiles,
  extractFiles,
  validateFiles,
} from "../../src/file-drop-zone/internal/utils";

export default {
  title: "Lab/File Drop Zone",
  component: FileDropZone,
} as Meta<typeof FileDropZone>;

export const All: StoryFn<typeof FileDropZone> = ({ onDrop, ...args }) => {
  return (
    <AllRenderer>
      <FileDropZone {...args}>
        <FileDropZoneIcon/>
        <strong>Drop files here or</strong>
        <FileDropZoneTrigger/>
      </FileDropZone>
    </AllRenderer>
  );
};

const FileDropzoneTemplate: StoryFn<
  FileDropZoneProps & FileDropZoneIconProps & FileDropZoneTriggerProps & {validate: readonly FilesValidator[];}
> = ({ accept, children, disabled, validate, ...rest }) => {
  const [result, setResult] = useState<{
    files?: readonly File[];
    errors?: readonly string[];
  }>();
  const [status, setStatus] = useState<"success" | "error" | undefined>(
    undefined
  );
  const delay = 3000;

  useEffect(() => {
    const t = setTimeout(() => {
      if (status === "success") {
        setStatus(undefined);
      }
    }, delay);

    return () => {
      clearTimeout(t);
    };
  }, [status]);

  const handleFilesAccepted = (
    files: File[],
    event: SyntheticEvent
  ) => {
    console.log("onFilesAccepted:", { files, event });
    setResult({ files });
    setStatus("success");
  };

  const handleFilesRejected = (errors: string[]) => {
    console.error("onFilesRejected:", { errors });
    setResult({ errors });
    setStatus("error");
  };

  const handleFilesDrop = (event: SyntheticEvent) => {
    event.stopPropagation();
    if (!containsFiles(event as DragEvent)) {
      const errors = ["Drop target doesn't contain any file."];
      return handleFilesRejected(errors);
    }
    const files = extractFiles(event as DragEvent);
    if (files.length > 0) {
      const errors = validate ? validateFiles({ files, validate }): [];
      if (errors && errors.length !== 0) {
        return handleFilesRejected(errors);
      }
      return handleFilesAccepted(files, event);
    }
  };

  const statusTitles = {"success": "Upload completed", "error": "Error uploading"}

  return (
    <StackLayout style={{ width: 250 }}>
      <FileDropZone
        data-testid="file-drop-zone-example"
        status={status}
        onDrop={handleFilesDrop}
        disabled={disabled}
        {...rest}
      >
        <FileDropZoneIcon status={status} />
        <strong>
          {status !== undefined ? statusTitles[status] : "Drop files here or"}
        </strong>
        <FileDropZoneTrigger accept={accept} disabled={disabled} onChange={handleFilesDrop} />
        {children}
      </FileDropZone>
      <ResultCard result={result} />
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
  maxSize: 500 * Math.pow(2, 10),
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
    <p>
      Images only.
      <br />
      500KB total file size limit.
      <br />
      36 chars File name limit.
    </p>
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

export const ResultCard = ({ result }: ResultCardProps) => {
  const renderFiles = useCallback(
    (files: readonly ResultCardFile[]) =>
      files.length === 0 ? (
        <strong>No files selected.</strong>
      ) : (
        files.map(({ name, size }) => {
          const label = `${name} - ${size} bytes`;
          const longLabel = label.split("").length > 36;
          return (
            <Banner key={name} status="success" variant={"secondary"}>
              <BannerContent>
                <Tooltip content={label} disabled={!longLabel}>
                  <Text maxRows={1}>{label}</Text>
                </Tooltip>
              </BannerContent>
            </Banner>
          );
        })
      ),
    []
  );

  const renderErrors = useCallback(
    (errors: readonly string[]) =>
      errors.map((error) => {
        const longLabel = error.split("").length > 36;

        return (
          <Banner status="error" variant={"secondary"} key={error}>
            <BannerContent>
              <Tooltip content={error} disabled={!longLabel}>
                <Text maxRows={1}>{error}</Text>
              </Tooltip>
            </BannerContent>
          </Banner>
        );
      }),
    []
  );
  return (
    <>
      {!result && (
        <Banner>
          <BannerContent>
            <strong>No files have been added.</strong>
          </BannerContent>
        </Banner>
      )}
      {result?.files && renderFiles(result.files)}
      {result?.errors && renderErrors(result.errors)}
    </>
  );
};
