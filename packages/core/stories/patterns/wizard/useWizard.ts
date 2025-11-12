import { useCallback, useState } from "react";
import type * as Yup from "yup";

export type ValidationStatus = "error" | "warning" | undefined;
interface FieldValidation {
  status?: ValidationStatus;
  message?: string;
}

function mapYupErrors(err: any): Record<string, FieldValidation> {
  return (err.inner ?? []).reduce(
    (acc: Record<string, FieldValidation>, e: any) => {
      acc[e.path] = {
        status: e.message.toLowerCase().includes("required")
          ? "error"
          : e.message.toLowerCase().includes("recommended")
            ? "warning"
            : undefined,
        message: e.message,
      };
      return acc;
    },
    {},
  );
}

function deriveStepValidationStatus(
  fields: Record<string, FieldValidation>,
): ValidationStatus {
  const statuses = Object.values(fields).map((f) => f.status);
  if (statuses.includes("error")) return "error";
  if (statuses.includes("warning")) return "warning";
  return undefined;
}

export const useWizard = <
  C extends string,
  T extends Record<string, any>,
>(props: {
  steps: { id: C; label: string }[];
  initialData: T;
  schema: Record<C, Yup.ObjectSchema<any>>;
}) => {
  const { schema, steps, initialData } = props;
  const [activeStepIndex, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialData);
  const [validationsByStep, setValidationsByStep] = useState<{
    [stepId: string]: {
      fields: Record<string, FieldValidation>;
      status?: ValidationStatus;
    };
  }>({});

  const currentStepId = steps[activeStepIndex].id;

  const validateCurrentStep = useCallback(
    async (dataOverride?: T) => {
      const currentSchema = schema[currentStepId];
      const dataToValidate = dataOverride || formData;
      try {
        await currentSchema.validate(dataToValidate, { abortEarly: false });
        setValidationsByStep((prev) => ({
          ...prev,
          [currentStepId]: { fields: {}, status: undefined },
        }));
        return true;
      } catch (err: any) {
        const fieldValidation = mapYupErrors(err);
        const stepStatus = deriveStepValidationStatus(fieldValidation);
        setValidationsByStep((prev) => ({
          ...prev,
          [currentStepId]: { fields: fieldValidation, status: stepStatus },
        }));
        return false;
      }
    },
    [currentStepId, formData],
  );

  const next = useCallback(() => {
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const previous = useCallback(() => {
    setActiveStep((s) => Math.max(s - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setActiveStep(0);
    setFormData(initialData);
    setValidationsByStep({});
  }, []);

  const stepFieldValidation = validationsByStep[currentStepId]?.fields || {};
  const stepsStatusMap = Object.fromEntries(
    Object.entries(validationsByStep).map(([id, v]) => [
      id,
      { status: v.status },
    ]),
  );

  return {
    activeStepIndex,
    currentStepId,
    formData,
    setFormData,
    stepsStatusMap,
    stepFieldValidation,
    validateCurrentStep,
    next,
    previous,
    reset,
  };
};
