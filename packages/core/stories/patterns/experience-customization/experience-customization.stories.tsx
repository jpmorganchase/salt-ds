import {
  Button,
  FlexItem,
  FlexLayout,
  StackLayout,
  Step,
  Stepper,
  Text,
} from "@salt-ds/core";
import type { Meta } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { ContentOverflow } from "../wizard/ContentOverflow";
import { useWizardForm } from "../wizard/useWizardForm";
import { getStepStage, validateStep } from "../wizard/wizard.stories";
import { DataFormatContent } from "./DataFormatContent";
import { DisplayModeContent } from "./DisplayModeContent";
import { NotificationsContent } from "./NotificationsContent";
import { RegionalSettingsContent } from "./RegionalSettingsContent";

export default {
  title: "Patterns/Experience Customization",
  parameters: {
    layout: "padded",
  },
} as Meta;

const wizardSteps = [
  { id: "region", label: "Regional settings" },
  {
    id: "notifications",
    label: "Notification and settings",
    description: "Define how and where you receive critical system updates.",
  },
  {
    id: "displayMode",
    label: "Display preferences",
    description: "Configure how data is visualized across your dashboards.",
  },
  {
    id: "dataFormat",
    label: "Data format",
    description: "Configure how data is visualized across your dashboards.",
  },
] as const;
const stepIds = wizardSteps.map((s) => s.id);

export const Default = () => {
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatedRef = useRef(false);

  const {
    state: { activeStepIndex, formData, validationsByStep },
    currentStepId,
    updateField,
    next,
    previous,
    reset,
    runValidationAndStore,
  } = useWizardForm({
    steps: stepIds,
    initialState: {
      activeStepIndex: 0,
      // formData: initialFormData,
      formData: {},
      validationsByStep: {},
    },
    validateStep,
  });
  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update focus when active step changes
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const handleNext = async () => {
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      return;
    }
    navigatedRef.current = true;
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const renderDescription = (step: (typeof wizardSteps)[number]) => {
    if ("description" in step) {
      return <Text color="secondary">{step.description}</Text>;
    }
    return null;
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
      <FlexItem style={{ flex: 1 }}>
        <Text>
          Create a new account
          <Text
            as="h2"
            ref={stepHeadingRef}
            tabIndex={-1}
            style={{ margin: 0 }}
          >
            {wizardSteps[activeStepIndex].label}
          </Text>
          {renderDescription(wizardSteps[activeStepIndex])}
        </Text>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper orientation="horizontal">
          {wizardSteps.map((step, index) => (
            <Step
              key={step.id}
              label={step.label}
              //   status={validationsByStep[step.id]?.status}
              stage={getStepStage(index, activeStepIndex)}
            />
          ))}
        </Stepper>
      </FlexItem>
    </FlexLayout>
  );

  const footer = (
    <FlexLayout gap={1} justify="end" padding={3}>
      <Button sentiment="accented" appearance="transparent" onClick={reset}>
        Cancel
      </Button>
      {!isFirstStep && (
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={handlePrevious}
        >
          Previous
        </Button>
      )}
      <Button sentiment="accented" onClick={handleNext}>
        {isLastStep ? "Create" : "Next"}
      </Button>
    </FlexLayout>
  );

  const contentByStep: Record<string, React.ReactElement> = {
    region: <RegionalSettingsContent />,
    notifications: <NotificationsContent />,
    displayMode: <DisplayModeContent />,
    dataFormat: <DataFormatContent />,
  };

  return (
    <StackLayout
      style={{
        maxWidth: 730,
      }}
      gap={0}
    >
      <FlexItem padding={3}>{header}</FlexItem>
      <FlexItem grow={1}>
        <ContentOverflow style={{ height: 396 }}>
          {contentByStep[currentStepId]}
        </ContentOverflow>
      </FlexItem>
      {footer}
    </StackLayout>
  );
};
