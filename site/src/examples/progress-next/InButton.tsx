import { Button, useAriaAnnouncer } from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";
import { Progress } from "@salt-ds/lab";
import { type ReactElement, useRef } from "react";
import styles from "./InButton.module.css";
import { useSimulatedTask } from "./useSimulatedTask";

export const InButton = (): ReactElement => {
  const { announce } = useAriaAnnouncer();
  const downloading = useRef(false);
  const { running, value, start } = useSimulatedTask({
    sizeUnknownFor: 1500,
    onComplete: () => {
      downloading.current = false;
      announce("Download complete", { ariaLive: "polite" });
    },
  });

  // The button owns the announcements, including completion after progress is removed
  const startDownload = () => {
    if (downloading.current) return;
    downloading.current = true;
    announce("Downloading", { ariaLive: "polite" });
    start();
  };

  return (
    // The button stays enabled, as disabled buttons are faded, but it ignores clicks while it's downloading
    <Button
      sentiment="accented"
      onClick={startDownload}
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
            delay={1000}
            disableAnnouncer
          />
        )}
      </span>
      Download
    </Button>
  );
};
