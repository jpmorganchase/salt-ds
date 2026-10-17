import { Button, StackLayout, Switch, Text, useId } from "@salt-ds/core";
import {
  experiments,
  type RegisteredExperiment,
  useExperiments,
} from "../../experiments";

function ExperimentSwitch({
  experiment,
}: {
  experiment: RegisteredExperiment;
}) {
  const { enabled, setExperimentEnabled } = useExperiments();
  const descriptionId = useId();

  return (
    <StackLayout gap={0.5} padding={0}>
      <Switch
        label={experiment.name}
        checked={enabled.includes(experiment.id)}
        onChange={(event) =>
          setExperimentEnabled(experiment.id, event.target.checked)
        }
        inputProps={{ "aria-describedby": descriptionId }}
      />
      <Text id={descriptionId} color="secondary">
        {experiment.description}
      </Text>
    </StackLayout>
  );
}

export function ExperimentSettings() {
  const { enabled, disableAll } = useExperiments();

  return (
    <StackLayout gap={2} align="start" padding={0}>
      {experiments.map((experiment) => (
        <ExperimentSwitch key={experiment.id} experiment={experiment} />
      ))}
      <Button
        sentiment="neutral"
        appearance="bordered"
        disabled={enabled.length === 0}
        onClick={disableAll}
      >
        Turn off all experiments
      </Button>
    </StackLayout>
  );
}
