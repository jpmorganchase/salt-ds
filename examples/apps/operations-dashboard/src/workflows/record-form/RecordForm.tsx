import {
  Button,
  DialogActions,
  DialogContent,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { type FormEvent, useId, useRef, useState } from "react";
import {
  type RecordDraft,
  type RecordDraftErrors,
  type RecordFormProps,
  validateRecordDraft,
} from "./types";
import "./RecordForm.css";

function hasErrors(errors: RecordDraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function RecordForm({
  draft,
  formLabel = "Create incident record",
  onChange,
  onSubmit,
  onCancel,
  submission,
  submitLabel = "Create incident",
}: RecordFormProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<RecordDraftErrors>({});
  const formId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLInputElement>(null);
  const isPending = submission.status === "pending";

  const updateDraft = (field: keyof RecordDraft, value: string) => {
    const nextDraft = { ...draft, [field]: value };
    onChange(nextDraft);
    if (hasSubmitted) setErrors(validateRecordDraft(nextDraft));
  };

  const focusFirstInvalidField = (nextErrors: RecordDraftErrors) => {
    if (nextErrors.title) titleRef.current?.focus();
    else if (nextErrors.service) serviceRef.current?.focus();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const nextErrors = validateRecordDraft(draft);
    setHasSubmitted(true);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      focusFirstInvalidField(nextErrors);
      return;
    }
    onSubmit(draft);
  };

  const titleMessage =
    errors.title ??
    "Use a concise title that makes the operational impact clear.";
  const serviceMessage =
    errors.service ??
    "Name the service or operational process affected by this record.";

  return (
    <form
      aria-label={formLabel}
      className="recordForm"
      noValidate
      onSubmit={submit}
    >
      <DialogContent>
        <StackLayout className="recordFormFields" gap={2}>
          {hasSubmitted && hasErrors(errors) && (
            <div className="recordFormAlert" role="alert">
              Review the incident details before saving.
            </div>
          )}
          {submission.status === "failed" && (
            <div className="recordFormAlert" role="alert">
              {submission.message}
            </div>
          )}
          <FormField
            id={`${formId}-incident-title`}
            necessity="required"
            readOnly={isPending}
            validationStatus={errors.title ? "error" : undefined}
          >
            <FormFieldLabel>Incident title</FormFieldLabel>
            <Input
              inputRef={titleRef}
              name="title"
              value={draft.title}
              inputProps={{
                "aria-invalid": Boolean(errors.title),
                minLength: 5,
                onChange: (event) =>
                  updateDraft("title", event.currentTarget.value),
                required: true,
              }}
              placeholder="Risk calculator latency"
            />
            <FormFieldHelperText>{titleMessage}</FormFieldHelperText>
          </FormField>
          <FormField
            id={`${formId}-affected-service`}
            necessity="required"
            readOnly={isPending}
            validationStatus={errors.service ? "error" : undefined}
          >
            <FormFieldLabel>
              Affected service or operational process
            </FormFieldLabel>
            <Input
              inputRef={serviceRef}
              name="service"
              value={draft.service}
              inputProps={{
                "aria-invalid": Boolean(errors.service),
                onChange: (event) =>
                  updateDraft("service", event.currentTarget.value),
                required: true,
              }}
              placeholder="Risk calculator"
            />
            <FormFieldHelperText>{serviceMessage}</FormFieldHelperText>
          </FormField>
        </StackLayout>
      </DialogContent>
      <DialogActions className="recordFormActions">
        <Button appearance="bordered" disabled={isPending} onClick={onCancel}>
          Close
        </Button>
        <Button
          type="submit"
          sentiment="accented"
          loading={isPending}
          {...(isPending ? { loadingAnnouncement: "Saving incident." } : {})}
        >
          {submission.status === "failed" ? "Retry save" : submitLabel}
        </Button>
      </DialogActions>
    </form>
  );
}
