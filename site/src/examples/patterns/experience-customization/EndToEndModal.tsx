import {
  AriaAnnouncerProvider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  Step,
  Stepper,
  useAriaAnnouncer,
  useResponsiveProp,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ElementType,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWizardForm } from "../wizard/useWizardForm";
import { getStepStage, validateStep } from "../wizard/utils";
import { DataFormatContent } from "./DataFormatContent";
import {
  announceValidationErrors,
  focusFirstInteractiveElement,
  getDensityFormUpdates,
  getStepAnnouncement,
  hasDataFormatChanges,
  resetDataFormatFields,
  stepIds,
  stepValidationSchemas,
  wizardSteps,
} from "./EndToEnd";
import { FoundationContent } from "./FoundationContent";
import { NotificationsContent } from "./NotificationsContent";
import { RegionalSettingsContent } from "./RegionalSettingsContent";
import { initialFormData } from "./StandardControls";
import type { ECFormData, FormContentProps } from "./types";

const EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET =
  "experience-customization-modal";

export const EndToEndModal = () => {
  const [open, setOpen] = useState(false);
  const headingRef = useRef<HTMLElement | null>(null);

  const openWizard = () => {
    setOpen(true);
  };

  const closeWizard = () => {
    setOpen(false);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  return (
    <>
      <Button onClick={openWizard} aria-haspopup="dialog">
        Open experience customization
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        initialFocus={headingRef}
        style={{ height: 588 }}
      >
        <AriaAnnouncerProvider
          target={EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET}
        >
          <EndToEndModalContent
            closeWizard={closeWizard}
            setHeadingRef={(node) => {
              headingRef.current = node;
            }}
          />
        </AriaAnnouncerProvider>
      </Dialog>
    </>
  );
};

function EndToEndModalContent({
  closeWizard,
  setHeadingRef,
}: {
  closeWizard: () => void;
  setHeadingRef: (node: HTMLSpanElement | null) => void;
}) {
  const stepContentRef = useRef<HTMLDivElement>(null);
  const navigatedRef = useRef(false);

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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;

    focusFirstInteractiveElement(stepContentRef.current);
    announce(getStepAnnouncement(activeStepIndex), {
      target: EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET,
    });
  }, [activeStepIndex, announce]);

  const closeWizardAndReset = () => {
    closeWizard();
    setTimeout(() => {
      reset();
    }, 300);
  };

  const handleNext = async () => {
    const { valid, fields } = await runValidationAndStore();
    if (!valid) {
      announceValidationErrors(fields, announce, {
        target: EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET,
      });
      return;
    }
    if (isLastStep) {
      closeWizardAndReset();
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
    dataFormat: <DataFormatContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
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
      <StackLayout gap={1} style={{ width: "100%" }}>
        {nextBtn}
        {prevBtn}
        {cancel}
        {startFooter}
      </StackLayout>
    ) : (
      <SplitLayout padding={0} startItem={startFooter} endItem={endFooter} />
    );

  return (
    <>
      <DialogHeader
        header={
          <span ref={setHeadingRef} tabIndex={-1}>
            {wizardSteps[activeStepIndex].label}
          </span>
        }
        preheader="Customize your experience"
        actions={
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
        }
        description={
          wizardSteps[activeStepIndex].id === "foundation" &&
          "A selection is required to proceed"
        }
      />
      <DialogContent ref={stepContentRef}>
        {contentByStep[currentStepId]}
      </DialogContent>
      <DialogActions>{footer}</DialogActions>
    </>
  );
}
