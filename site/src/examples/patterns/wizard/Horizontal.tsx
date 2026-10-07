import {
  Button,
  FlexItem,
  FlexLayout,
  StackLayout,
  Step,
  Stepper,
  Text,
} from "@salt-ds/core";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { AccountCreatedDialog } from "./AccountCreatedDialog";
import { AccountDetailsContent } from "./AccountDetailsContent";
import { AccountTypeContent } from "./AccountTypeContent";
import { AdditionalInfoContent } from "./AdditionalInfoContent";
import { ContentOverflow } from "./ContentOverflow";
import { ReviewAccountContent } from "./ReviewAccountContent";
import type { AccountFormData, FormContentProps } from "./types";
import { useWizardForm } from "./useWizardForm";
import { getStepStage, validateStep } from "./utils";

export const wizardSteps = [
  { id: "account-details", label: "Account details" },
  { id: "account-type", label: "Account type" },
  {
    id: "additional-info",
    label: "Additional info",
    description: "(Optional)",
  },
  { id: "review", label: "Review and create" },
] as const;

export const stepIds = wizardSteps.map((s) => s.id);

export const initialFormData: AccountFormData = {
  fullName: "Jane Doe",
  phoneNumber: "+1 (212) 555-0100",
  emailAddress: "jane.doe@email.com",
  address1: "25 Bank Street",
  address2: "",
  postalCode: "E14 5JP",
  city: "London",
  country: "United Kingdom",
  accountType: "",
  initialDeposit: "",
  beneficiaryName: "",
  sourceOfFunds: "",
  paperlessStatements: "",
};

export const stepValidationSchemas: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable for an example.
  Yup.ObjectSchema<Record<string, any>>
> = {
  "account-details": Yup.object({
    fullName: Yup.string().required("Full name is required."),
    phoneNumber: Yup.string().required("Phone number is required."),
    emailAddress: Yup.string()
      .email("Email format looks incorrect.")
      .required("Email is required."),
    address1: Yup.string().required("Address is required."),
    postalCode: Yup.string().required("Postal code is required."),
    city: Yup.string().required("City is required."),
    country: Yup.string().required("Country is required."),
  }),
  "account-type": Yup.object({
    accountType: Yup.string().required("Account type is required."),
  }),
  "additional-info": Yup.object({
    initialDeposit: Yup.string().test({
      name: "min-deposit-warning",
      message:
        "Recommended minimum deposit is $100. You may proceed, but some features may be unavailable.",
      test(value, ctx) {
        if (!value) return true;
        if (Number(value) < 100) {
          return ctx.createError({
            params: { severity: "warning" },
          });
        }
        return true;
      },
    }),
  }),
  review: Yup.object({}), // No validation
};

export const Horizontal = () => {
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

  const [successOpen, setSuccessOpen] = useState(false);
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

  const handleNext = async () => {
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      setSuccessOpen(true);
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
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, React.ReactElement> = {
    "account-details": <AccountDetailsContent {...sharedFormProps} />,
    "account-type": <AccountTypeContent {...sharedFormProps} />,
    "additional-info": (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    review: <ReviewAccountContent formData={sharedFormProps.formData} />,
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
      <FlexItem style={{ flex: 1 }}>
        <StackLayout gap="var(--salt-spacing-fixed-400)">
          <StackLayout gap={0}>
            <Text>Create a new account</Text>
            <Text as="h2" ref={stepHeadingRef} tabIndex={-1}>
              {wizardSteps[activeStepIndex].label}
            </Text>
          </StackLayout>
          {wizardSteps[activeStepIndex].id === "additional-info" && (
            <Text color="secondary">All fields are optional</Text>
          )}
        </StackLayout>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper orientation="horizontal">
          {wizardSteps.map((step, index) => (
            <Step
              key={step.id}
              label={step.label}
              status={validationsByStep[step.id]?.status}
              stage={getStepStage(index, activeStepIndex)}
              description={"description" in step ? step.description : undefined}
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

  return (
    <>
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
      <AccountCreatedDialog
        open={successOpen}
        onOpenChange={(open: boolean) => {
          setSuccessOpen(open);
          if (!open) {
            reset();
            setSuccessOpen(false);
          }
        }}
        onConfirm={() => {
          reset();
          setSuccessOpen(false);
        }}
      />
    </>
  );
};
