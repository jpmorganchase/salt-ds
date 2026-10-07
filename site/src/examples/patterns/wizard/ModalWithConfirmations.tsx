import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  GridItem,
  GridLayout,
  StackLayout,
  type StackLayoutProps,
  Step,
  Stepper,
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import { SuccessCircleSolidIcon, WarningSolidIcon } from "@salt-ds/icons";
import { type ElementType, useEffect, useRef, useState } from "react";
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

export const ModalWithConfirmations = () => {
  type WizardState = "form" | "cancel-warning" | "success";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);

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

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatedRef = useRef(false);

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

  const createAccount = () => setWizardState("success");
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
    const { valid } = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      createAccount();
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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

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
      {isLastStep ? "Create" : "Next"}
    </Button>
  );
  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  const wizardStatus =
    wizardState === "cancel-warning"
      ? "warning"
      : wizardState === "success"
        ? "success"
        : undefined;

  return (
    <>
      <Button onClick={openWizard}>Open wizard</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status={wizardStatus}
        style={{ height: 588 }}
      >
        {(() => {
          switch (wizardState) {
            case "cancel-warning":
              return (
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
                          <Text styleAs="h2">
                            Are you sure you want to cancel?
                          </Text>
                          <Text>
                            Any updates you've made so far will be lost after
                            you confirm cancelling.
                          </Text>
                        </StackLayout>
                      </GridItem>
                    </GridLayout>
                  </DialogContent>
                  <DialogActions>
                    {direction === "column" ? (
                      <StackLayout gap={1} style={{ width: "100%" }}>
                        <Button
                          sentiment="accented"
                          onClick={closeWizardAndReset}
                        >
                          Yes
                        </Button>
                        <Button
                          appearance="bordered"
                          sentiment="accented"
                          onClick={backToForm}
                        >
                          No
                        </Button>
                      </StackLayout>
                    ) : (
                      <FlexLayout gap={1}>
                        <Button
                          appearance="bordered"
                          sentiment="accented"
                          onClick={backToForm}
                        >
                          No
                        </Button>
                        <Button
                          sentiment="accented"
                          onClick={closeWizardAndReset}
                        >
                          Yes
                        </Button>
                      </FlexLayout>
                    )}
                  </DialogActions>
                </>
              );
            case "success":
              return (
                <>
                  <DialogContent>
                    <GridLayout rows={1} columns={1} style={{ height: "100%" }}>
                      <GridItem
                        horizontalAlignment="center"
                        verticalAlignment="center"
                      >
                        <StackLayout align="center">
                          <SuccessCircleSolidIcon
                            size={2}
                            style={{
                              color:
                                "var(--salt-status-success-foreground-decorative)",
                            }}
                          />
                          <Text styleAs="h2">Account created</Text>
                          <Text>You can now start using this new account.</Text>
                        </StackLayout>
                      </GridItem>
                    </GridLayout>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      sentiment="accented"
                      onClick={closeWizardAndReset}
                      autoFocus
                    >
                      Done
                    </Button>
                  </DialogActions>
                </>
              );
            default:
              return (
                <>
                  <DialogHeader
                    header={
                      <span tabIndex={-1} ref={stepHeadingRef}>
                        {wizardSteps[activeStepIndex].label}
                      </span>
                    }
                    preheader="Create a new account"
                    description={
                      wizardSteps[activeStepIndex].id === "additional-info" &&
                      "All fields are optional"
                    }
                    actions={
                      <Stepper
                        orientation="horizontal"
                        style={{ maxWidth: 300 }}
                      >
                        {wizardSteps.map((step, index) => (
                          <Step
                            key={step.id}
                            label={step.label}
                            status={validationsByStep[step.id]?.status}
                            stage={getStepStage(index, activeStepIndex)}
                            description={
                              "description" in step
                                ? step.description
                                : undefined
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
                    {direction === "column" ? (
                      <StackLayout gap={1} style={{ width: "100%" }}>
                        {nextBtn}
                        {prevBtn}
                        {cancel}
                      </StackLayout>
                    ) : (
                      <FlexLayout gap={1}>
                        {cancel}
                        {prevBtn}
                        {nextBtn}
                      </FlexLayout>
                    )}
                  </DialogActions>
                </>
              );
          }
        })()}
      </Dialog>
    </>
  );
};
