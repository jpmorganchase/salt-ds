import { useCallback, useReducer } from "react";

// Represents the validation status for a field or step
export type ValidationStatus = "error" | "warning" | undefined;

// Describes the validation result for a single field
export interface FieldValidation {
  status?: ValidationStatus;
  message?: string; // Optional validation message
}

// Describes the validation result for a step, including all its fields
export interface StepValidationResult {
  fields: Record<string, FieldValidation>; // Validation results for each field in the step
  status?: ValidationStatus; // Overall validation status for the step
}

// Function type for validating a step
export type ValidateStepFn = (
  stepId: string, // The ID of the step to validate
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable to support other use-cases.
  data: Record<string, any>, // The form data to validate
) => Promise<StepValidationResult["fields"]>; // Returns a promise resolving to field validation results

// Represents the state of the wizard form
export interface WizardFormState {
  activeStepIndex: number; // Index of the currently active step
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable to support other use-cases.
  formData: Record<string, any>; // The form data collected across steps
  validationsByStep: Partial<Record<string, StepValidationResult>>; // Validation results for each step
}

export type WizardFormAction =
  | { type: "UPDATE_FIELD"; name: string; value: string } // Update a specific field in the form data
  | {
      type: "SET_VALIDATION"; // Set validation results for a step
      stepId: string; // The ID of the step being validated
      fields: Record<string, FieldValidation>; // Validation results for the step's fields
    }
  | { type: "NEXT_STEP" } // Move to the next step
  | { type: "PREVIOUS_STEP" } // Move to the previous step
  | { type: "RESET" }; // Reset the wizard form state

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

export const wizardFormReducer = (
  state: WizardFormState,
  action: WizardFormAction,
  steps: string[],
  initialState: WizardFormState,
): WizardFormState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: { ...state.formData, [action.name]: action.value },
      };
    case "SET_VALIDATION":
      return {
        ...state,
        validationsByStep: {
          ...state.validationsByStep,
          [action.stepId]: {
            fields: action.fields,
            status: deriveStatus(action.fields),
          },
        },
      };
    case "NEXT_STEP":
      return {
        ...state,
        activeStepIndex: Math.min(state.activeStepIndex + 1, steps.length - 1),
      };
    case "PREVIOUS_STEP":
      return {
        ...state,
        activeStepIndex: Math.max(state.activeStepIndex - 1, 0),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// Default reducer for wizard
export type UseWizardReducer = (
  state: WizardFormState, // Current state of the wizard form
  action: WizardFormAction, // Action to apply to the state
  steps: string[], // Array of step IDs
  initialState: WizardFormState, // Initial state of the wizard form
) => WizardFormState;

// Options for configuring the `useWizardForm` hook
interface UseWizardFormOptions {
  steps: string[]; // Array of step IDs in the wizard
  initialState: WizardFormState; // Initial state of the wizard form
  validateStep: ValidateStepFn; // Function to validate a step
  reducer?: UseWizardReducer; // Reducer function to handle state transitions
}

export function useWizardForm({
  steps,
  initialState,
  validateStep,
  reducer = wizardFormReducer,
}: UseWizardFormOptions) {
  const [state, dispatch] = useReducer(
    (state: WizardFormState, action: WizardFormAction) =>
      reducer(state, action, steps, initialState),
    initialState,
  );

  const currentStepId = steps[state.activeStepIndex];

  const runValidationAndStore = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: This is acceptable to support other use-cases.
    async (overrideData?: Record<string, any>) => {
      const dataToUse = overrideData ?? state.formData;
      const fields = await validateStep(currentStepId, dataToUse);
      dispatch({ type: "SET_VALIDATION", stepId: currentStepId, fields });
      const hasErrors = Object.values(fields).some((f) => f.status === "error");
      return !hasErrors;
    },
    [currentStepId, state.formData, validateStep],
  );

  // Updates a specific field in the form data and revalidates the step
  const updateField = useCallback(
    (name: string, value: string) => {
      dispatch({ type: "UPDATE_FIELD", name, value });
      runValidationAndStore({ ...state.formData, [name]: value });
    },
    [state.formData, runValidationAndStore],
  );

  // Moves to the next step if the current step is valid
  const next = useCallback(() => {
    runValidationAndStore().then((isValid) => {
      if (isValid) dispatch({ type: "NEXT_STEP" });
    });
  }, [runValidationAndStore]);

  // Moves to the previous step
  const previous = useCallback(() => {
    dispatch({ type: "PREVIOUS_STEP" });
  }, []);

  // Resets the wizard form to its initial state
  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    currentStepId,
    updateField,
    next,
    previous,
    reset,
    runValidationAndStore,
  };
}
