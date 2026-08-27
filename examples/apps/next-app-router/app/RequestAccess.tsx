"use client";

import {
  Banner,
  BannerContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { type FormEvent, useState } from "react";

export function RequestAccess() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    setSubmitted(true);
  };

  return (
    <StackLayout gap={2}>
      {submitted && (
        <Banner status="success">
          <BannerContent role="status">Access request sent.</BannerContent>
        </Banner>
      )}
      <Button sentiment="accented" onClick={() => setOpen(true)}>Request access</Button>
      <Dialog open={open} onOpenChange={setOpen} size="small">
        <form onSubmit={submit} aria-label="Access request">
          <DialogHeader header="Request workspace access" />
          <DialogContent>
            <FormField>
              <FormFieldLabel>Business reason</FormFieldLabel>
              <Input name="reason" inputProps={{ required: true }} />
            </FormField>
          </DialogContent>
          <DialogActions>
            <Button appearance="transparent" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" sentiment="accented">Send request</Button>
          </DialogActions>
        </form>
      </Dialog>
    </StackLayout>
  );
}
