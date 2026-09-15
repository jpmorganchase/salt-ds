import {
  ComboBox,
  Dropdown,
  ListBox,
  Option,
  useListControlContext,
} from "@salt-ds/core";
import {
  memo,
  Profiler,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const committedIndexes = (commits: number[]) =>
  commits.flatMap((count, index) => (count > 0 ? [index] : []));

const InstrumentedOption = memo(
  ({
    commits,
    index,
    value = `Option ${index}`,
  }: {
    commits: number[];
    index: number;
    value?: string;
  }) => (
    <Profiler
      id={`option-${index}`}
      onRender={() => {
        commits[index] += 1;
      }}
    >
      <Option value={value}>{value}</Option>
    </Profiler>
  ),
);

const InstrumentedOptions = ({
  commits,
  count = commits.length,
}: {
  commits: number[];
  count?: number;
}) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: Static test options never reorder.
      <InstrumentedOption commits={commits} index={index} key={index} />
    ))}
  </>
);

function ControlledSelectionFixture({ commits }: { commits: number[] }) {
  const [selected, setSelected] = useState(["Option 1"]);
  const [unrelated, setUnrelated] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setSelected(["Option 2"])}>
        Replace selection
      </button>
      <button type="button" onClick={() => setUnrelated((value) => value + 1)}>
        Unrelated {unrelated}
      </button>
      <ListBox selected={selected}>
        <InstrumentedOptions commits={commits} />
      </ListBox>
    </>
  );
}

function MutableOptionFixture() {
  const [changed, setChanged] = useState(false);
  const value = useMemo(
    () => ({ label: changed ? "changed" : "initial" }),
    [changed],
  );
  const valueToString = useCallback(
    (item: { label: string }) => `${changed ? "New" : "Old"}: ${item.label}`,
    [changed],
  );
  return (
    <>
      <button type="button" onClick={() => setChanged((value) => !value)}>
        Change
      </button>
      <ListBox disabled={changed} valueToString={valueToString}>
        <Option
          id={changed ? "changed-id" : "initial-id"}
          value={value}
          disabled={changed}
        />
      </ListBox>
    </>
  );
}

function FilteredChildrenFixture() {
  const [showFirst, setShowFirst] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setShowFirst((value) => !value)}>
        Toggle first
      </button>
      <ListBox>
        {showFirst ? (
          <Option id="first-option" value="first">
            First
          </Option>
        ) : null}
        <Option id="second-option" value="second">
          Second
        </Option>
      </ListBox>
    </>
  );
}

function PublicContextProbe({ children }: { children: ReactNode }) {
  const { activeState, selectedState } = useListControlContext<string>();
  return (
    <>
      <output data-testid="public-context">
        {activeState?.value ?? "none"}:{selectedState.join(",")}
      </output>
      {children}
    </>
  );
}

const listbox = () => page.getByRole("listbox");
const combobox = () => page.getByRole("combobox");
const option = (name: string) =>
  page.getByRole("option", { name, exact: true });

async function expectActive(name: string) {
  const optionId = option(name).element().id;
  await expect
    .poll(
      () =>
        document.activeElement?.getAttribute("aria-activedescendant") ===
        optionId,
    )
    .toBe(true);
}

describe("List control Option subscriptions", () => {
  it("bounds active movement and selection commits at 100 Options", async () => {
    const commits = Array.from({ length: 100 }, () => 0);
    await renderWithSalt(
      <ListBox>
        <InstrumentedOptions commits={commits} />
      </ListBox>,
    );

    listbox().element().focus();
    await expectActive("Option 0");
    commits.fill(0);

    await userEvent.keyboard("{ArrowDown}");
    await expectActive("Option 1");
    expect(committedIndexes(commits)).toEqual([0, 1]);
    commits.fill(0);

    await userEvent.keyboard("{Enter}");
    await expect
      .element(option("Option 1"))
      .toHaveAttribute("aria-selected", "true");
    expect(committedIndexes(commits)).toEqual([1]);
  });

  it("bounds ComboBox active movement commits", async () => {
    const commits = Array.from({ length: 100 }, () => 0);
    await renderWithSalt(
      <ComboBox>
        <InstrumentedOptions commits={commits} />
      </ComboBox>,
    );
    await combobox().click();
    commits.fill(0);

    await userEvent.keyboard("{ArrowDown}");
    await expectActive("Option 0");
    expect(committedIndexes(commits)).toEqual([0]);
    commits.fill(0);

    await userEvent.keyboard("{ArrowDown}");
    await expectActive("Option 1");
    expect(committedIndexes(commits)).toEqual([0, 1]);
  });

  it("bounds mouse-over and keyboard active movement commits", async () => {
    const commits = Array.from({ length: 100 }, () => 0);
    await renderWithSalt(
      <Dropdown>
        <InstrumentedOptions commits={commits} />
      </Dropdown>,
    );

    await combobox().click();
    await expectActive("Option 0");
    commits.fill(0);

    await option("Option 5").hover();
    await expectActive("Option 5");
    expect(committedIndexes(commits)).toEqual([0, 5]);
    commits.fill(0);

    await userEvent.keyboard("{Home}");
    await expectActive("Option 0");
    expect(committedIndexes(commits)).toEqual([0, 5]);
  });

  it("commits only the active Option for a focus-visible-only change", async () => {
    const commits = Array.from({ length: 100 }, () => 0);
    const values = commits.map((_, index) =>
      index === 0 ? "Zebra" : `Option ${index}`,
    );
    await renderWithSalt(
      <Dropdown>
        {values.map((value, index) => (
          <InstrumentedOption
            commits={commits}
            index={index}
            key={value}
            value={value}
          />
        ))}
      </Dropdown>,
    );
    await combobox().click();
    await option("Zebra").hover();
    await expect
      .element(option("Zebra"))
      .not.toHaveClass("saltOption-focusVisible");
    commits.fill(0);

    await userEvent.keyboard("z");
    await expect
      .element(option("Zebra"))
      .toHaveClass("saltOption-focusVisible");
    expect(committedIndexes(commits)).toEqual([0]);
  });

  it("commits only the toggled option in a multiselect list", async () => {
    const commits = Array.from({ length: 100 }, () => 0);
    await renderWithSalt(
      <ListBox multiselect>
        <InstrumentedOptions commits={commits} />
      </ListBox>,
    );
    listbox().element().focus();
    await expectActive("Option 0");
    commits.fill(0);

    await userEvent.keyboard("{Enter}");
    await expect
      .element(option("Option 0"))
      .toHaveAttribute("aria-selected", "true");
    expect(committedIndexes(commits)).toEqual([0]);
    commits.fill(0);

    await userEvent.keyboard("{Enter}");
    await expect
      .element(option("Option 0"))
      .toHaveAttribute("aria-selected", "false");
    expect(committedIndexes(commits)).toEqual([0]);
  });

  it("commits only the controlled selection symmetric difference", async () => {
    const commits = Array.from({ length: 10 }, () => 0);
    await renderWithSalt(<ControlledSelectionFixture commits={commits} />);
    await expect
      .element(option("Option 1"))
      .toHaveAttribute("aria-selected", "true");
    commits.fill(0);

    await page.getByRole("button", { name: "Replace selection" }).click();
    await expect
      .element(option("Option 2"))
      .toHaveAttribute("aria-selected", "true");
    expect(committedIndexes(commits)).toEqual([1, 2]);
    commits.fill(0);

    await page.getByRole("button", { name: "Unrelated 0" }).click();
    await expect
      .element(page.getByRole("button", { name: "Unrelated 1" }))
      .toBeInTheDocument();
    expect(committedIndexes(commits)).toEqual([]);
  });

  it("uses id-based active state and value-based selection for duplicates", async () => {
    await renderWithSalt(
      <ListBox>
        <Option id="duplicate-one" value="duplicate">
          First duplicate
        </Option>
        <Option id="duplicate-two" value="duplicate">
          Second duplicate
        </Option>
      </ListBox>,
    );

    listbox().element().focus();
    await expect
      .element(listbox())
      .toHaveAttribute("aria-activedescendant", "duplicate-one");
    const activeOptions = document.querySelectorAll(".saltOption-active");
    expect(activeOptions).toHaveLength(1);
    expect(activeOptions[0]).toHaveAttribute("id", "duplicate-one");

    await userEvent.keyboard("{Enter}");
    await expect
      .element(option("First duplicate"))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(option("Second duplicate"))
      .toHaveAttribute("aria-selected", "true");
  });

  it("updates id, value, disabled state, and valueToString", async () => {
    await renderWithSalt(<MutableOptionFixture />);
    await expect
      .element(option("Old: initial"))
      .toHaveAttribute("id", "initial-id");
    await page.getByRole("button", { name: "Change" }).click();
    await expect.element(listbox()).toHaveAttribute("aria-disabled", "true");
    await expect
      .element(option("New: changed"))
      .toHaveAttribute("id", "changed-id");
    await expect
      .element(option("New: changed"))
      .toHaveAttribute("aria-disabled", "true");
  });

  it("tracks filtered children in their current DOM order", async () => {
    await renderWithSalt(<FilteredChildrenFixture />);
    await page.getByRole("button", { name: "Toggle first" }).click();
    await expect.element(option("First")).not.toBeInTheDocument();
    listbox().element().focus();
    await expectActive("Second");

    await page.getByRole("button", { name: "Toggle first" }).click();
    await expect.element(option("First")).toBeInTheDocument();
    listbox().element().focus();
    await expectActive("First");
  });

  it("keeps the public context behavior available to custom consumers", async () => {
    await renderWithSalt(
      <ListBox>
        <PublicContextProbe>
          <Option value="one">One</Option>
          <Option value="two">Two</Option>
        </PublicContextProbe>
      </ListBox>,
    );
    listbox().element().focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByTestId("public-context"))
      .toHaveTextContent("one:one");
  });

  it("keeps standalone Option backward-compatible", async () => {
    const onClick = vi.fn();
    await renderWithSalt(<Option value="standalone" onClick={onClick} />);
    const standalone = option("standalone");
    await expect.element(standalone).toHaveAttribute("aria-selected", "false");
    await standalone.hover();
    await standalone.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
