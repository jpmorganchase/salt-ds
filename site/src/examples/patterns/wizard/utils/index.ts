import type {
  FieldValidation,
  StepValidationResult,
  ValidationStatus,
} from "../useWizardForm";

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

interface ValidationSchemaShape {
  validate: (data: any, options: { abortEarly: boolean }) => Promise<unknown>;
}

export function mapYupErrors(
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
export async function validateStep(
  stepValidationSchemas: Record<string, ValidationSchemaShape>,
  stepId: string,
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

export const getStepStage = (index: number, activeStepIndex: number) => {
  if (index === activeStepIndex) return "active";
  if (index < activeStepIndex) return "completed";
  return "pending";
};
