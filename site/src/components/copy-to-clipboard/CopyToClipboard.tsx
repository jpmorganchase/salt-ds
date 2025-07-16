import { Button, Tag, Tooltip } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { type ReactNode, useState } from "react";

export const CopyToClipboard = ({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) => {
  const [copyStatus, setCopyStatus] = useState<"none" | "error" | "success">(
    "none",
  );

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyStatus("success");
      })
      .catch(() => {
        setCopyStatus("error");
      });
  };

  return (
    <>
      {children ?? <Tag>{value}</Tag>}
      <Tooltip
        placement="top"
        content={copyStatus === "error" ? "Failed to copy" : "Copied"}
        status={copyStatus === "error" ? "error" : "success"}
        open={copyStatus !== "none"}
        onOpenChange={(open) => {
          if (!open) {
            setCopyStatus("none");
          }
        }}
      >
        <Button
          onClick={() => handleCopyToClipboard(value)}
          aria-label="Copy to clipboard"
          appearance="transparent"
        >
          <CopyIcon aria-hidden />
        </Button>
      </Tooltip>
    </>
  );
};
