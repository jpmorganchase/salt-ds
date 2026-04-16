import {
  Banner,
  BannerContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
  FlexLayout,
  GridItem,
  GridLayout,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  RadioButtonIcon,
  SaltProviderNext,
  SplitLayout,
  StackLayout,
  Step,
  Stepper,
  Text,
} from "@salt-ds/core";
import {
  BuildingIcon,
  GlobeIcon,
  LockedIcon,
  WarningSolidIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type FocusEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Yup from "yup";
import { ContentOverflow } from "../wizard/ContentOverflow";
import { type FieldValidation, useWizardForm } from "../wizard/useWizardForm";
import { getStepStage, validateStep } from "../wizard/utils";
import { DataFormatContent } from "./DataFormatContent";
import { DisplayModeContent } from "./DisplayModeContent";
import { NotificationsContent } from "./NotificationsContent";
import { RegionalSettingsContent } from "./RegionalSettingsContent";
import "../wizard/ContentOverflow.css";

export default {
  title: "Patterns/Experience Customization",
  parameters: {
    layout: "padded",
  },
} as Meta;

export interface ECFormData {
  language: string;
  timezone: string;
  autoTranslate: boolean;
  position: string;
  displayMode: string;
  displayDensity: string;
  currency: string;
  currencyFormat: string;
}

export interface FormContentProps {
  formData: ECFormData;
  handleInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  stepFieldValidation: Record<string, FieldValidation>;
  handleSelectChange?: (value: string, name: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  handleRadioChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const wizardSteps = [
  { id: "region", label: "Regional settings", stepTitle: "Regional" },
  {
    id: "notifications",
    label: "Notification and settings",
    stepTitle: "Notifications",
    description: "Define how and where you receive critical system updates.",
  },
  {
    id: "displayMode",
    label: "Display preferences",
    stepTitle: "Display",
    description: "Configure how data is visualized across your dashboards.",
  },
  {
    id: "dataFormat",
    label: "Data format preferences",
    stepTitle: "Data format",
    description: "Configure how data is visualized across your dashboards.",
  },
] as const;
const stepIds = wizardSteps.map((s) => s.id);

const initialFormData = {
  // Regional settings
  language: "",
  timezone: "",
  autoTranslate: false,
  // Notification settings
  position: "top-right",
  // Display preferences
  displayMode: "light",
  displayDensity: "medium",
  // Data format preferences
  currency: "usd",
  currencyFormat: "standard",
};

const stepValidationSchemas: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable for an example.
  Yup.ObjectSchema<Record<string, any>>
> = {
  region: Yup.object({
    language: Yup.string().required("Language is required."),
    timezone: Yup.string().required("Timezone is required."),
  }),
  displayMode: Yup.object({
    displayDensity: Yup.string().test({
      name: "high-density-warning",
      message: "warning",
      test(value, ctx) {
        if (!value) return true;
        if (value === "high") {
          return ctx.createError({
            params: { severity: "warning" },
          });
        }
        return true;
      },
    }),
  }),
};

export const MultiStep = () => {
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
      formData: initialFormData,
      validationsByStep: {},
    },
    validateStep: (stepId, data) =>
      validateStep(stepValidationSchemas, stepId, data),
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

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    region: <RegionalSettingsContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
    displayMode: <DisplayModeContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} />,
  };

  const renderDescription = (step: (typeof wizardSteps)[number]) => {
    if ("description" in step) {
      return <Text color="secondary">{step.description}</Text>;
    }
    return null;
  };

  const header = (
    <FlexLayout justify="space-between">
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
              label={step.stepTitle}
              status={validationsByStep[step.id]?.status}
              stage={getStepStage(index, activeStepIndex)}
            />
          ))}
        </Stepper>
      </FlexItem>
    </FlexLayout>
  );

  const endFooter = (
    <FlexLayout gap={1}>
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
        {isLastStep ? "Finish" : "Next"}
      </Button>
    </FlexLayout>
  );

  const startFooter =
    formData.displayDensity === "high" && activeStepIndex === 2 ? (
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => updateField("displayDensity", "medium")}
      >
        Reset to medium density
      </Button>
    ) : null;

  const footer = (
    <SplitLayout padding={3} startItem={startFooter} endItem={endFooter} />
  );

  return (
    <SaltProviderNext
      mode={formData.displayMode}
      density={formData.displayDensity}
    >
      <StackLayout
        style={{
          maxWidth: 730,
          backgroundColor: "var(--salt-container-primary-background)",
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
    </SaltProviderNext>
  );
};

export const Modal = () => {
  const [open, setOpen] = useState(true);
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
      formData: initialFormData,
      validationsByStep: {},
    },
    validateStep: (stepId, data) =>
      validateStep(stepValidationSchemas, stepId, data),
  });

  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update focus when active step changes
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const openWizard = () => {
    reset();
    setOpen(true);
  };

  const closeWizardAndReset = () => {
    setOpen(false);
    setTimeout(() => {
      reset();
    }, 300);
  };

  const handleNext = async () => {
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      closeWizardAndReset();
      return;
    }
    navigatedRef.current = true;
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    region: <RegionalSettingsContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
    displayMode: <DisplayModeContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} />,
  };

  const cancel = (
    <Button
      sentiment="accented"
      appearance="transparent"
      onClick={closeWizardAndReset}
    >
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNext}>
      {isLastStep ? "Finish" : "Next"}
    </Button>
  );

  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  const activeStep = wizardSteps[activeStepIndex];
  const activeStepDescription =
    "description" in activeStep ? activeStep.description : undefined;

  return (
    <SaltProviderNext
      mode={formData.displayMode}
      density={formData.displayDensity}
    >
      <Button onClick={openWizard}>Open experience customization</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ height: 588 }}>
        <DialogHeader
          header={
            <span tabIndex={-1} ref={stepHeadingRef}>
              {wizardSteps[activeStepIndex].label}
            </span>
          }
          description={activeStepDescription}
          preheader="Customize your experience"
          actions={
            <Stepper orientation="horizontal">
              {wizardSteps.map((step, index) => (
                <Step
                  key={step.id}
                  label={step.stepTitle}
                  status={validationsByStep[step.id]?.status}
                  stage={getStepStage(index, activeStepIndex)}
                />
              ))}
            </Stepper>
          }
        />
        <DialogContent>{contentByStep[currentStepId]}</DialogContent>
        <DialogActions>
          <FlexLayout gap={1}>
            {cancel}
            {prevBtn}
            {nextBtn}
          </FlexLayout>
        </DialogActions>
      </Dialog>
    </SaltProviderNext>
  );
};

export const ModalWithCancelConfirmation = () => {
  type WizardState = "form" | "cancel-warning";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);
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
      formData: initialFormData,
      validationsByStep: {},
    },
    validateStep: (stepId, data) =>
      validateStep(stepValidationSchemas, stepId, data),
  });

  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update focus when active step changes
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const openWizard = () => {
    reset();
    setWizardState("form");
    setOpen(true);
  };

  const closeWizardAndReset = () => {
    setOpen(false);
    setTimeout(() => {
      reset();
      setWizardState("form");
    }, 300);
  };

  const showCancelWarning = () => setWizardState("cancel-warning");
  const backToForm = () => setWizardState("form");

  const onOpenChange = (value: boolean) => {
    if (!value && !isLastStep) {
      showCancelWarning();
      return;
    }
    setOpen(value);
  };

  const handleNext = async () => {
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      closeWizardAndReset();
      return;
    }
    navigatedRef.current = true;
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    region: <RegionalSettingsContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
    displayMode: <DisplayModeContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} />,
  };

  const cancel = (
    <Button
      sentiment="accented"
      appearance="transparent"
      onClick={showCancelWarning}
    >
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNext}>
      {isLastStep ? "Finish" : "Next"}
    </Button>
  );

  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  const activeStep = wizardSteps[activeStepIndex];
  const activeStepDescription =
    "description" in activeStep ? activeStep.description : undefined;

  return (
    <SaltProviderNext
      mode={formData.displayMode}
      density={formData.displayDensity}
    >
      <Button onClick={openWizard}>Open experience customization</Button>
      <Dialog open={open} onOpenChange={onOpenChange} style={{ height: 588 }}>
        {wizardState === "cancel-warning" ? (
          <>
            <DialogContent>
              <GridLayout rows={1} columns={1} style={{ height: "100%" }}>
                <GridItem
                  horizontalAlignment="center"
                  verticalAlignment="center"
                >
                  <StackLayout align="center">
                    <WarningSolidIcon
                      size={2}
                      style={{
                        color:
                          "var(--salt-status-warning-foreground-decorative)",
                      }}
                    />
                    <Text styleAs="h2">Are you sure you want to cancel?</Text>
                    <Text>
                      Any changes you've made will be lost after you confirm
                      cancelling.
                    </Text>
                  </StackLayout>
                </GridItem>
              </GridLayout>
            </DialogContent>
            <DialogActions>
              <FlexLayout gap={1}>
                <Button
                  appearance="bordered"
                  sentiment="accented"
                  onClick={backToForm}
                >
                  No
                </Button>
                <Button sentiment="accented" onClick={closeWizardAndReset}>
                  Yes
                </Button>
              </FlexLayout>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogHeader
              header={
                <span tabIndex={-1} ref={stepHeadingRef}>
                  {wizardSteps[activeStepIndex].label}
                </span>
              }
              description={activeStepDescription}
              preheader="Customize your experience"
              actions={
                <Stepper orientation="horizontal">
                  {wizardSteps.map((step, index) => (
                    <Step
                      key={step.id}
                      label={step.stepTitle}
                      status={validationsByStep[step.id]?.status}
                      stage={getStepStage(index, activeStepIndex)}
                    />
                  ))}
                </Stepper>
              }
            />
            <DialogContent>{contentByStep[currentStepId]}</DialogContent>
            <DialogActions>
              <FlexLayout gap={1}>
                {cancel}
                {prevBtn}
                {nextBtn}
              </FlexLayout>
            </DialogActions>
          </>
        )}
      </Dialog>
    </SaltProviderNext>
  );
};

export const MandatoryAction = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();
  const [hasError, setHasError] = useState(false);

  const handleSubmit = () => {
    if (!selected) {
      setHasError(true);
    }
  };

  const governanceOptions = [
    {
      value: "standard",
      title: "Standard",
      description: "Business-recommended. Standard access logging.",
      Icon: BuildingIcon,
    },
    {
      value: "restricted",
      title: "Credit Card",
      description: "High compliance, Full data logging and MFA required.",
      Icon: LockedIcon,
    },
    {
      value: "external",
      title: "External",
      description: "Allow controlled access for partners.",
      Icon: GlobeIcon,
    },
  ];

  return (
    <StackLayout style={{ maxWidth: 730 }}>
      <StackLayout padding={3}>
        <Text>
          Customize your experience
          <Text as="h2" style={{ margin: 0 }}>
            Set governance & privacy standards
          </Text>
          A selection is required to proceed
        </Text>
      </StackLayout>

      <FlexItem grow={1}>
        <ContentOverflow style={{ minHeight: 300 }}>
          <StackLayout>
            <InteractableCardGroup
              onChange={(_event, value) => {
                setHasError(false);
                setSelected(value);
              }}
            >
              {governanceOptions.map(({ value, title, description, Icon }) => (
                <InteractableCard
                  key={value}
                  value={value}
                  style={{ width: "180px" }}
                >
                  <StackLayout gap={1}>
                    <StackLayout gap={1} direction="row" align="center">
                      <Icon aria-hidden size={1} />
                      <Text style={{ margin: 0 }}>{title}</Text>
                    </StackLayout>
                    <StackLayout direction="row" gap={1}>
                      <RadioButtonIcon
                        aria-hidden
                        checked={selected === value}
                      />
                      <Text>{description}</Text>
                    </StackLayout>
                  </StackLayout>
                </InteractableCard>
              ))}
            </InteractableCardGroup>

            {hasError && (
              <Banner status="error">
                <BannerContent>
                  A selection is required to proceed
                </BannerContent>
              </Banner>
            )}
          </StackLayout>
        </ContentOverflow>
      </FlexItem>

      <FlexLayout gap={1} justify="end" padding={3}>
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={() => {
            setSelected(undefined);
            setHasError(false);
          }}
        >
          Cancel
        </Button>
        <Button
          sentiment="accented"
          style={{
            cursor: !selected ? "var(--salt-cursor-disabled)" : "pointer",
          }}
          onClick={handleSubmit}
        >
          Finish
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
