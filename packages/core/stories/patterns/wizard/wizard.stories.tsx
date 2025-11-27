import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
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
import type { Meta } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Yup from "yup";
import { AccountCancelDialog } from "./AccountCancelDialog";
import { AccountCreatedDialog } from "./AccountCreatedDialog";
import { AccountDetailsContent } from "./AccountDetailsContent";
import { AccountTypeContent } from "./AccountTypeContent";
import { AdditionalInfoContent } from "./AdditionalInfoContent";
import { ContentOverflow } from "./ContentOverflow";
import { ReviewAccountContent } from "./ReviewAccountContent";
import {
  type FieldValidation,
  type StepValidationResult,
  useWizardForm,
  type ValidationStatus,
} from "./useWizardForm";
import "./ContentOverflow.css";

export default {
  title: "Patterns/Wizard",
  parameters: {
    layout: "padded",
  },
} as Meta;

export interface AccountFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  accountType: string;
  initialDeposit: string;
  beneficiaryName: string;
  sourceOfFunds: string;
  paperlessStatements: string;
}

export interface FormContentProps {
  formData: AccountFormData;
  handleInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  stepFieldValidation: Record<string, FieldValidation>;
  handleSelectChange?: (value: string, name: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  handleRadioChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

const wizardSteps = [
  { id: "account-details", label: "Account details" },
  { id: "account-type", label: "Account type" },
  {
    id: "additional-info",
    label: "Additional info",
    description: "(Optional)",
  },
  { id: "review", label: "Review and create" },
] as const;
const stepIds = wizardSteps.map((s) => s.id);

const initialFormData: AccountFormData = {
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

const stepValidationSchemas: Record<
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

// Map Yup validation errors (including custom warning severity) to FieldValidation shape
interface YupValidationErrorShape {
  inner?: Array<{
    path: string;
    message: string;
    params?: Record<string, unknown>;
  }>;
  path?: string;
  message?: string;
}

function mapYupErrors(
  err: YupValidationErrorShape,
): StepValidationResult["fields"] {
  const out: StepValidationResult["fields"] = {};
  const list = err.inner ?? [];

  for (const e of list) {
    const rawSeverity = e.params?.severity as ValidationStatus | undefined;
    const status: ValidationStatus =
      rawSeverity === "warning" ? "warning" : "error";
    // Last message wins for a field; overwrite for clarity
    out[e.path] = { status, message: e.message };
  }
  // Fallback single error (when abortEarly true or inner empty)
  if (!list.length && err.path) {
    out[err.path] = { status: "error", message: err.message };
  }

  return out;
}

// Validate a single wizard step given current form data; returns fields map
async function validateStep(
  stepId: string,
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable for an example.
  data: any,
): Promise<Record<string, FieldValidation>> {
  const schema = stepValidationSchemas[stepId];
  if (!schema) return {};
  try {
    await schema.validate(data, { abortEarly: false });
    return {}; // valid
  } catch (err) {
    return mapYupErrors(err as YupValidationErrorShape);
  }
}

const getStepStage = (index: number, activeStepIndex: number) => {
  if (index === activeStepIndex) return "active";
  if (index < activeStepIndex) return "completed";
  return "pending";
};

export const Horizontal = () => {
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
    validateStep,
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
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => {
      console.log("x");
      updateField(e.target.name, e.target.value);
    },
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
          {wizardSteps[activeStepIndex].id === "additional-info" && (
            <Text
              color="secondary"
              style={{
                marginTop: "var(--salt-spacing-fixed-400)",
              }}
            >
              All fields are optional
            </Text>
          )}
        </Text>
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

export const HorizontalWithCancelConfirmation = () => {
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
    validateStep,
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
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
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
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

  const openCancelDialog = () => setCancelOpen(true);

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
          {wizardSteps[activeStepIndex].id === "additional-info" && (
            <Text
              color="secondary"
              style={{
                marginTop: "var(--salt-spacing-fixed-400)",
              }}
            >
              All fields are optional
            </Text>
          )}
        </Text>
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
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={openCancelDialog}
      >
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
          height: 588,
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
      <AccountCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          reset();
          setCancelOpen(false);
        }}
      />
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

export const VerticalWithCancelConfirmation = () => {
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
    validateStep,
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
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
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
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
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "60%" }} />
    ),
    review: <ReviewAccountContent formData={sharedFormProps.formData} />,
  };

  const header = (
    <StackLayout gap={0} style={{ minHeight: "5rem" }} align="start">
      <Text>Create a new account</Text>
      <Text as="h2" ref={stepHeadingRef} tabIndex={-1} style={{ margin: 0 }}>
        {wizardSteps[activeStepIndex].label}
      </Text>
      {wizardSteps[activeStepIndex].id === "additional-info" && (
        <Text
          color="secondary"
          style={{
            marginTop: "var(--salt-spacing-fixed-400)",
          }}
        >
          All fields are optional
        </Text>
      )}
    </StackLayout>
  );

  const footer = (
    <FlexLayout gap={1} justify="end" padding={3} style={{ paddingTop: 0 }}>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => setCancelOpen(true)}
      >
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
          maxWidth: 850,
        }}
        padding={3}
      >
        <ContentOverflow style={{ height: 512 }}>
          <StackLayout>
            {header}
            <GridLayout columns={3}>
              <GridItem>
                <Stepper orientation="vertical">
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
              </GridItem>
              <GridItem colSpan={2} padding={1}>
                {contentByStep[currentStepId]}
              </GridItem>
            </GridLayout>
          </StackLayout>
        </ContentOverflow>
        {footer}
      </StackLayout>
      <AccountCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          reset();
          setCancelOpen(false);
        }}
      />
      <AccountCreatedDialog
        open={successOpen}
        onOpenChange={(open) => {
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

export const Modal = () => {
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
    validateStep,
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

export const ModalWithConfirmations = () => {
  type WizardState = "form" | "cancel-warning" | "success";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);

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
    validateStep,
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
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      createAccount();
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
