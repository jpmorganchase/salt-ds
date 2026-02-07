import { useRoute, useStore } from "@jpmorganchase/mosaic-store";
import { Button, Tooltip } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { useState } from "react";

export const CopyForLLM = () => {
  const [copyStatus, setCopyStatus] = useState<"none" | "error" | "success">(
    "none",
  );

  const { route } = useRoute();

  const { title, description } = useStore(
    (state: { title?: string; description?: string; data?: { description?: string } }) => ({
      title: state.title,
      description: state.description || state.data?.description,
    }),
  );

  const handleCopy = async () => {
    try {
      if (!route) {
        setCopyStatus("error");
        return;
      }

      const res = await fetch(
        `/api/raw-content?route=${encodeURIComponent(route)}`,
      );

      if (!res.ok) {
        setCopyStatus("error");
        return;
      }

      const { content } = await res.json();

      const parts: string[] = [];
      if (title) {
        parts.push(`# ${title}`);
      }
      if (description) {
        parts.push(description);
      }
      if (content) {
        parts.push(content);
      }

      const fullContent = parts.join("\n\n");

      await navigator.clipboard.writeText(fullContent);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
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
        onClick={handleCopy}
        aria-label="Copy page content for LLM"
        appearance="transparent"
      >
        <CopyIcon aria-hidden /> Copy for LLM
      </Button>
    </Tooltip>
  );
};
