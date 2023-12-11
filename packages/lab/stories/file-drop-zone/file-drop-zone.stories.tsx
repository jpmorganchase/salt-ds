import { useState, useCallback, useEffect } from "react";

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
  FilesAcceptedEventHandler,
  FilesRejectedEventHandler,
  FilesValidator,
} from "@salt-ds/lab";
import { AllRenderer } from "docs/components";

export default {
  title: "Lab/File Drop Zone",
  component: FileDropZone,
} as Meta<typeof FileDropZone>;

export const All: StoryFn<typeof FileDropZone> = ({
  onFilesAccepted,
  ...args
}) => {
  return (
    <AllRenderer>
      <FileDropZone {...args} />
    </AllRenderer>
  );
};

const FileDropzoneTemplate: StoryFn<typeof FileDropZone> = ({
  onFilesAccepted,
  onFilesRejected,
  ...args
}) => {
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
  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });
      setResult({ files });
      setStatus("success");
      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  const handleFilesRejected = useCallback<FilesRejectedEventHandler>(
    (errors, event) => {
      console.error("onFilesRejected:", { errors });
      setResult({ errors });
      setStatus("error");
      onFilesRejected?.(errors, event);
    },
    [onFilesRejected]
  );
  return (
    <StackLayout style={{ width: 250 }}>
      <FileDropZone
        data-testid="file-drop-zone-example"
        onFilesAccepted={handleFilesAccepted}
        onFilesRejected={handleFilesRejected}
        status={status}
        {...args}
      ></FileDropZone>
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
