import {
  Button,
  Checkbox,
  Dropdown,
  FormField,
  FormFieldLabel,
  Input,
  Option,
} from "@salt-ds/core";
import { type FormEvent, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";

const teams: Record<string, string> = {
  "ops-emea": "EMEA Operations",
  "ops-americas": "Americas Operations",
};

// This fixture checks Salt and native forms with the repository's React runtime.
// It does not exercise React 19 Actions or a third-party form library.
function AssignmentForm({ save }: { save: (data: FormData) => Promise<void> }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const inFlight = useRef(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const data = new FormData(event.currentTarget);
    inFlight.current = true;
    setPending(true);
    setError("");
    setSaved(false);
    try {
      await save(data);
      setName("");
      setSelected([]);
      setSaved(true);
    } catch {
      setError("Save failed. Your assignment is still here; try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return (
    <form aria-label="Assignment" onSubmit={submit}>
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <Input
          name="name"
          value={name}
          readOnly={pending}
          emptyReadOnlyMarker=""
          inputProps={{
            onChange: (event) => setName(event.currentTarget.value),
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Team</FormFieldLabel>
        <Dropdown<string>
          selected={selected}
          readOnly={pending}
          placeholder="Choose a team"
          onSelectionChange={(_event, values) => setSelected(values)}
          valueToString={(value) => teams[value]}
        >
          {Object.entries(teams).map(([value, label]) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Dropdown>
      </FormField>
      <input type="hidden" name="teamId" value={selected[0] ?? ""} />
      <Checkbox
        name="internal"
        value="restricted"
        checked
        disabled
        label="Internal flag"
      />
      {error && <div role="alert">{error}</div>}
      <Button type="submit" loading={pending}>
        Save
      </Button>
      <div role="status">{saved ? "Saved." : ""}</div>
    </form>
  );
}

function deferredSave() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("Salt native form bindings", () => {
  it("submits owned values once, retains them after failure, and resets text and selection after success", async () => {
    const failedAttempt = deferredSave();
    const successfulAttempt = deferredSave();
    const save = vi
      .fn<(data: FormData) => Promise<void>>()
      .mockReturnValueOnce(failedAttempt.promise)
      .mockReturnValueOnce(successfulAttempt.promise);
    await renderWithSalt(<AssignmentForm save={save} />);
    const form = page
      .getByRole("form", { name: "Assignment" })
      .element() as HTMLFormElement;
    const submitAttempt = vi.fn();
    form.addEventListener("submit", submitAttempt);
    const name = page.getByRole("textbox", { name: "Name", exact: true });
    const team = page.getByRole("combobox", { name: "Team", exact: true });
    const submit = page.getByRole("button", { name: "Save", exact: true });
    const submittedValues = { name: "Incident response", teamId: "ops-emea" };

    await name.fill("Incident response");
    await team.click();
    await page
      .getByRole("option", { name: "EMEA Operations", exact: true })
      .click();
    await submit.click();
    expect(save).toHaveBeenCalledTimes(1);
    expect(Object.fromEntries(save.mock.calls[0][0])).toEqual(submittedValues);
    await expect.element(name).toHaveAttribute("readonly");
    await expect
      .element(page.getByRole("checkbox", { name: "Internal flag" }))
      .toBeDisabled();
    expect(Object.fromEntries(new FormData(form))).toEqual(submittedValues);

    await name.click();
    await userEvent.keyboard("{Enter}");
    // Verify Enter reached the form: the owning guard, not button loading,
    // prevents a duplicate save while keeping the fields in FormData.
    expect(submitAttempt).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => {
      failedAttempt.reject(new Error("Local save failure"));
      await failedAttempt.promise.catch(() => {});
    });
    await expect.element(page.getByRole("alert")).toBeVisible();
    await expect.element(name).toHaveValue("Incident response");
    await expect.element(name).not.toHaveAttribute("readonly");
    await expect.element(team).toHaveTextContent("EMEA Operations");
    expect(Object.fromEntries(new FormData(form))).toEqual(submittedValues);

    await submit.click();
    expect(save).toHaveBeenCalledTimes(2);
    expect(Object.fromEntries(save.mock.calls[1][0])).toEqual(submittedValues);
    await act(async () => {
      successfulAttempt.resolve();
      await successfulAttempt.promise;
    });
    await expect.element(page.getByRole("status")).toHaveTextContent("Saved.");
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
    await expect.element(name).toHaveValue("");
    await expect.element(team).toHaveTextContent("Choose a team");
    expect(Object.fromEntries(new FormData(form))).toEqual({
      name: "",
      teamId: "",
    });
  });
});
