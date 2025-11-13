import { useCallback, useState } from "react";
import type * as Yup from "yup";

export type ValidationStatus = "error" | "warning" | undefined;
interface FieldValidation {
  status?: ValidationStatus;
  message?: string;
}

function mapYupErrors(err: any): Record<string, FieldValidation> {
  const out: Record<string, FieldValidation> = {};
  for (const e of err.inner ?? []) {
    // Accept explicit severity param; default all others to error
    const raw = e.params?.severity as ValidationStatus | undefined;
    const severity: ValidationStatus = raw === "warning" ? "warning" : "error";
    // Preserve an existing error if multiple validations hit same field
    const existing = out[e.path];
    if (existing) {
      out[e.path] = {
        status:
          existing.status === "error" || severity === "error"
            ? "error"
            : "warning",
        // Keep first error message if error already present; otherwise overwrite
        message:
          existing.status === "error" && severity === "warning"
            ? existing.message
            : e.message,
      };
    } else {
      out[e.path] = { status: severity, message: e.message };
    }
  }
  return out;
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
        const hasErrors = Object.values(fieldValidation).some(
          (f) => f.status === "error",
        );
        const stepStatus = deriveStepValidationStatus(fieldValidation);
        setValidationsByStep((prev) => ({
          ...prev,
          // keep warnings/errors visible
          [currentStepId]: { fields: fieldValidation, status: stepStatus },
        }));
        // Only block when there is at least one error
        return !hasErrors;
      }
    },
    [currentStepId, formData, schema],
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
  }, [initialData]);

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
