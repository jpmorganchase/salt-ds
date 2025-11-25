import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useState,
} from "react";
import type { AccountFormData } from "../wizard.stories";
import type { StepValidationResult } from "./useWizard";

export type ValidateStepFn<StepId> = (
  stepId: StepId,
  data: AccountFormData,
) => Promise<StepValidationResult["fields"]>;

interface UseAccountFormArgs<StepId> {
  initialData: AccountFormData;
  currentStepId: StepId;
  validateStep: ValidateStepFn<StepId>;
  setCurrentStepValidation: (fields: StepValidationResult["fields"]) => void;
}

export function useAccountForm<StepId>({
  initialData,
  currentStepId,
  validateStep,
  setCurrentStepValidation,
}: UseAccountFormArgs<StepId>) {
  const [formData, setFormData] = useState<AccountFormData>(initialData);

  const runValidationAndStore = useCallback(
    async (overrideData?: AccountFormData) => {
      const dataToUse = overrideData ?? formData;
      const fields = await validateStep(currentStepId, dataToUse);
      setCurrentStepValidation(fields);
      const hasErrors = Object.values(fields).some((f) => f.status === "error");
      return !hasErrors;
    },
    [currentStepId, formData, validateStep, setCurrentStepValidation],
  );

  const updateField = useCallback(
    (name: string, value: string, revalidate = false) => {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        if (revalidate) {
          runValidationAndStore(updated);
        }
        return updated;
      });
    },
    [runValidationAndStore],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField(event.target.name, event.target.value);
  };

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField(event.target.name, event.target.value, true);
  };

  const handleSelectChange = (value: string, name: string) => {
    updateField(name, value, true);
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    runValidationAndStore({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return {
    formData,
    setFormData,
    runValidationAndStore,
    handleInputChange,
    handleRadioChange,
    handleSelectChange,
    onBlur,
  };
}
