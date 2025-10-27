import { useCallback, useState } from "react";

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
export enum ContentTypeEnum {
  AccountDetails = "account-details",
  AccountType = "account-type",
  AdditionalInfo = "additional-info",
  Review = "review",
}
export type ContentType =
  (typeof ContentTypeEnum)[keyof typeof ContentTypeEnum];
export type ValidationStatus = "error" | "warning" | undefined;
export interface FieldValidation {
  status?: ValidationStatus;
  message?: string;
}

export const initialFormData: AccountFormData = {
  fullName: "Jane Doe",
  phoneNumber: "+1 (212) 555-0100",
  emailAddress: "jane.doe@gmail.com",
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
export const stepFieldRules: Record<
  ContentType,
  Record<string, (value: string, data: AccountFormData) => FieldValidation>
> = {
  [ContentTypeEnum.AccountDetails]: {
    fullName: (v) =>
      !v.trim() ? { status: "error", message: "Full name is required." } : {},
    phoneNumber: (v) =>
      !v.trim()
        ? { status: "error", message: "Phone number is required." }
        : {},
    emailAddress: (v) =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? { status: "warning", message: "Email format looks incorrect." }
        : {},
    address1: (v) =>
      !v.trim() ? { status: "error", message: "Address is required." } : {},
  },
  [ContentTypeEnum.AccountType]: {
    accountType: (v) =>
      !v.trim()
        ? { status: "error", message: "Account type is required." }
        : {},
  },
  [ContentTypeEnum.AdditionalInfo]: {
    initialDeposit: (v) =>
      v && Number(v) < 100
        ? {
            status: "warning",
            message:
              "Recommended minimum deposit is $100. You may proceed, but some features may be unavailable.",
          }
        : {},
  },
  [ContentTypeEnum.Review]: {},
};

export const validateStep = (
  stepId: ContentType,
  data: AccountFormData,
): {
  fieldValidation: Record<string, FieldValidation>;
  stepStatus: ValidationStatus;
} => {
  const rules = stepFieldRules[stepId];
  const fieldValidation: Record<string, FieldValidation> = {};
  Object.keys(rules).forEach((field) => {
    fieldValidation[field] = rules[field](
      data[field as keyof AccountFormData] || "",
      data,
    );
  });
  const stepStatus = deriveStepStatus(
    fieldValidation as Record<string, { status?: ValidationStatus }>,
  );
  return { fieldValidation, stepStatus };
};

export const deriveStepStatus = (
  fields: Record<string, { status?: ValidationStatus }>,
): ValidationStatus => {
  if (Object.values(fields).some((f) => f.status === "error")) return "error";
  if (Object.values(fields).some((f) => f.status === "warning"))
    return "warning";
  return undefined;
};

export const useWizard = (
  steps: readonly { id: ContentType; label: string }[],
) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  const [validationByStep, setValidationByStep] = useState<{
    [stepId: string]: {
      fields: Record<string, FieldValidation>;
      status?: ValidationStatus;
    };
  }>({});

  const currentStepId = steps[activeStep].id;

  const validateCurrentStep = useCallback(() => {
    const { fieldValidation: fv, stepStatus } = validateStep(
      currentStepId,
      formData,
    );
    setValidationByStep((prev) => ({
      ...prev,
      [currentStepId]: { fields: fv, status: stepStatus },
    }));
    return stepStatus !== "error";
  }, [currentStepId, formData]);

  const next = useCallback(() => {
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const previous = useCallback(() => {
    setActiveStep((s) => Math.max(s - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setActiveStep(0);
    setFormData(initialFormData);
    setValidationByStep({});
  }, []);

  const fieldValidation = validationByStep[currentStepId]?.fields || {};
  const stepValidation = Object.fromEntries(
    Object.entries(validationByStep).map(([id, v]) => [
      id,
      { status: v.status },
    ]),
  );

  return {
    activeStep,
    currentStepId,
    formData,
    setFormData,
    stepValidation,
    fieldValidation,
    validateCurrentStep,
    next,
    previous,
    reset,
    setValidationByStep,
  };
};
