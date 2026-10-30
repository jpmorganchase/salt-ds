import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  Step,
  Stepper,
} from "@salt-ds/core";
import { useEffect, useRef, useState } from "react";
import { AccountDetailsContent } from "./AccountDetailsContent";
import { AccountTypeContent } from "./AccountTypeContent";
import { AdditionalInfoContent } from "./AdditionalInfoContent";
import {
  initialFormData,
  stepIds,
  stepValidationSchemas,
  wizardSteps,
} from "./Horizontal";
import { ReviewAccountContent } from "./ReviewAccountContent";
import type { FormContentProps } from "./types";
import { useWizardForm } from "./useWizardForm";
import { getStepStage, validateStep } from "./utils";

export const Modal = () => {
  const {
    state: { activeStepIndex, formData, validationsByStep },
    currentStepId,
    updateField,
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

  const [open, setOpen] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatedRef = useRef(false);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update focus when active step changes
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const handleNext = async () => {
    const { valid } = await runValidationAndStore();
    if (!valid) return;
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

  const sharedFormProps: FormContentProps = {
    formData,
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleSelectChange: (value, name) => updateField(name, value),
    onBlur: () => {}, // Add blur logic if needed
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep = {
    "account-details": <AccountDetailsContent {...sharedFormProps} />,
    "account-type": <AccountTypeContent {...sharedFormProps} />,
    "additional-info": (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    review: <ReviewAccountContent formData={sharedFormProps.formData} />,
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
      {isLastStep ? "Create" : "Next"}
    </Button>
  );

  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  return (
    <>
      <Button onClick={openWizard}>Open wizard</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ height: 588 }}>
        <DialogHeader
          header={
            <span tabIndex={-1} ref={stepHeadingRef}>
              {wizardSteps[activeStepIndex].label}
            </span>
          }
          description={
            wizardSteps[activeStepIndex].id === "additional-info" &&
            "All fields are optional"
          }
          preheader="Create a new account"
          actions={
            <Stepper orientation="horizontal" style={{ maxWidth: 300 }}>
              {wizardSteps.map((step, index) => (
                <Step
                  key={step.id}
                  label={step.label}
                  status={validationsByStep[step.id]?.status}
                  stage={getStepStage(index, activeStepIndex)}
                  description={
                    "description" in step ? step.description : undefined
                  }
                />
              ))}
            </Stepper>
          }
        />
        <DialogContent>
          {contentByStep[currentStepId as keyof typeof contentByStep]}
        </DialogContent>
        <DialogActions>
          <FlexLayout gap={1}>
            {cancel}
            {prevBtn}
            {nextBtn}
          </FlexLayout>
        </DialogActions>
      </Dialog>
    </>
  );
};
