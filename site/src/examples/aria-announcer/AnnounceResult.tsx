import { Button, StackLayout, Text, useAriaAnnouncer } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const AnnounceResult = (): ReactElement => {
  const { announce } = useAriaAnnouncer();
  const [savedAt, setSavedAt] = useState<string>();

  const handleSave = () => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSavedAt(time);
    // The status text below isn't a live region, so announce the change.
    announce(`Draft saved at ${time}`);
  };

  return (
    <StackLayout gap={1} align="center">
      <Button onClick={handleSave}>Save draft</Button>
      <Text color="secondary">
        {savedAt ? `Draft saved at ${savedAt}` : "Draft not saved"}
      </Text>
    </StackLayout>
  );
};
