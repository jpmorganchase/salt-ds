import { Button } from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { useSimulatedTask } from "./useSimulatedTask";

export const InButton = (): ReactElement => {
  const { running, value, start } = useSimulatedTask({ sizeUnknownFor: 1500 });

  return (
    // The button stays enabled, as disabled buttons are faded, but it ignores clicks while it's downloading
    <Button
      sentiment="accented"
      onClick={running ? undefined : start}
      aria-busy={running || undefined}
    >
      {running ? (
        <Progress
          shape="circular"
          size="small"
          aria-label="Downloading"
          value={value}
        />
      ) : (
        <DownloadIcon aria-hidden />
      )}
      Download
    </Button>
  );
};
