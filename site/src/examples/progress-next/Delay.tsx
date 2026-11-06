import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { useSimulatedTask } from "./useSimulatedTask";

export const Delay = (): ReactElement => {
  const quick = useSimulatedTask({ duration: 600 });
  const slow = useSimulatedTask({ duration: 4000 });

  return (
    <StackLayout gap={3} style={{ width: 320 }}>
      <FlowLayout gap={1}>
        <Button onClick={quick.start}>Start a quick task</Button>
        <Button onClick={slow.start}>Start a slow task</Button>
      </FlowLayout>
      {quick.running && <Progress label="Quick task" value={quick.value} />}
      {slow.running && <Progress label="Slow task" value={slow.value} />}
    </StackLayout>
  );
};
