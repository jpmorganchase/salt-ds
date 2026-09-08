export interface RecordDraft {
  title: string;
  service: string;
}

export type RecordFormSubmission =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "failed"; message: string };

export interface RecordFormProps {
  draft: RecordDraft;
  formLabel?: string;
  onChange: (draft: RecordDraft) => void;
  onSubmit: (draft: RecordDraft) => void;
  onCancel: () => void;
  submission: RecordFormSubmission;
  submitLabel?: string;
}

export type RecordDraftErrors = Partial<Record<keyof RecordDraft, string>>;

export function validateRecordDraft(draft: RecordDraft): RecordDraftErrors {
  const errors: RecordDraftErrors = {};
  if (draft.title.trim().length < 5) {
    errors.title =
      "Enter at least 5 characters so the incident can be understood in the operations record.";
  }
  if (draft.service.trim().length === 0) {
    errors.service =
      "Enter the affected service or operational process before saving this incident record.";
  }
  return errors;
}
