import {
  type AnnounceFnOptions,
  Button,
  FlexItem,
  FlexLayout,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  Step,
  Stepper,
  Text,
  useAriaAnnouncer,
  useResponsiveProp,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ElementType,
  type ReactElement,
  useEffect,
  useRef,
} from "react";
import * as Yup from "yup";
import { ContentOverflow } from "../wizard/ContentOverflow";
import { type FieldValidation, useWizardForm } from "../wizard/useWizardForm";
import { getStepStage, validateStep } from "../wizard/utils";
import { DataFormatContent } from "./DataFormatContent";
import { FoundationContent } from "./FoundationContent";
import { NotificationsContent } from "./NotificationsContent";
import { RegionalSettingsContent } from "./RegionalSettingsContent";
import { initialFormData } from "./StandardControls";
import type { ECFormData, FormContentProps } from "./types";

const interactiveElementSelector = [
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "a[href]",
  '[role="radio"][tabindex="0"]:not([aria-disabled="true"])',
  '[role="checkbox"][tabindex="0"]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"]):not([role="region"])',
].join(", ");

export const getStepAnnouncement = (stepIndex: number) => {
  const step = wizardSteps[stepIndex];

  return `${step.label}, step ${stepIndex + 1} of ${wizardSteps.length}`;
};

export const focusFirstInteractiveElement = (container: HTMLElement | null) => {
  const firstInteractive = container?.querySelector<HTMLElement>(
    interactiveElementSelector,
  );

  firstInteractive?.focus();
};

export const wizardSteps = [
  {
    id: "foundation",
    label: "Foundation",
    stepTitle: "Foundation",
  },
  { id: "regional", label: "Regional", stepTitle: "Regional" },
  {
    id: "dataFormat",
    label: "Data format",
    stepTitle: "Data format",
  },
  {
    id: "notifications",
    label: "Notification delivery",
    stepTitle: "Notifications",
  },
] as const;

export const stepIds = wizardSteps.map((s) => s.id);

const defaultDataFormatValues = {
  stockNameDisplay: initialFormData.stockNameDisplay,
  exchangeAndRegionDisplay: initialFormData.exchangeAndRegionDisplay,
  visibleMetrics: initialFormData.visibleMetrics,
  performanceChart: initialFormData.performanceChart,
} as const;

export const hasDataFormatChanges = (formData: ECFormData) => {
  return (
    formData.stockNameDisplay !== defaultDataFormatValues.stockNameDisplay ||
    formData.exchangeAndRegionDisplay !==
      defaultDataFormatValues.exchangeAndRegionDisplay ||
    formData.visibleMetrics !== defaultDataFormatValues.visibleMetrics ||
    formData.performanceChart !== defaultDataFormatValues.performanceChart
  );
};

export const resetDataFormatFields = (
  updateField: (name: string, value: string | boolean) => void,
) => {
  updateField("stockNameDisplay", defaultDataFormatValues.stockNameDisplay);
  updateField(
    "exchangeAndRegionDisplay",
    defaultDataFormatValues.exchangeAndRegionDisplay,
  );
  updateField("visibleMetrics", defaultDataFormatValues.visibleMetrics);
  updateField("performanceChart", defaultDataFormatValues.performanceChart);
};

export const getDensityFormUpdates = (
  displayDensity: string,
): Partial<ECFormData> => ({
  displayDensity,
  ...(displayDensity === "high" ? {} : { acceptTerms: false }),
});

export const stepValidationSchemas: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable for an example.
  Yup.ObjectSchema<Record<string, any>>
> = {
  foundation: Yup.object({
    displayDensity: Yup.string().required("Choose one option to continue."),
    acceptTerms: Yup.boolean().when("displayDensity", {
      is: "high",
      // biome-ignore lint/suspicious/noThenProperty: This is the correct Yup syntax for conditional validation.
      then: (schema) =>
        schema.oneOf([true], "Please check the box to continue."),
      otherwise: (schema) => schema.notRequired(),
    }),
  }),
};

export const announceValidationErrors = (
  fields: Record<string, FieldValidation>,
  announce: (message: string, options?: AnnounceFnOptions) => void,
  options?: AnnounceFnOptions,
) => {
  const messages = Object.values(fields)
    .filter((f) => f.status === "error" && f.message)
    .map((f) => f.message as string);
  if (messages.length > 0) {
    announce(messages.join(". "), { ariaLive: "assertive", ...options });
  }
};

export const EndToEnd = () => {
  const stepContentRef = useRef<HTMLDivElement>(null);
  const navigatedRef = useRef(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const {
    state: { activeStepIndex, formData, validationsByStep },
    currentStepId,
    updateField,
    updateFieldsWithoutValidation,
    clearFieldValidation,
    nextWithoutValidation,
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

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;

    focusFirstInteractiveElement(stepContentRef.current);
    announce(getStepAnnouncement(activeStepIndex));
  }, [activeStepIndex, announce]);

  const handleNext = async () => {
    const { valid, fields } = await runValidationAndStore();
    if (!valid) {
      announceValidationErrors(fields, announce);
      return;
    }
    if (isLastStep) {
      return;
    }

    navigatedRef.current = true;
    nextWithoutValidation();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const handleDensityChange = (value: string) => {
    updateFieldsWithoutValidation(getDensityFormUpdates(value));
    clearFieldValidation(currentStepId, "displayDensity");
    clearFieldValidation(currentStepId, "acceptTerms");
  };

  const handleFoundationCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFieldsWithoutValidation({ [e.target.name]: e.target.checked });
    clearFieldValidation(currentStepId, e.target.name);
  };

  const sharedFormProps: FormContentProps = {
    formData,
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value, name) => updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    foundation: (
      <FoundationContent
        {...sharedFormProps}
        handleCheckboxChange={handleFoundationCheckboxChange}
        onDensityChange={handleDensityChange}
      />
    ),
    regional: <RegionalSettingsContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} tickerAs="h2" />,
    notifications: <NotificationsContent {...sharedFormProps} />,
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
      <FlexItem style={{ flex: 1 }}>
        <StackLayout gap="var(--salt-spacing-50)">
          <Text as="h1" styleAs="h2">
            <Text as="span" color="primary" style={{ display: "block" }}>
              Customize your experience
            </Text>
            {wizardSteps[activeStepIndex].label}
          </Text>
          {wizardSteps[activeStepIndex].id === "foundation" && (
            <Text color="secondary">A selection is required to proceed</Text>
          )}
        </StackLayout>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper
          orientation="horizontal"
          aria-label="Customize your experience steps"
        >
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

  const cancel = (
    <Button sentiment="accented" appearance="transparent" onClick={reset}>
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNext}>
      {isLastStep ? "Finish and apply changes" : "Next"}
    </Button>
  );

  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  const endFooter = (
    <FlexLayout gap={1}>
      {cancel}
      {prevBtn}
      {nextBtn}
    </FlexLayout>
  );

  const handleResetToDefault = () => {
    resetDataFormatFields(updateField);
    focusFirstInteractiveElement(stepContentRef.current);
    announce("Data format settings have been reset to default values.");
  };

  const startFooter =
    currentStepId === "dataFormat" &&
    hasDataFormatChanges(formData as ECFormData) ? (
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={handleResetToDefault}
      >
        Reset to default
      </Button>
    ) : null;

  const footer =
    direction === "column" ? (
      <StackLayout gap={1} style={{ width: "100%" }} padding={3}>
        {nextBtn}
        {prevBtn}
        {cancel}
        {startFooter}
      </StackLayout>
    ) : (
      <SplitLayout padding={3} startItem={startFooter} endItem={endFooter} />
    );

  return (
    <StackLayout
      style={{
        maxWidth: 730,
        backgroundColor: "var(--salt-container-primary-background)",
      }}
      gap={0}
    >
      <FlexItem padding={3}>{header}</FlexItem>
      <FlexItem grow={1}>
        <ContentOverflow style={{ height: 430 }}>
          <div ref={stepContentRef}>{contentByStep[currentStepId]}</div>
        </ContentOverflow>
      </FlexItem>
      <FlexItem>{footer}</FlexItem>
    </StackLayout>
  );
};
