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

describe("List control Option subscriptions", () => {
  it("bounds active movement and selection commits at 100 Options", () => {
    const commits = Array.from({ length: 100 }, () => 0);
    cy.mount(
      <ListBox>
        <InstrumentedOptions commits={commits} />
      </ListBox>,
    );

    cy.findByRole("listbox").focus();
    cy.findByRole("option", { name: "Option 0" }).should("be.activeDescendant");
    cy.then(() => commits.fill(0));

    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Option 1" }).should("be.activeDescendant");
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0, 1]);
      commits.fill(0);
    });

    cy.realPress("Enter");
    cy.findByRole("option", { name: "Option 1" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([1]);
    });
  });

  it("bounds ComboBox active movement commits", () => {
    const commits = Array.from({ length: 100 }, () => 0);
    cy.mount(
      <ComboBox>
        <InstrumentedOptions commits={commits} />
      </ComboBox>,
    );
    cy.findByRole("combobox").realClick();
    cy.then(() => commits.fill(0));

    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Option 0" }).should("be.activeDescendant");
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0]);
      commits.fill(0);
    });

    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Option 1" }).should("be.activeDescendant");
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0, 1]);
    });
  });

  it("bounds mouse-over and focus-visible-only commits", () => {
    const commits = Array.from({ length: 100 }, () => 0);
    cy.mount(
      <Dropdown>
        <InstrumentedOptions commits={commits} />
      </Dropdown>,
    );

    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Option 0" }).should("be.activeDescendant");
    cy.then(() => commits.fill(0));

    cy.findByRole("option", { name: "Option 5" }).realHover();
    cy.findByRole("option", { name: "Option 5" }).should("be.activeDescendant");
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0, 5]);
      commits.fill(0);
    });

    cy.realPress("Home");
    cy.findByRole("option", { name: "Option 0" }).should("be.activeDescendant");
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0, 5]);
      commits.fill(0);
    });
  });

  it("commits only the active Option for a focus-visible-only change", () => {
    const commits = Array.from({ length: 100 }, () => 0);
    const values = commits.map((_, index) =>
      index === 0 ? "Zebra" : `Option ${index}`,
    );
    cy.mount(
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
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Zebra" }).realHover();
    cy.findByRole("option", { name: "Zebra" }).should(
      "not.have.class",
      "saltOption-focusVisible",
    );
    cy.then(() => commits.fill(0));

    cy.realType("z");
    cy.findByRole("option", { name: "Zebra" }).should(
      "have.class",
      "saltOption-focusVisible",
    );
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0]);
    });
  });

  it("commits only the toggled option in a multiselect list", () => {
    const commits = Array.from({ length: 100 }, () => 0);
    cy.mount(
      <ListBox multiselect>
        <InstrumentedOptions commits={commits} />
      </ListBox>,
    );
    cy.findByRole("listbox").focus();
    cy.then(() => commits.fill(0));

    cy.realPress("Enter");
    cy.findByRole("option", { name: "Option 0" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0]);
      commits.fill(0);
    });

    cy.realPress("Enter");
    cy.findByRole("option", { name: "Option 0" }).should(
      "have.attr",
      "aria-selected",
      "false",
    );
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([0]);
    });
  });

  it("commits only the controlled selection symmetric difference", () => {
    const commits = Array.from({ length: 10 }, () => 0);

    const Fixture = () => {
      const [selected, setSelected] = useState(["Option 1"]);
      const [unrelated, setUnrelated] = useState(0);
      return (
        <>
          <button onClick={() => setSelected(["Option 2"])}>
            Replace selection
          </button>
          <button onClick={() => setUnrelated((value) => value + 1)}>
            Unrelated {unrelated}
          </button>
          <ListBox selected={selected}>
            <InstrumentedOptions commits={commits} />
          </ListBox>
        </>
      );
    };

    cy.mount(<Fixture />);
    cy.findByRole("option", { name: "Option 1" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.then(() => commits.fill(0));

    cy.findByRole("button", { name: "Replace selection" }).click();
    cy.findByRole("option", { name: "Option 2" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([1, 2]);
      commits.fill(0);
    });

    cy.findByRole("button", { name: "Unrelated 0" }).click();
    cy.findByRole("button", { name: "Unrelated 1" }).should("exist");
    cy.then(() => {
      expect(committedIndexes(commits)).to.deep.equal([]);
    });
  });

  it("uses id-based active state and value-based selection for duplicates", () => {
    cy.mount(
      <ListBox>
        <Option id="duplicate-one" value="duplicate">
          First duplicate
        </Option>
        <Option id="duplicate-two" value="duplicate">
          Second duplicate
        </Option>
      </ListBox>,
    );

    cy.findByRole("listbox").focus();
    cy.findByRole("listbox").should(
      "have.attr",
      "aria-activedescendant",
      "duplicate-one",
    );
    cy.get(".saltOption-active")
      .should("have.length", 1)
      .and("have.id", "duplicate-one");

    cy.realPress("Enter");
    cy.get("#duplicate-one").should("have.attr", "aria-selected", "true");
    cy.get("#duplicate-two").should("have.attr", "aria-selected", "true");
  });

  it("updates id, value, disabled state, and valueToString", () => {
    type Value = { label: string };
    const Fixture = () => {
      const [changed, setChanged] = useState(false);
      const value = useMemo<Value>(
        () => ({ label: changed ? "changed" : "initial" }),
        [changed],
      );
      const valueToString = useCallback(
        (item: Value) => `${changed ? "New" : "Old"}: ${item.label}`,
        [changed],
      );
      return (
        <>
          <button onClick={() => setChanged((value) => !value)}>Change</button>
          <ListBox disabled={changed} valueToString={valueToString}>
            <Option
              id={changed ? "changed-id" : "initial-id"}
              value={value}
              disabled={changed}
            />
          </ListBox>
        </>
      );
    };

    cy.mount(<Fixture />);
    cy.findByRole("option", { name: "Old: initial" }).should(
      "have.id",
      "initial-id",
    );
    cy.findByRole("button", { name: "Change" }).click();
    cy.findByRole("listbox").should("have.attr", "aria-disabled", "true");
    cy.findByRole("option", { name: "New: changed" })
      .should("have.id", "changed-id")
      .and("have.attr", "aria-disabled", "true");
  });

  it("re-registers filtered children in their current DOM order", () => {
    const Fixture = () => {
      const [showFirst, setShowFirst] = useState(true);
      return (
        <>
          <button onClick={() => setShowFirst((value) => !value)}>
            Toggle first
          </button>
          <ListBox>
            {showFirst && (
              <Option id="first-option" value="first">
                First
              </Option>
            )}
            <Option id="second-option" value="second">
              Second
            </Option>
          </ListBox>
        </>
      );
    };

    cy.mount(<Fixture />);
    cy.findByRole("button", { name: "Toggle first" }).click();
    cy.findByRole("option", { name: "First" }).should("not.exist");
    cy.findByRole("listbox").focus();
    cy.findByRole("option", { name: "Second" }).should("be.activeDescendant");
  });

  it("keeps the public context behavior available to custom consumers", () => {
    const PublicContextProbe = ({ children }: { children: ReactNode }) => {
      const { activeState, selectedState } = useListControlContext<string>();
      return (
        <>
          <output data-testid="public-context">
            {activeState?.value ?? "none"}:{selectedState.join(",")}
          </output>
          {children}
        </>
      );
    };

    cy.mount(
      <ListBox>
        <PublicContextProbe>
          <Option value="one">One</Option>
          <Option value="two">Two</Option>
        </PublicContextProbe>
      </ListBox>,
    );
    cy.findByRole("listbox").focus();
    cy.realPress("Enter");
    cy.findByTestId("public-context").should("have.text", "one:one");
  });
});
