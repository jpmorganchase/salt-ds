import { Button } from "@salt-ds/core";
import { useState } from "react";

export interface ClickRecorderProps {
  label?: string;
}

export function ClickRecorder({ label = "Activate" }: ClickRecorderProps) {
  const [clicks, setClicks] = useState(0);

  return (
    <>
      <Button onClick={() => setClicks((count) => count + 1)}>{label}</Button>
      <form hidden>
        <input data-testid="click-count" readOnly value={String(clicks)} />
      </form>
    </>
  );
}

export function FocusableWhenDisabled() {
  const [clicks, setClicks] = useState(0);

  return (
    <>
      <Button
        disabled
        focusableWhenDisabled
        onClick={() => setClicks((count) => count + 1)}
      >
        Save as draft
      </Button>
      <form hidden>
        <input data-testid="click-count" readOnly value={String(clicks)} />
      </form>
    </>
  );
}
