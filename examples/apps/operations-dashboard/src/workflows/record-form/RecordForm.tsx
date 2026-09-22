import {
  Banner,
  BannerContent,
  Button,
  DialogActions,
  DialogContent,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
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
  const focusInvalidAfterSubmit = useRef(false);
  const isPending = submission.status === "pending";

  const updateDraft = (field: keyof RecordDraft, value: string) => {
    const nextDraft = { ...draft, [field]: value };
    onChange(nextDraft);
    if (hasSubmitted) setErrors(validateRecordDraft(nextDraft));
  };

  useEffect(() => {
    if (!focusInvalidAfterSubmit.current) return;
    focusInvalidAfterSubmit.current = false;
    if (errors.title) titleRef.current?.focus();
    else if (errors.service) serviceRef.current?.focus();
  }, [errors]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const nextErrors = validateRecordDraft(draft);
    setHasSubmitted(true);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      focusInvalidAfterSubmit.current = true;
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
  const errorMessage =
    hasSubmitted && hasErrors(errors)
      ? "Review the incident details before saving."
      : submission.status === "failed"
        ? submission.message
        : undefined;

  return (
    <form
      aria-label={formLabel}
      className="recordForm"
      noValidate
      onSubmit={submit}
    >
      <DialogContent>
        <StackLayout className="recordFormFields" gap={2}>
          {errorMessage && (
            <Banner status="error">
              <BannerContent className="recordFormAlert" role="alert">
                {errorMessage}
              </BannerContent>
            </Banner>
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
        <Button appearance="bordered" onClick={onCancel}>
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
