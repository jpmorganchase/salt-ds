import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { useSimulatedTask } from "./useSimulatedTask";

export const IndeterminateToDeterminate = (): ReactElement => {
  const { running, value, start, reset } = useSimulatedTask({
    sizeUnknownFor: 2000,
  });

  return (
    <StackLayout gap={3} style={{ width: 320 }}>
      <FlowLayout gap={1}>
        <Button onClick={start} disabled={running}>
          Start download
        </Button>
        <Button onClick={reset}>Reset</Button>
      </FlowLayout>
      {(running || value !== undefined) && (
        <Progress
          label="Downloading report.pdf"
          value={value}
          status={running ? "active" : "success"}
        />
      )}
    </StackLayout>
  );
};
