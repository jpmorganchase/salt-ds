import { faker } from "@faker-js/faker";
import {
  Button,
  Divider,
  FileDropZone,
  FileDropZoneIcon,
  FileDropZoneTrigger,
  FlexLayout,
  Spinner,
  StackLayout,
  StatusIndicator,
  Text,
  Tooltip,
  useId,
} from "@salt-ds/core";
import {
  DeleteIcon,
  PauseIcon,
  PlayIcon,
  ProgressOnholdIcon,
  RefreshIcon,
} from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import type { Meta } from "@storybook/react-vite";
import { clsx } from "clsx";
import {
  Fragment,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

export default {
  title: "Patterns/File Upload",
} as Meta;

type FileItemStatus =
  | "initial"
  | "failedValidation"
  | "success"
  | "uploading"
  | "paused"
  | "failedConnection";

function getStatusDecoration(status: FileItemStatus) {
  switch (status) {
    case "failedValidation":
    case "failedConnection":
      return <StatusIndicator status="error" />;
    case "uploading":
      return <Spinner size="small" />;
    case "success":
      return <StatusIndicator status="success" />;
    case "paused":
      return <ProgressOnholdIcon />;
  }
}

function fileSize(bytes: number) {
  const sizeFormatter = new Intl.NumberFormat([], {
    style: "unit",
    unit: "byte",
    notation: "compact",
    unitDisplay: "narrow",
  });
  return sizeFormatter.format(bytes);
}

function getDescription({
  totalSize,
  currentSize = 0,
}: {
  totalSize: number;
  currentSize?: number;
}) {
  const downloadCompleted = currentSize === totalSize;
  if (totalSize && !downloadCompleted) {
    return `${fileSize(currentSize)} of ${fileSize(totalSize)}`;
  }
  return `${fileSize(currentSize)}`;
}

const updateInterval = 500;

const FileItem = ({
  file,
  handleDelete,
  badConnection,
}: {
  file: File;
  handleDelete: (file: File) => void;
  badConnection?: boolean;
}) => {
  const id = useId();
  const [status, setStatus] = useState<FileItemStatus>("initial");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentSize, setCurrentSize] = useState(0);

  const validFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      setErrorMessage("Invalid format. Files must be in .PDF format");
      return false;
    }

    if (file.size > 100_000) {
      setErrorMessage("Exceeds file size. 100KB file size limit.");
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    if (file && validFile(file)) {
      setTimeout(() => {
        // emulate upload
        setStatus("uploading");
      }, 700);
    } else {
      setStatus("failedValidation");
    }
  }, [file, validFile]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (status === "uploading") {
      const update = () => {
        setCurrentSize((old) => {
          if (old !== file.size) {
            timeout = setTimeout(update, updateInterval);

            if (badConnection && Math.random() > 0.7) {
              setStatus("failedConnection");
              setErrorMessage("Connection failed. Please try again.");
              return old;
            }

            return Math.min(old + Math.random() * 1000, file.size);
          }

          setStatus("success");
          return old;
        });
      };

      timeout = setTimeout(update, updateInterval);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [status, file.size, badConnection]);

  return (
    <StaticListItem>
      <div
        style={{
          minHeight: "var(--salt-size-base)",
          minWidth: "var(--salt-size-icon)",
          display: "flex",
          alignItems: "center",
          height: "min-content",
        }}
      >
        {getStatusDecoration(status)}
      </div>
      <StaticListItemContent>
        <StackLayout gap={0.5}>
          <Text color="inherit" id={`label-${id}`}>
            {file.name}
          </Text>
          <Text
            styleAs="label"
            color={errorMessage === "" ? "secondary" : "error"}
            id={`secondary-label-${id}`}
          >
            {errorMessage === ""
              ? getDescription({ totalSize: file.size, currentSize })
              : errorMessage}
          </Text>
        </StackLayout>
      </StaticListItemContent>
      {status === "failedConnection" && (
        <Tooltip content="Retry upload" placement="top">
          <Button
            id={`retry-button-${id}`}
            appearance="transparent"
            aria-label="Retry upload"
            aria-labelledby={clsx(
              `retry-button-${id}`,
              `label-${id}`,
              `secondary-label-${id}`,
            )}
            onClick={() => {
              setStatus("uploading");
              setErrorMessage("");
            }}
          >
            <RefreshIcon aria-hidden />
          </Button>
        </Tooltip>
      )}
      {status === "paused" && (
        <Tooltip content="Resume upload" placement="top">
          <Button
            id={`resume-button-${id}`}
            appearance="transparent"
            aria-label="Resume upload"
            aria-labelledby={clsx(
              `resume-button-${id}`,
              `label-${id}`,
              `secondary-label-${id}`,
            )}
            onClick={() => {
              setStatus("uploading");
            }}
          >
            <PlayIcon aria-hidden />
          </Button>
        </Tooltip>
      )}
      {status === "uploading" && (
        <Tooltip content="Pause upload" placement="top">
          <Button
            id={`pause-button-${id}`}
            appearance="transparent"
            aria-label="Pause upload"
            aria-labelledby={clsx(
              `pause-button-${id}`,
              `label-${id}`,
              `secondary-label-${id}`,
            )}
            onClick={() => {
              setStatus("paused");
            }}
          >
            <PauseIcon aria-hidden />
          </Button>
        </Tooltip>
      )}
      {status !== "uploading" && (
        <Tooltip content="Remove" placement="top">
          <Button
            id={`remove-button-${id}`}
            appearance="transparent"
            aria-label="Remove"
            aria-labelledby={clsx(
              `remove-button-${id}`,
              `label-${id}`,
              `secondary-label-${id}`,
            )}
            onClick={() => handleDelete(file)}
          >
            <DeleteIcon aria-hidden />
          </Button>
        </Tooltip>
      )}
    </StaticListItem>
  );
};

export const FileUploadExample = () => {
  const [files, setFiles] = useState<{ file: File; badConnection?: boolean }[]>(
    [],
  );

  const handleFiles = (_: SyntheticEvent, files: File[]) => {
    setFiles((old) =>
      old.concat(
        files.map((file) => ({
          file,
        })),
      ),
    );
  };

  const handleDelete = (fileToRemove: File) => {
    setFiles((old) => old.filter((file) => file.file !== fileToRemove));
  };

  return (
    <StackLayout style={{ height: "80vh" }}>
      <FlexLayout direction="row" wrap>
        <Button
          onClick={() => {
            const file = new File(
              [new ArrayBuffer(Math.random() * 12000)],
              faker.system.commonFileName("pdf"),
              {
                type: "application/pdf",
              },
            );
            setFiles((old) => old.concat({ file }));
          }}
        >
          Add PDF that will succeed
        </Button>
        <Button
          onClick={() => {
            const file = new File(
              [new ArrayBuffer(Math.random() * 12000)],
              faker.system.commonFileName("pdf"),
              {
                type: "application/pdf",
              },
            );
            setFiles((old) => old.concat({ file, badConnection: true }));
          }}
        >
          Simulate bad connection
        </Button>
        <Button
          onClick={() => {
            const file = new File(
              [new ArrayBuffer(200000)],
              faker.system.commonFileName("pdf"),
              {
                type: "application/pdf",
              },
            );
            setFiles((old) => old.concat({ file }));
          }}
        >
          Add large PDF
        </Button>
        <Button
          onClick={() => {
            const file = new File(
              [new ArrayBuffer(10000)],
              faker.system.commonFileName("png"),
              {
                type: "image/png",
              },
            );
            setFiles((old) => old.concat({ file }));
          }}
        >
          Add image
        </Button>
      </FlexLayout>
      <StackLayout gap={1}>
        <Text styleAs="h2">Upload files</Text>
        <Text>
          Please drag and drop file(s) in the below area; or browse files by
          using the button.
        </Text>
      </StackLayout>
      <FileDropZone onDrop={handleFiles}>
        <FileDropZoneIcon />
        <strong>Drop files here or</strong>
        <FileDropZoneTrigger accept=".pdf" onChange={handleFiles} />
        <Text>Files must be in .PDF format. 100KB file size limit.</Text>
      </FileDropZone>
      <StaticList style={{ width: "100%" }}>
        {files.map(({ file, badConnection }, index) => (
          <Fragment key={file.name + file.lastModified}>
            <FileItem
              file={file}
              handleDelete={handleDelete}
              badConnection={badConnection}
            />
            {index < files.length - 1 && (
              <Divider variant="tertiary" aria-hidden />
            )}
          </Fragment>
        ))}
      </StaticList>
    </StackLayout>
  );
};
