import {
  AriaAnnouncerProvider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  StackLayout,
  Switch,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

const DEFAULT_SETTINGS = { email: true, push: false };

type Settings = typeof DEFAULT_SETTINGS;

interface NotificationSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onDone: () => void;
}

const NotificationSettings = ({
  settings,
  onSettingsChange,
  onDone,
}: NotificationSettingsProps) => {
  // Inside the dialog's provider, so the message reaches its live region.
  const { announce } = useAriaAnnouncer();

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
    announce("Notification settings reset to defaults");
  };

  return (
    <>
      <DialogHeader header="Notification settings" />
      <DialogContent>
        <StackLayout gap={1}>
          <Switch
            label="Email alerts"
            checked={settings.email}
            onChange={(event) =>
              onSettingsChange({ ...settings, email: event.target.checked })
            }
          />
          <Switch
            label="Push notifications"
            checked={settings.push}
            onChange={(event) =>
              onSettingsChange({ ...settings, push: event.target.checked })
            }
          />
        </StackLayout>
      </DialogContent>
      <DialogActions>
        <Button
          sentiment="accented"
          appearance="transparent"
          onClick={handleReset}
        >
          Reset to defaults
        </Button>
        <Button sentiment="accented" onClick={onDone}>
          Done
        </Button>
      </DialogActions>
    </>
  );
};

export const InDialog = (): ReactElement => {
  const [open, setOpen] = useState(false);
  // Kept outside the dialog, so the settings survive closing it.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
        Notification settings
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Keeps announcements inside the modal dialog. */}
        <AriaAnnouncerProvider>
          <NotificationSettings
            settings={settings}
            onSettingsChange={setSettings}
            onDone={() => setOpen(false)}
          />
        </AriaAnnouncerProvider>
      </Dialog>
    </>
  );
};
