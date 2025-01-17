import {
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
import { KeyIcon, VisibleIcon, VisibleSolidIcon } from "@salt-ds/icons";
import { type ChangeEvent, useState } from "react";

function updatePassword() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.5) {
        return resolve({});
      }

      return reject({});
    }, 2000);
  });
}

export function UpdatePassword() {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [values, setValues] = useState({
    password: "",
    passwordConfirm: "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit() {
    setLoading(true);
    setAnnouncement("Updating password...");

    updatePassword()
      .then(() => {
        setAnnouncement("Password updated successfully!");
      })
      .catch(() => {
        setAnnouncement("Failed to update password!");
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setAnnouncement("");
        }, 1000);
      });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Update Password</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxWidth: "432px" }}>
        <DialogHeader header="Update password" />
        <DialogContent>
          <StackLayout gap={3} style={{ padding: "var(--salt-spacing-25)" }}>
            <FormField onChange={handleChange}>
              <FormFieldLabel>New admin password</FormFieldLabel>
              <Input
                value={values.password}
                inputProps={{
                  name: "password",
                  type: !peek ? "password" : "text",
                }}
                endAdornment={
                  <Button
                    appearance="transparent"
                    onClick={() => setPeek(!peek)}
                  >
                    {peek ? <VisibleSolidIcon /> : <VisibleIcon />}
                  </Button>
                }
              />
            </FormField>
            <FormField onChange={handleChange}>
              <FormFieldLabel>Confirm password</FormFieldLabel>
              <Input
                value={values.passwordConfirm}
                inputProps={{
                  name: "passwordConfirm",
                  type: "password",
                }}
              />
            </FormField>
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button appearance="solid" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            sentiment="accented"
            loading={loading}
            announcement={announcement}
            onClick={handleSubmit}
          >
            <KeyIcon />
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
