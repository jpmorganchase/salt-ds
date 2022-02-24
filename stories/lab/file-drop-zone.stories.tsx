import { useState, useCallback, FC } from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { useDensity } from "@brandname/core";
import {
  createFileTypeValidator,
  createTotalSizeValidator,
  FileDropZone,
  FilesAcceptedEventHandler,
  FilesRejectedEventHandler,
  FilesValidator,
} from "@brandname/lab";
import { AllRenderer } from "../components";

export default {
  title: "Lab/File Drop Zone",
  component: FileDropZone,
} as ComponentMeta<typeof FileDropZone>;

export const Default: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  ...args
}) => {
  const [result, setResult] = useState<{ files: readonly File[] }>();

  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });
      setResult({ files });

      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  return (
    <>
      <FileDropZone
        data-testid="file-drop-zone-example"
        onFilesAccepted={handleFilesAccepted}
        {...args}
      />
      <ResultCard result={result} />
    </>
  );
};
Default.args = {};

export const Disabled: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  ...args
}) => {
  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });

      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  return (
    <FileDropZone
      data-testid="file-drop-zone-example"
      disabled
      onFilesAccepted={handleFilesAccepted}
      {...args}
    />
  );
};
Disabled.args = {};

export const WithCustomText: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  ...args
}) => {
  const [result, setResult] = useState<{ files: readonly File[] }>();

  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });
      setResult({ files });

      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  return (
    <>
      <FileDropZone
        data-testid="file-drop-zone-example"
        onFilesAccepted={handleFilesAccepted}
        {...args}
      >
        Some custom text
      </FileDropZone>
      <ResultCard result={result} />
    </>
  );
};
WithCustomText.args = {};

export const WithFileTypeValidation: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  onFilesRejected,
  ...args
}) => {
  const ACCEPTED_TYPES = ".png, .xls";
  const validateFileType = createFileTypeValidator({ accept: ACCEPTED_TYPES });

  const [result, setResult] = useState<{
    files?: readonly File[];
    errors?: readonly string[];
  }>();

  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });
      setResult({ files });

      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  const handleFilesRejected = useCallback<FilesRejectedEventHandler>(
    (errors, event) => {
      console.error("onFilesRejected:", { errors });
      setResult({ errors });

      onFilesRejected?.(errors, event);
    },
    [onFilesRejected]
  );

  return (
    <>
      <FileDropZone
        accept={ACCEPTED_TYPES}
        data-testid="file-drop-zone-example"
        description="Only .png or .xls files."
        onFilesAccepted={handleFilesAccepted}
        onFilesRejected={handleFilesRejected}
        validate={[validateFileType]}
        {...args}
      />
      <ResultCard result={result} />
    </>
  );
};
WithFileTypeValidation.args = {};

export const WithMultipleValidations: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  onFilesRejected,
  ...args
}) => {
  const width = {
    high: 150,
    medium: 180,
    low: 210,
    touch: 250,
  };
  const ACCEPTED_TYPES = "image/*";
  const ONE_KB = Math.pow(2, 10);
  const MAX_KB = 500;
  const MAX_CHARS = 35;

  const fakeServiceCall = () =>
    new Promise((resolve) => setTimeout(resolve, 1500));

  const validateFileType = createFileTypeValidator({ accept: ACCEPTED_TYPES });

  const validateTotalSize = createTotalSizeValidator({
    maxSize: MAX_KB * ONE_KB,
    getError: () =>
      `The file/s exceed the maximum upload limit of ${MAX_KB}KB.`,
  });

  const validateFileName: FilesValidator = (files) =>
    files.map((file) => {
      if (file.name.length > MAX_CHARS) {
        return `File name ${file.name} is longer than ${MAX_CHARS} chars.`;
      }
      return undefined;
    });

  const [result, setResult] = useState<{
    files?: readonly ResultCardFile[];
    isUploading: boolean;
    errors?: readonly string[];
  }>();

  const density = useDensity();

  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });

      const fileValues: readonly ResultCardFile[] = files.map((f) => ({
        name: f.name,
        size: f.size,
      }));

      setResult({
        files: fileValues,
        isUploading: true,
      });

      // call a fake service on accepting files
      void fakeServiceCall().then(() => {
        setResult({
          files: fileValues,
          isUploading: false,
        });
      });

      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  const handleFilesRejected = useCallback<FilesRejectedEventHandler>(
    (errors, event) => {
      console.error("onFilesRejected:", { errors });
      setResult({
        errors,
        isUploading: false,
      });

      onFilesRejected?.(errors, event);
    },
    [onFilesRejected]
  );

  return (
    <>
      <FileDropZone
        accept={ACCEPTED_TYPES}
        data-testid="file-drop-zone-example"
        description={`${MAX_KB}KB total file size limit. Accept only images with file name no more than ${MAX_CHARS} chars.`}
        style={{ width: width[density] }}
        onFilesAccepted={handleFilesAccepted}
        onFilesRejected={handleFilesRejected}
        validate={[validateFileType, validateFileName, validateTotalSize]}
        {...args}
      />
      <ResultCard result={result} />
    </>
  );
};
WithMultipleValidations.args = {};

export const WithTotalSizeValidation: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  onFilesRejected,
  ...args
}) => {
  const ONE_KB = Math.pow(2, 10);
  const MAX_KB = 500;

  const validateTotalSize = createTotalSizeValidator({
    maxSize: MAX_KB * ONE_KB,
    getError: () =>
      `The file/s exceed the maximum upload limit of ${MAX_KB}KB.`,
  });
  const [result, setResult] = useState<{
    files?: readonly File[];
    errors?: readonly string[];
  }>();

  const handleFilesAccepted = useCallback<FilesAcceptedEventHandler>(
    (files, event) => {
      console.log("onFilesAccepted:", { files, event });
      setResult({ files });

      onFilesAccepted?.(files, event);
    },
    [onFilesAccepted]
  );

  const handleFilesRejected = useCallback<FilesRejectedEventHandler>(
    (errors, event) => {
      console.error("onFilesRejected:", { errors });
      setResult({ errors });

      onFilesRejected?.(errors, event);
    },
    [onFilesRejected]
  );

  return (
    <>
      <FileDropZone
        accept=".png, .jpg"
        data-testid="file-drop-zone-example"
        description="500KB total file size limit."
        onFilesAccepted={handleFilesAccepted}
        onFilesRejected={handleFilesRejected}
        validate={[validateTotalSize]}
        {...args}
      />
      <ResultCard result={result} />
    </>
  );
};
WithTotalSizeValidation.args = {};

// Increase the size, to show content will be centered
export const StretchSize: ComponentStory<typeof FileDropZone> = (props) => {
  return (
    <FileDropZone
      data-testid="file-drop-zone-example"
      onFilesAccepted={(files, event) => {
        console.log("onFilesAccepted:", { files, event });
      }}
      style={{ width: 400, height: 400 }}
      description="Some custom description."
      {...props}
    />
  );
};

export const All: ComponentStory<typeof FileDropZone> = ({
  onFilesAccepted,
  ...args
}) => {
  return (
    <AllRenderer>
      <FileDropZone {...args} />
    </AllRenderer>
  );
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

export const ResultCard: FC<ResultCardProps> = ({ result }) => {
  const renderFiles = useCallback(
    (files: readonly ResultCardFile[]) =>
      files.length === 0 ? (
        <strong>No files selected.</strong>
      ) : (
        <div>
          <strong>Files:</strong>
          <ul>
            {files.map(({ name, size }) => (
              <li key={name}>
                {name} - {size} bytes
              </li>
            ))}
          </ul>
        </div>
      ),
    []
  );

  const renderErrors = useCallback(
    (errors: readonly string[]) => (
      <div style={{ color: "firebrick" }}>
        <strong>Errors:</strong>
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    ),
    []
  );

  return (
    <div
      style={{
        fontFamily: "uitk-sans",
        lineHeight: "1.85em",
        marginTop: "2em",
        padding: "1em 1em 0 1em",
        border: "1px solid lightgrey",
        fontSize: 12,
        width: 450,
      }}
    >
      {!result && <strong>No files have been added.</strong>}
      {result && result.files && renderFiles(result.files)}
      {result && result.errors && renderErrors(result.errors)}
      <em style={{ display: "block" }}>
        This card is for example only. It is not a part of the FileDropZone
        component. <br />
        <strong>Note:</strong> No information about files you upload to this
        example will be stored on our servers.
      </em>
    </div>
  );
};
