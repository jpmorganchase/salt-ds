import { useCallback, useState } from "react";

export type ValidationStatus = "error" | "warning" | undefined;
export interface FieldValidation {
  status?: ValidationStatus;
  message?: string;
}

export interface StepValidationResult {
  fields: Record<string, FieldValidation>;
  status?: ValidationStatus;
}

interface UseWizardOptions {
  steps: string[];
}

const deriveStatus = (
  fields: Record<string, FieldValidation>,
): ValidationStatus => {
  let hasWarning = false;
  for (const f of Object.values(fields)) {
    if (f.status === "error") return "error";
    if (f.status === "warning") hasWarning = true;
  }
  return hasWarning ? "warning" : undefined;
};

export function useWizard({ steps }: UseWizardOptions) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [validationsByStep, setValidationsByStep] = useState<
    Partial<Record<string, StepValidationResult>>
  >({});

  const currentStepId = steps[activeStepIndex];

  const setStepValidation = useCallback(
    (stepId: string, fields: Record<string, FieldValidation>) => {
      setValidationsByStep((prev) => ({
        ...prev,
        [stepId]: { fields, status: deriveStatus(fields) },
      }));
    },
    [],
  );

  const setCurrentStepValidation = useCallback(
    (fields: Record<string, FieldValidation>) =>
      setStepValidation(currentStepId, fields),
    [currentStepId, setStepValidation],
  );

  const updateCurrentFieldValidation = useCallback(
    (fieldName: string, validation: FieldValidation) => {
      setValidationsByStep((prev) => {
        const prevStep = prev[currentStepId] || {
          fields: {},
          status: undefined,
        };
        const newFields = { ...prevStep.fields, [fieldName]: validation };
        return {
          ...prev,
          [currentStepId]: {
            fields: newFields,
            status: deriveStatus(newFields),
          },
        };
      });
    },
    [currentStepId],
  );

  const clearStepValidation = useCallback((stepId: string) => {
    setValidationsByStep((prev) => ({
      ...prev,
      [stepId]: { fields: {}, status: undefined },
    }));
  }, []);

  const clearCurrentStepValidation = useCallback(
    () => clearStepValidation(currentStepId),
    [currentStepId, clearStepValidation],
  );

  const currentFields = validationsByStep[currentStepId]?.fields || {};
  const currentStatus = validationsByStep[currentStepId]?.status;
  const isCurrentStepValid = !Object.values(currentFields).some(
    (f) => f.status === "error",
  );

  const next = useCallback(() => {
    if (!isCurrentStepValid) return false; // Block next navigation if current step has errors
    setActiveStepIndex((i) => Math.min(i + 1, steps.length - 1));
    return true;
  }, [isCurrentStepValid, steps.length]);

  const previous = useCallback(() => {
    clearCurrentStepValidation();
    setActiveStepIndex((i) => Math.max(i - 1, 0));
  }, [clearCurrentStepValidation]);

  const reset = useCallback(() => {
    setActiveStepIndex(0);
    setValidationsByStep(() => ({}));
  }, []);

  return {
    activeStepIndex,
    currentStepId,
    next,
    previous,
    reset,
    // Validation data
    stepValidation: currentFields,
    stepStatus: currentStatus,
    isCurrentStepValid,
    stepsStatusMap: steps.reduce<
      Partial<Record<string, { status?: ValidationStatus }>>
    >((acc, id) => {
      acc[id] = { status: validationsByStep[id]?.status };
      return acc;
    }, {}),
    // External mutation APIs
    setCurrentStepValidation,
    setStepValidation,
    updateCurrentFieldValidation,
    clearCurrentStepValidation,
  };
}
