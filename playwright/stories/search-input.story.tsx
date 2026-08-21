import { SearchInput } from "@salt-ds/lab";
import { useState } from "react";

const inputProps = { "aria-label": "Search" };

export interface UncontrolledProps {
  defaultValue?: string;
}

export function Uncontrolled({ defaultValue = "" }: UncontrolledProps) {
  const [changeCount, setChangeCount] = useState(0);
  const [changedValue, setChangedValue] = useState("");
  const [clearCount, setClearCount] = useState(0);
  const [submittedValue, setSubmittedValue] = useState("");

  return (
    <>
      <SearchInput
        defaultValue={defaultValue}
        inputProps={inputProps}
        onChange={(_event, value) => {
          setChangeCount((count) => count + 1);
          setChangedValue(value);
        }}
        onClear={() => setClearCount((count) => count + 1)}
        onSubmit={(value) => setSubmittedValue(String(value))}
      />
      <form hidden>
        <input
          data-testid="change-count"
          readOnly
          value={String(changeCount)}
        />
        <input data-testid="changed-value" readOnly value={changedValue} />
        <input data-testid="clear-count" readOnly value={String(clearCount)} />
        <input data-testid="submitted-value" readOnly value={submittedValue} />
      </form>
    </>
  );
}

export function Controlled() {
  const [value, setValue] = useState("value a");
  const [changedValue, setChangedValue] = useState("");

  return (
    <>
      <SearchInput
        inputProps={inputProps}
        onChange={(_event, nextValue) => {
          setChangedValue(nextValue);
          setValue(nextValue);
        }}
        value={value}
      />
      <form hidden>
        <input data-testid="changed-value" readOnly value={changedValue} />
      </form>
    </>
  );
}

export function Fixed() {
  const [attemptedValue, setAttemptedValue] = useState("");

  return (
    <>
      <SearchInput
        inputProps={inputProps}
        onChange={(_event, nextValue) => setAttemptedValue(nextValue)}
        value="value a"
      />
      <form hidden>
        <input data-testid="attempted-value" readOnly value={attemptedValue} />
      </form>
    </>
  );
}
