import { ReactElement, useEffect, useState } from "react";
import {
  Button,
  LinearProgress,
  LinearProgressProps,
  Toast,
  ToastContent,
  ValidationStatus,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const LinearIndeterminate = (): ReactElement => {
  const [variant, setVariant] =
    useState<LinearProgressProps["variant"]>("indeterminate");

  const [value, setValue] = useState(0);

  const [toastStatus, setToastStatus] = useState<{
    header: string;
    status: ValidationStatus;
    message: string;
  }>({
    header: "File uploading",
    status: "info",
    message: "File upload to shared drive in progress.",
  });

  useEffect(() => {
    const timer = setTimeout(() => setVariant("determinate"), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (variant === "determinate" && value < 100) {
      const interval = setInterval(
        () => setValue((currentValue) => currentValue + 1),
        20
      );
      return () => clearInterval(interval);
    }
  }, [value, variant]);

  useEffect(() => {
    if (value === 100) {
      setToastStatus({
        header: "Upload complete",
        status: "success",
        message: "File has successfully been uploaded to shared drive.",
      });
    }
  }, [value]);

  return (
    <Toast status={toastStatus.status}>
      <ToastContent>
        <div>
          <Text>
            <strong>{toastStatus.header}</strong>
          </Text>
          <div>{toastStatus.message}</div>
          {value !== 100 && (
            <LinearProgress
              aria-label="Download"
              variant={variant}
              value={value}
            />
          )}
        </div>
      </ToastContent>
      <Button variant="secondary" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
  );
};
