import { Button, useAriaAnnouncer } from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";
import { Progress } from "@salt-ds/lab";
import { type ReactElement, useEffect } from "react";
import styles from "./InButton.module.css";
import { useSimulatedTask } from "./useSimulatedTask";

export const InButton = (): ReactElement => {
  const { running, value, start } = useSimulatedTask({ sizeUnknownFor: 1500 });
  const { announce } = useAriaAnnouncer();
  const complete = !running && value === 100;

  // The task announces completion, as progress is removed as soon as the download ends
  useEffect(() => {
    if (complete) announce("Download complete");
  }, [announce, complete]);

  return (
    // The button stays enabled, as disabled buttons are faded, but it ignores clicks while it's downloading
    <Button
      sentiment="accented"
      onClick={running ? undefined : start}
      aria-busy={running || undefined}
    >
      {/* The icon keeps its space while progress waits to appear, and stays out of the button's name */}
      <span className={styles.icon} aria-hidden="true">
        <DownloadIcon style={{ visibility: running ? "hidden" : undefined }} />
        {running && (
          <Progress
            className={styles.progress}
            shape="circular"
            size="small"
            aria-label="Downloading"
            value={value}
            completionAnnouncement={null}
          />
        )}
      </span>
      Download
    </Button>
  );
};
