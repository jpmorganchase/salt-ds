import { FormField, FormFieldLabel, Input } from "@salt-ds/core";

export interface ClientReferenceFieldProps {
  value: string;
}

export function ClientReferenceField({ value }: ClientReferenceFieldProps) {
  return (
    <FormField readOnly>
      <FormFieldLabel>Client reference</FormFieldLabel>
      <Input value={value} />
    </FormField>
  );
}
