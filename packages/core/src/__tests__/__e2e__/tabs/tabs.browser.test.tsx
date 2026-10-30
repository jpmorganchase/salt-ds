import {
  Tab,
  TabAction,
  TabBar,
  TabList,
  TabPanel,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import {
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as tabsStories from "~stories/tabs/tabs.stories";

const {
  Bordered,
  DisabledTabs,
  Overflow,
  AddTabs,
  Dismissible,
  AddWithDialog,
  DismissWithConfirmation,
  WithInteractiveElementInPanel,
  Controlled,
  AsyncDismissibleTabs,
} = composeStories(tabsStories);

const selectorSafeTabs = [
  "Home",
  "Transactions",
  'Loan "A"',
  "Checks",
  "Liquidity",
];

const dynamicOverflowTabs = [
  "Home",
  "Transactions",
  "Loans",
  "Checks",
  "Liquidity",
  "With",
  "Lots",
  "More",
  "Additional",
  "Tabs",
  "Added",
  "In order to",
  "Showcase overflow",
  "Menu",
  "On",
  "Larger",
  "Screens",
];

type OverflowTestWindow = Window & {
  __setResponsiveOverflowWidth?: (width: number) => void;
  __setDynamicOverflowWidth?: (width: number) => void;
  __setPortalContractWidth?: (width: number) => void;
  __removeTab?: (value: string) => void;
};

let nextTrackedTabInstanceId = 0;

const liveRegionText = () =>
  Array.from(document.querySelectorAll("[aria-live]"))
    .map((region) => region.textContent ?? "")
    .join(" ");

function TrackedTabContent({ label }: { label: string }) {
  const [instanceId] = useState(() => {
    nextTrackedTabInstanceId += 1;
    return nextTrackedTabInstanceId;
  });
  return (
    <span data-instance-label={label}>{`${label} instance ${instanceId}`}</span>
  );
}

function SimpleOverflow({
  labels = selectorSafeTabs,
  width = 198,
  defaultValue = labels[0],
}: {
  labels?: string[];
  width?: number;
  defaultValue?: string;
}) {
  return (
    <div style={{ width }}>
      <Tabs defaultValue={defaultValue}>
        <TabBar inset divider>
          <TabList>
            {labels.map((label) => (
              <Tab key={label} value={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

function OverflowWithSelectorSafeValues() {
  return <SimpleOverflow />;
}

function OverflowAfterWidthOnlyContentChange() {
  const [expanded, setExpanded] = useState(false);
  const tabs = [
    { value: "Home", label: "Home" },
    {
      value: "Transactions",
      label: expanded ? "Transactions with a much longer label" : "Tx",
    },
    { value: "Loans", label: "Loans" },
  ];
  return (
    <>
      <div style={{ width: 230 }}>
        <Tabs defaultValue="Home">
          <TabBar inset divider>
            <TabList aria-label="Width change tablist">
              {tabs.map(({ value, label }) => (
                <Tab key={value} value={value}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              ))}
            </TabList>
          </TabBar>
        </Tabs>
      </div>
      <button onClick={() => setExpanded(true)} type="button">
        Expand label
      </button>
    </>
  );
}

function OverflowAfterContainerWidthChange() {
  const [width, setWidth] = useState(150);
  useEffect(() => {
    (window as OverflowTestWindow).__setResponsiveOverflowWidth = setWidth;
    return () => {
      delete (window as OverflowTestWindow).__setResponsiveOverflowWidth;
    };
  }, []);
  return <SimpleOverflow width={width} />;
}

function OverflowWithoutInitialSelection() {
  return (
    <div style={{ width: 198 }}>
      <Tabs>
        <TabBar inset divider>
          <TabList>
            {selectorSafeTabs.map((label) => (
              <Tab key={label} value={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

function OverflowWithControlledSelection() {
  const [selected, setSelected] = useState(selectorSafeTabs[0]);
  return (
    <div style={{ width: 198 }}>
      <Tabs value={selected} onChange={(_event, value) => setSelected(value)}>
        <TabBar inset divider>
          <TabList>
            {selectorSafeTabs.map((label) => (
              <Tab key={label} value={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

function OverflowWithIgnoredOverflowSelection() {
  const [selected, setSelected] = useState(selectorSafeTabs[0]);
  return (
    <>
      <div style={{ width: 198 }}>
        <Tabs value={selected} onChange={() => undefined}>
          <TabBar inset divider>
            <TabList>
              {selectorSafeTabs.map((label) => (
                <Tab key={label} value={label}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              ))}
            </TabList>
          </TabBar>
        </Tabs>
      </div>
      <button type="button" onClick={() => setSelected("Liquidity")}>
        Select Liquidity externally
      </button>
    </>
  );
}

function TabsWithEmptyStringValue() {
  const tabs = [
    { label: "Empty", value: "" },
    { label: "Transactions", value: "transactions" },
    { label: "Liquidity", value: "liquidity" },
  ];
  return (
    <Tabs defaultValue="">
      <TabBar inset divider>
        <TabList>
          {tabs.map(({ label, value }) => (
            <Tab key={label} value={value}>
              <TabTrigger>{label}</TabTrigger>
            </Tab>
          ))}
        </TabList>
      </TabBar>
      {tabs.map(({ label, value }) => (
        <TabPanel key={label} value={value}>
          {label}
        </TabPanel>
      ))}
    </Tabs>
  );
}

function OverflowWithEmptyStringValue() {
  const tabs = [
    { label: "Home", value: "home" },
    { label: "Transactions", value: "transactions" },
    { label: "Empty", value: "" },
    { label: "Liquidity", value: "liquidity" },
    { label: "Checks", value: "checks" },
  ];
  return (
    <div style={{ width: 198 }}>
      <Tabs defaultValue="home">
        <TabBar inset divider>
          <TabList>
            {tabs.map(({ label, value }) => (
              <Tab key={label} value={value}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

function OverflowWithDisabledHiddenTab() {
  return (
    <div style={{ width: 198 }}>
      <Tabs defaultValue={dynamicOverflowTabs[0]}>
        <TabBar inset divider>
          <TabList>
            {dynamicOverflowTabs.map((label) => (
              <Tab
                key={label}
                value={label}
                disabled={label === "Transactions"}
              >
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

function OverflowAfterClassBasedWidthChange() {
  const [wide, setWide] = useState(false);
  return (
    <>
      <style>
        {
          ".tabs-sized { width: 198px; } .tabs-sized.wide { width: 1048px; max-width: 100%; }"
        }
      </style>
      <div className={wide ? "tabs-sized wide" : "tabs-sized"}>
        <Tabs defaultValue="Home">
          <TabBar inset divider>
            <TabList aria-label="Class sized overflow tablist">
              {selectorSafeTabs.map((label) => (
                <Tab key={label} value={label}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              ))}
            </TabList>
          </TabBar>
        </Tabs>
      </div>
      <button type="button" onClick={() => setWide((value) => !value)}>
        Toggle class width
      </button>
    </>
  );
}

function DynamicOverflowBoundary() {
  const [width, setWidth] = useState(408);
  useEffect(() => {
    (window as OverflowTestWindow).__setDynamicOverflowWidth = setWidth;
    return () => {
      delete (window as OverflowTestWindow).__setDynamicOverflowWidth;
    };
  }, []);
  return (
    <div data-testid="tabs-overflow-boundary" style={{ width }}>
      <Tabs defaultValue={dynamicOverflowTabs[0]}>
        <TabBar inset divider>
          <TabList>
            {dynamicOverflowTabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

function OverflowWithTrackedTabContent() {
  const [width, setWidth] = useState(198);
  useEffect(() => {
    (window as OverflowTestWindow).__setPortalContractWidth = setWidth;
    return () => {
      delete (window as OverflowTestWindow).__setPortalContractWidth;
    };
  }, []);
  return (
    <div style={{ width }}>
      <Tabs defaultValue="Home">
        <TabBar inset divider>
          <TabList aria-label="Portal contract tablist">
            {selectorSafeTabs.map((label) => (
              <Tab
                key={label}
                value={label}
                data-root-marker={label}
                data-root-state="preserved"
              >
                <TabTrigger>
                  <TrackedTabContent label={label} />
                </TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
}

const removableTabs = [
  "Home",
  "Tx",
  "Loans",
  "Checks",
  "Liquidity",
  "With",
  "Lots",
];

function RemovableTabs({
  labels = removableTabs,
  width = 520,
  preventFocusOnDismiss = false,
  fillTabList = false,
  onChange,
}: {
  labels?: string[];
  width?: number;
  preventFocusOnDismiss?: boolean;
  fillTabList?: boolean;
  onChange?: (event: SyntheticEvent | null, value: string) => void;
}) {
  const [tabs, setTabs] = useState(labels);
  const remove = (value: string) =>
    setTabs((old) => old.filter((label) => label !== value));
  useEffect(() => {
    // Lets tests remove a tab without moving focus or closing the overflow
    // menu, like an update pushed by the application.
    (window as OverflowTestWindow).__removeTab = (value) =>
      setTabs((old) => old.filter((label) => label !== value));
    return () => {
      delete (window as OverflowTestWindow).__removeTab;
    };
  }, []);
  return (
    <>
      <div style={{ width }}>
        <Tabs defaultValue={labels[0]} onChange={onChange}>
          <TabBar inset divider>
            <TabList style={fillTabList ? { flex: "1 1 auto" } : undefined}>
              {tabs.map((label) => (
                <Tab key={label} value={label}>
                  <TabTrigger
                    onKeyDown={(event) => {
                      if (event.key === "Delete") remove(label);
                    }}
                  >
                    {label}
                  </TabTrigger>
                  <TabAction
                    aria-label="Dismiss tab"
                    // Emulates browsers (e.g. Safari) where clicking a button
                    // does not move focus to it.
                    onMouseDown={
                      preventFocusOnDismiss
                        ? (event) => event.preventDefault()
                        : undefined
                    }
                    onClick={() => remove(label)}
                  >
                    <CloseIcon aria-hidden />
                  </TabAction>
                </Tab>
              ))}
            </TabList>
          </TabBar>
        </Tabs>
      </div>
      <button type="button" onClick={() => remove("Loans")}>
        Remove Loans
      </button>
    </>
  );
}

function ControlledRemovableTabs() {
  const [tabs, setTabs] = useState(["Home", "Tx", "Loans", "Checks"]);
  const [value, setValue] = useState("Loans");
  return (
    <Tabs value={value} onChange={(_event, newValue) => setValue(newValue)}>
      <TabBar inset divider>
        <TabList>
          {tabs.map((label) => (
            <Tab key={label} value={label}>
              <TabTrigger>{label}</TabTrigger>
              <TabAction
                aria-label="Dismiss tab"
                onClick={() => {
                  setTabs((old) => old.filter((item) => item !== label));
                  if (label === value) setValue("Home");
                }}
              >
                <CloseIcon aria-hidden />
              </TabAction>
            </Tab>
          ))}
        </TabList>
      </TabBar>
    </Tabs>
  );
}

function RestorableTabs({
  ignoreChanges = false,
  onChange,
}: {
  ignoreChanges?: boolean;
  onChange: (event: SyntheticEvent | null, value: string) => void;
}) {
  const [tabs, setTabs] = useState(["Home", "Tx", "Loans", "Checks"]);
  return (
    <>
      <Tabs
        defaultValue="Loans"
        value={ignoreChanges ? "Loans" : undefined}
        onChange={onChange}
      >
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab id={`restorable-${label}`} key={label} value={label}>
                <TabTrigger
                  onKeyDown={(event) => {
                    if (event.key === "Delete") {
                      setTabs((old) => old.filter((tab) => tab !== label));
                    }
                  }}
                >
                  {label}
                </TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
      <button
        type="button"
        onClick={() => setTabs((old) => old.filter((tab) => tab !== "Loans"))}
      >
        Remove Loans
      </button>
      <button
        type="button"
        onClick={() => setTabs(["Home", "Tx", "Loans", "Checks"])}
      >
        Restore Loans
      </button>
    </>
  );
}

function LateSelectionTabs({
  onChange,
}: {
  onChange: (event: SyntheticEvent | null, value: string) => void;
}) {
  const [tabs, setTabs] = useState(["Home", "Tx", "Loans", "Checks"]);
  const [value, setValue] = useState("Home");
  const remove = (label: string) =>
    setTabs((old) => old.filter((tab) => tab !== label));
  return (
    <>
      <Tabs
        value={value}
        onChange={(event, newValue) => {
          onChange(event, newValue);
          setValue(newValue);
        }}
      >
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab key={label} value={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
      <button type="button" onClick={() => remove("Loans")}>
        Remove Loans
      </button>
      <button type="button" onClick={() => setValue("Loans")}>
        Select Loans
      </button>
      <button type="button" onClick={() => remove("Checks")}>
        Remove Checks
      </button>
    </>
  );
}

async function mountTabs(
  element: ReactElement,
  options?: { width?: number | string },
) {
  await renderWithSalt(
    <div style={{ width: options?.width ?? 1280, minWidth: 0 }}>{element}</div>,
  );
}

const tab = (name: string | RegExp) => page.getByRole("tab", { name });
const overflowList = () =>
  page.getByRole("tablist", { name: "Overflow tab options" });

async function tabCount(count: number) {
  await expect
    .poll(async () => (await page.getByRole("tab").elements()).length)
    .toBe(count);
}

async function openOverflow() {
  await tab("Overflow").click();
  await expect.element(overflowList()).toBeVisible();
}

async function clickOverflowTab(name: string | RegExp) {
  await overflowList().getByRole("tab", { name }).click();
  await expect
    .element(tab("Overflow"))
    .toHaveAttribute("aria-expanded", "false");
}

async function expectSelected(name: string | RegExp) {
  await expect.element(tab(name)).toHaveAttribute("aria-selected", "true");
}

const dismissButton = (name: string) =>
  page.getByRole("button", { name: `${name} Dismiss tab` });

// Focus recovery after removal is scheduled across several animation frames,
// so negative assertions wait for those frames to flush first.
async function waitForFrames(count = 10) {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }
}

const focusedOverflowTab = () => {
  const active = document.activeElement;
  return active?.getAttribute("role") === "tab" &&
    overflowList().query()?.contains(active)
    ? active.textContent
    : null;
};

describe("Given Tabs", () => {
  it("renders the expected tab semantics", async () => {
    await mountTabs(<Bordered />);
    await expect.element(page.getByRole("tablist")).toBeVisible();
    await tabCount(5);
    await expect
      .element(page.getByRole("tabpanel", { name: "Home" }))
      .toBeVisible();
  });

  it("supports keyboard navigation and wrapping", async () => {
    await mountTabs(<Bordered />);
    await userEvent.tab();
    await expect.element(tab("Home")).toHaveFocus();
    for (const [key, name] of [
      ["{ArrowRight}", "Transactions"],
      ["{End}", "Liquidity"],
      ["{ArrowRight}", "Home"],
      ["{ArrowLeft}", "Liquidity"],
      ["{Home}", "Home"],
    ] as const) {
      await userEvent.keyboard(key);
      await expect.element(tab(name)).toHaveFocus();
    }
  });

  it.each(["pointer", "keyboard"])(
    "selects with %s interaction",
    async (interaction) => {
      const onChange = vi.fn();
      await mountTabs(<Bordered onChange={onChange} />);
      if (interaction === "pointer") {
        await tab("Transactions").click();
        await expectSelected("Transactions");
        await expect.element(tab("Transactions")).toHaveFocus();
      } else {
        await userEvent.tab();
        await userEvent.keyboard("{ArrowRight}{Enter}");
        await expectSelected("Transactions");
        await userEvent.keyboard("{ArrowRight} ");
        await expectSelected("Loans");
      }
      expect(onChange.mock.lastCall?.[1]).toBe(
        interaction === "pointer" ? "Transactions" : "Loans",
      );
    },
  );

  it("does not select disabled tabs", async () => {
    const onChange = vi.fn();
    await mountTabs(<DisabledTabs onChange={onChange} />);
    await expect.element(tab("Loans")).toHaveAttribute("aria-disabled", "true");
    await tab("Loans").click({ force: true });
    await expect
      .element(tab("Loans"))
      .toHaveAttribute("aria-selected", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("enters, navigates and exits the overflow menu with the keyboard", async () => {
    await mountTabs(
      <>
        <Overflow />
        <button type="button">After</button>
      </>,
    );
    await tabCount(5);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}{Enter}");
    await expect.element(overflowList()).toBeVisible();
    await expect.element(tab("Liquidity")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(tab("With")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect.element(tab("Screens")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect.element(tab("Liquidity")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(tab("Overflow")).toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
  });

  it("navigates past a disabled overflow tab", async () => {
    await mountTabs(<OverflowWithDisabledHiddenTab />);
    await openOverflow();
    await expect.element(tab("Transactions")).toHaveFocus();
    await expect
      .element(tab("Transactions"))
      .toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(tab("Loans")).toHaveFocus();
  });

  it("closes overflow on an outside click", async () => {
    await mountTabs(
      <>
        <Overflow />
        <button type="button">Outside</button>
      </>,
    );
    await openOverflow();
    await tabCount(18);
    await page.getByRole("button", { name: "Outside" }).click();
    await tabCount(5);
  });

  it("selects overflow tabs with pointer and keyboard", async () => {
    await mountTabs(<Overflow />);
    await openOverflow();
    await clickOverflowTab("Liquidity");
    await expectSelected("Liquidity");
    await expect.element(tab("Liquidity")).toHaveFocus();
    await openOverflow();
    await expect.element(tab("Checks")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(overflowList()).not.toBeInTheDocument();
    await expectSelected("Checks");
  });

  it("does not transiently drop a main tab during overflow selection", async () => {
    await mountTabs(<Overflow />);
    const tablist = page.getByRole("tablist").element();
    const snapshots: string[][] = [];
    const order = () =>
      Array.from(
        tablist.querySelectorAll(':scope > [data-tabslot] [role="tab"]'),
      ).map((item) => item.textContent?.trim() ?? "");
    snapshots.push(order());
    const observer = new MutationObserver(() => snapshots.push(order()));
    observer.observe(tablist, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    await openOverflow();
    await clickOverflowTab("Liquidity");
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    observer.disconnect();
    expect(snapshots).toContainEqual([
      "Home",
      "Transactions",
      "Loans",
      "Liquidity",
    ]);
    expect(snapshots).not.toContainEqual(["Home", "Transactions", "Liquidity"]);
  });

  it.each([
    ["uncontrolled", () => <Overflow />],
    ["without an initial selection", () => <OverflowWithoutInitialSelection />],
    ["controlled", () => <OverflowWithControlledSelection />],
  ])("announces overflow promotion when %s", async (_name, createFixture) => {
    await mountTabs(createFixture());
    await openOverflow();
    await clickOverflowTab("Liquidity");
    await expectSelected("Liquidity");
    await expect
      .poll(liveRegionText)
      .toContain("Liquidity moved to main tab list");
  });

  it("does not announce a later external selection that was previously ignored", async () => {
    await mountTabs(<OverflowWithIgnoredOverflowSelection />);
    await openOverflow();
    await clickOverflowTab("Liquidity");
    await expectSelected("Home");
    // Let the ignored controlled update clear its overflow-selection marker.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    await page
      .getByRole("button", { name: "Select Liquidity externally" })
      .click();
    await expectSelected("Liquidity");
    // Overflow announcements are scheduled after 100 ms.
    await new Promise((resolve) => setTimeout(resolve, 150));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    expect(liveRegionText()).not.toContain("Liquidity moved to main tab list");
  });

  it("makes the first visible tab tabbable without an initial selection", async () => {
    await mountTabs(
      <>
        <OverflowWithoutInitialSelection />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    await expect.element(tab("Home")).toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
  });

  it("preserves custom props and mounted content while tabs move through overflow", async () => {
    await mountTabs(<OverflowWithTrackedTabContent />);
    const home = page.getByText(/^Home instance/).element().textContent;
    const liquidity = page
      .getByText(/^Liquidity instance/)
      .element().textContent;
    expect(
      document.querySelector(
        '[data-root-marker="Home"][data-root-state="preserved"]',
      ),
    ).not.toBeNull();
    (window as OverflowTestWindow).__setPortalContractWidth?.(1000);
    await expect.element(tab("Overflow")).not.toBeInTheDocument();
    await expect.element(page.getByText(home ?? "")).toBeInTheDocument();
    await expect.element(page.getByText(liquidity ?? "")).toBeInTheDocument();
    (window as OverflowTestWindow).__setPortalContractWidth?.(198);
    await expect.element(tab("Overflow")).toBeVisible();
    await openOverflow();
    expect(
      overflowList().element().querySelector('[data-root-marker="Liquidity"]'),
    ).not.toBeNull();
    await clickOverflowTab(/^Liquidity instance /);
    await expect.element(page.getByText(liquidity ?? "")).toBeInTheDocument();
  });

  it("selects when only the promoted tab and trigger fit", async () => {
    await mountTabs(
      <div style={{ width: 140 }}>
        <Overflow />
      </div>,
    );
    await tabCount(2);
    await openOverflow();
    await tabCount(18);
    await clickOverflowTab("Liquidity");
    await tabCount(2);
    await expectSelected("Liquidity");
  });

  it("supports selector characters in tab values", async () => {
    await mountTabs(<OverflowWithSelectorSafeValues />);
    await openOverflow();
    await clickOverflowTab('Loan "A"');
    await expectSelected('Loan "A"');
  });

  it("keeps overflow closed when it returns after resizing", async () => {
    await mountTabs(<OverflowAfterContainerWidthChange />);
    await openOverflow();
    (window as OverflowTestWindow).__setResponsiveOverflowWidth?.(1000);
    await expect.element(tab("Overflow")).not.toBeInTheDocument();
    (window as OverflowTestWindow).__setResponsiveOverflowWidth?.(150);
    await expect.element(tab("Overflow")).toBeVisible();
    await expect
      .element(tab("Overflow"))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(overflowList()).not.toBeInTheDocument();
  });

  it("recomputes overflow after class width changes", async () => {
    await mountTabs(<OverflowAfterClassBasedWidthChange />);
    const toggle = page.getByRole("button", { name: "Toggle class width" });
    await expect.element(tab("Overflow")).toBeVisible();
    await toggle.click();
    await expect.element(tab("Overflow")).not.toBeInTheDocument();
    await toggle.click();
    await expect.element(tab("Overflow")).toBeVisible();
    await expect
      .element(tab("Overflow"))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("recomputes overflow after tab content changes width", async () => {
    await mountTabs(<OverflowAfterWidthOnlyContentChange />);
    await expect.element(tab("Overflow")).not.toBeInTheDocument();
    await page.getByRole("button", { name: "Expand label" }).click();
    await expect.element(tab("Overflow")).toBeVisible();
  });

  it("keeps a promoted tab pinned when selecting an existing main tab", async () => {
    await mountTabs(<Overflow />);
    await openOverflow();
    await clickOverflowTab("Liquidity");
    await tab("Transactions").click();
    await expectSelected("Transactions");
    await expect.element(tab("Liquidity")).toBeVisible();
  });

  it("adds tabs and reserves space for the add button", async () => {
    await mountTabs(
      <div style={{ width: 420 }}>
        <AddTabs />
      </div>,
    );
    const add = page.getByRole("button", { name: "Add tab" });
    await add.click();
    await expectSelected("New tab");
    await expect.element(add).toHaveFocus();
    await add.click();
    await add.click();
    await expect.element(tab("Overflow")).toBeVisible();
    await expect
      .poll(() => {
        const tablistRect = page
          .getByRole("tablist")
          .element()
          .getBoundingClientRect();
        const buttonRect = add.element().getBoundingClientRect();
        return tablistRect.right <= buttonRect.left;
      })
      .toBe(true);
  });

  it("adds a tab through confirmation without changing selection", async () => {
    await mountTabs(<AddWithDialog />);
    await page.getByRole("button", { name: "Add tab" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByLabelText("New tab name").fill("New tab");
    await page.getByRole("button", { name: "Confirm" }).click();
    await tabCount(4);
    await expectSelected("Home");
    await expect
      .element(page.getByRole("button", { name: "Add tab" }))
      .toHaveFocus();
  });

  it("describes available tab actions", async () => {
    await mountTabs(<Dismissible />);
    await expect
      .element(tab("Home"))
      .toHaveAccessibleDescription("1 action available");
  });

  it("dismisses tabs and moves selection and focus", async () => {
    await mountTabs(<Dismissible />);
    await page.getByRole("button", { name: "Liquidity Dismiss tab" }).click();
    await tabCount(4);
    await expect.element(tab("Liquidity")).not.toBeInTheDocument();
    await expectSelected("Home");
    await expect.element(tab("Checks")).toHaveFocus();
    await page.getByRole("button", { name: "Home Dismiss tab" }).click();
    await expectSelected("Transactions");
    await expect.element(tab("Transactions")).toHaveFocus();
  });

  it("restores focus after asynchronous selected-tab removal", async () => {
    await mountTabs(<AsyncDismissibleTabs />);
    await page.getByRole("button", { name: "Home Dismiss tab" }).click();
    await expectSelected("Transactions");
    await expect.element(tab("Transactions")).toHaveFocus();
  });

  it("reports an automatic selection after removal with a null event", async () => {
    const onChange = vi.fn();
    await mountTabs(<Dismissible onChange={onChange} />);
    await page.getByRole("button", { name: "Home Dismiss tab" }).click();
    await expect
      .poll(() => onChange.mock.calls)
      .toContainEqual([null, "Transactions"]);
  });

  it("supports keyboard traversal and dismissal actions", async () => {
    await mountTabs(<Dismissible />);
    await userEvent.tab();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Home Dismiss tab" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(tab("Transactions")).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard(
      "{Shift>}{Tab}{/Shift}{Shift>}{Tab}{/Shift}{Enter}",
    );
    await tabCount(4);
    await expectSelected("Transactions");
  });

  it("confirms or cancels tab dismissal", async () => {
    await mountTabs(<DismissWithConfirmation />);
    const dismiss = page.getByRole("button", { name: "Home Dismiss tab" });
    await dismiss.click();
    await page.getByRole("button", { name: "No" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(dismiss).toHaveFocus();
    await dismiss.click();
    await page.getByRole("button", { name: "Yes" }).click();
    await tabCount(2);
    await expectSelected("Transactions");
  });

  it.each([
    ["non-interactive", () => <Bordered />, "0"],
    ["interactive", () => <WithInteractiveElementInPanel />, null],
  ])(
    "sets panel tabIndex for %s content",
    async (_name, createFixture, tabIndex) => {
      await mountTabs(createFixture());
      const panel = page.getByRole("tabpanel");
      if (tabIndex === null)
        await expect.element(panel).not.toHaveAttribute("tabindex");
      else await expect.element(panel).toHaveAttribute("tabindex", tabIndex);
    },
  );

  it("dynamically adjusts the number of main tabs", async () => {
    await mountTabs(<DynamicOverflowBoundary />);
    await tabCount(5);
    (window as OverflowTestWindow).__setDynamicOverflowWidth?.(548);
    await tabCount(7);
    (window as OverflowTestWindow).__setDynamicOverflowWidth?.(248);
    await tabCount(3);
  });

  it("supports empty-string values in main and overflow tabs", async () => {
    await mountTabs(<TabsWithEmptyStringValue />);
    await expectSelected("Empty");
    await expect
      .element(page.getByRole("tabpanel", { name: "Empty" }))
      .toBeVisible();
    await tab("Transactions").click();
    await expectSelected("Transactions");
    await mountTabs(<OverflowWithEmptyStringValue />);
    await openOverflow();
    await clickOverflowTab("Empty");
    await expectSelected("Empty");
    await tabCount(2);
  });

  it("supports the controlled story across main, overflow and dismissal", async () => {
    await mountTabs(
      <div style={{ width: 526 }}>
        <Controlled />
      </div>,
    );
    await tab("Transactions").click();
    await expectSelected("Transactions");
    await openOverflow();
    await clickOverflowTab("Lots");
    await expectSelected("Lots");
    await page.getByRole("button", { name: "Lots Dismiss tab" }).click();
    await expectSelected("Transactions");
  });

  it("uses visible order for navigation after overflow promotion", async () => {
    await mountTabs(<Overflow />);
    await openOverflow();
    await clickOverflowTab("With");
    await userEvent.keyboard("{Home}");
    for (const name of ["Transactions", "Loans", "With", "Overflow", "Home"]) {
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(tab(name)).toHaveFocus();
    }
  });

  it.each([
    ["Tab", "{Tab}", "After"],
    ["Shift+Tab", "{Shift>}{Tab}{/Shift}", "Overflow"],
  ])("closes overflow and moves focus on %s", async (_name, key, target) => {
    await mountTabs(
      <>
        <button type="button">Before</button>
        <Overflow />
        <button type="button">After</button>
      </>,
    );
    await openOverflow();
    await userEvent.keyboard(key);
    await expect.element(overflowList()).not.toBeInTheDocument();
    if (target === "Overflow") await expect.element(tab(target)).toHaveFocus();
    else
      await expect
        .element(page.getByRole("button", { name: target }))
        .toHaveFocus();
  });

  it("moves Shift+Tab focus from an overflow tab action back to its tab", async () => {
    await mountTabs(<RemovableTabs />);
    await openOverflow();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(tab("With")).toHaveFocus();
    await userEvent.tab();
    await expect.element(dismissButton("With")).toHaveFocus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(tab("With")).toHaveFocus();
    await expect.element(overflowList()).toBeVisible();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(overflowList()).not.toBeInTheDocument();
    await expect.element(tab("Overflow")).toHaveFocus();
  });

  it("returns Shift+Tab focus to the overflow button of the same Tabs", async () => {
    await mountTabs(
      <>
        <Overflow />
        <Overflow />
      </>,
    );
    const secondOverflowButton = tab("Overflow").nth(1);
    await secondOverflowButton.click();
    await expect.element(overflowList()).toBeVisible();
    await expect.poll(focusedOverflowTab).toBe("Liquidity");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(overflowList()).not.toBeInTheDocument();
    await expect.element(secondOverflowButton).toHaveFocus();
  });

  it("keeps the overflow panel inside the horizontal viewport", async () => {
    await mountTabs(<Overflow />, { width: 408 });
    await openOverflow();
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth ===
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("does not select a disabled overflow tab with %s", async (_name, key) => {
    await mountTabs(<OverflowWithDisabledHiddenTab />);
    await openOverflow();
    await expect.element(tab("Transactions")).toHaveFocus();
    await userEvent.keyboard(key);
    await waitForFrames(2);
    await expect.element(overflowList()).toBeVisible();
    await expect
      .element(tab("Transactions"))
      .toHaveAttribute("aria-selected", "false");
    await expectSelected("Home");
  });
});

describe("Given Tabs with removable tabs", () => {
  it("selects and focuses the previous tab when the selected last tab is removed", async () => {
    const onChange = vi.fn();
    await mountTabs(
      <RemovableTabs
        labels={["Home", "Tx", "Loans", "Checks"]}
        onChange={onChange}
      />,
    );
    await tab("Checks").click();
    await expectSelected("Checks");
    await userEvent.keyboard("{Delete}");
    await tabCount(3);
    await expectSelected("Loans");
    await expect.element(tab("Loans")).toHaveFocus();
    expect(onChange.mock.lastCall).toEqual([null, "Loans"]);
  });

  it("removes every tab without errors", async () => {
    await mountTabs(<RemovableTabs labels={["Alpha", "Beta"]} />);
    await tab("Beta").click();
    await userEvent.keyboard("{Delete}");
    await tabCount(1);
    await expectSelected("Alpha");
    await expect.element(tab("Alpha")).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await tabCount(0);
    // Errors thrown during focus recovery are caught by Vitest's unhandled
    // error check; this catches the tabs unmounting after a render error.
    await waitForFrames();
    await expect.element(page.getByRole("tablist")).toBeInTheDocument();
  });

  it("focuses the new selection when the selected tab is dismissed while the overflow button has focus", async () => {
    await mountTabs(<RemovableTabs preventFocusOnDismiss />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect.element(tab("Overflow")).toHaveFocus();
    await dismissButton("Home").click();
    await expect.element(tab("Home")).not.toBeInTheDocument();
    await expectSelected("Tx");
    await expect.element(tab("Tx")).toHaveFocus();
  });

  it("keeps focus on the overflow button when a non-selected tab is dismissed", async () => {
    await mountTabs(<RemovableTabs preventFocusOnDismiss />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect.element(tab("Overflow")).toHaveFocus();
    await dismissButton("Loans").click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await waitForFrames();
    await expect.element(tab("Overflow")).toHaveFocus();
    await expectSelected("Home");
  });

  it("focuses the new selection when the selected tab is dismissed while another tab action has focus", async () => {
    await mountTabs(<RemovableTabs preventFocusOnDismiss />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.tab();
    await expect.element(dismissButton("Tx")).toHaveFocus();
    await dismissButton("Home").click({ force: true });
    await expect.element(tab("Home")).not.toBeInTheDocument();
    await expectSelected("Tx");
    await expect.element(tab("Tx")).toHaveFocus();
  });

  it("does not move focus from outside the tabs when a tab is removed externally", async () => {
    await mountTabs(<RemovableTabs />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.element(tab("Loans")).toHaveFocus();
    const removeLoans = page.getByRole("button", { name: "Remove Loans" });
    await removeLoans.click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await waitForFrames();
    await expect.element(removeLoans).toHaveFocus();
    await expectSelected("Home");
  });

  it("selects the next tab without moving focus when the selected tab is removed externally", async () => {
    const onChange = vi.fn();
    await mountTabs(<RemovableTabs onChange={onChange} />);
    await tab("Loans").click();
    await expectSelected("Loans");
    const removeLoans = page.getByRole("button", { name: "Remove Loans" });
    await removeLoans.click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await expectSelected("Checks");
    expect(onChange.mock.lastCall).toEqual([null, "Checks"]);
    await waitForFrames();
    await expect.element(removeLoans).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("selects the next tab each time a tab with the same explicit id is dismissed", async () => {
    const onChange = vi.fn();
    await mountTabs(<RestorableTabs onChange={onChange} />);
    await tab("Loans").click();
    const loansId = tab("Loans").element().id;
    await userEvent.keyboard("{Delete}");
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await expectSelected("Checks");
    expect(onChange.mock.calls).toEqual([[null, "Checks"]]);

    await page.getByRole("button", { name: "Restore Loans" }).click();
    await expect.element(tab("Loans")).toHaveAttribute("id", loansId);
    await tab("Loans").click();
    await expectSelected("Loans");
    await userEvent.keyboard("{Delete}");
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await expectSelected("Checks");
    await expect.element(tab("Checks")).toHaveFocus();
    expect(onChange.mock.lastCall).toEqual([null, "Checks"]);
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("reports selection once per removal when a controlled parent restores the same id and ignores changes", async () => {
    const onChange = vi.fn();
    await mountTabs(<RestorableTabs ignoreChanges onChange={onChange} />);
    const loansId = tab("Loans").element().id;
    await page.getByRole("button", { name: "Remove Loans" }).click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await expect.poll(() => onChange.mock.calls).toEqual([[null, "Checks"]]);
    await waitForFrames(30);
    expect(onChange).toHaveBeenCalledTimes(1);

    await page.getByRole("button", { name: "Restore Loans" }).click();
    await expect.element(tab("Loans")).toHaveAttribute("id", loansId);
    await expectSelected("Loans");
    await page.getByRole("button", { name: "Remove Loans" }).click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await expect.poll(() => onChange.mock.calls.length).toBe(2);
    expect(onChange.mock.lastCall).toEqual([null, "Checks"]);
    await waitForFrames(30);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("does not replace the selection from a tab that was removed before it was selected", async () => {
    const onChange = vi.fn();
    await mountTabs(<LateSelectionTabs onChange={onChange} />);
    await page.getByRole("button", { name: "Remove Loans" }).click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await waitForFrames();

    await page.getByRole("button", { name: "Select Loans" }).click();
    await page.getByRole("button", { name: "Remove Checks" }).click();
    await expect.element(tab("Checks")).not.toBeInTheDocument();
    await waitForFrames(30);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("selects a neighbour and keeps the overflow menu open when the selected tab is removed while the menu is open", async () => {
    const onChange = vi.fn();
    // A tab list that fills its container keeps its width when a tab is
    // removed, so the overflow menu stays open.
    await mountTabs(<RemovableTabs fillTabList onChange={onChange} />);
    await openOverflow();
    await expect.poll(focusedOverflowTab).toBe("Liquidity");
    (window as OverflowTestWindow).__removeTab?.("Home");
    await expect.element(tab("Home")).not.toBeInTheDocument();
    await expectSelected("Tx");
    expect(onChange.mock.calls).toEqual([[null, "Tx"]]);
    await waitForFrames();
    await expect.element(overflowList()).toBeVisible();
    // "Liquidity" moves into the space "Home" left in the main row, so focus
    // stays at the same position in the menu.
    expect(focusedOverflowTab()).toBe("With");
    await userEvent.keyboard("{Escape}");
    await expect.element(overflowList()).not.toBeInTheDocument();
    await expect.element(tab("Overflow")).toHaveFocus();
    await expectSelected("Tx");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("restores focus to the new selection after a confirmed dismissal", async () => {
    await mountTabs(<DismissWithConfirmation />);
    await dismissButton("Home").click();
    await page.getByRole("button", { name: "Yes" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expectSelected("Transactions");
    await expect.element(tab("Transactions")).toHaveFocus();
  });

  it("skips the overflow button when focusing a neighbour of the removed tab", async () => {
    await mountTabs(
      <RemovableTabs
        labels={[
          "Home",
          "Tx",
          "Loans",
          "Checks",
          "A considerably longer tab label",
          "Z",
        ]}
      />,
    );
    await tab("Checks").click();
    await expectSelected("Checks");
    await userEvent.keyboard("{Delete}");
    await expect.element(tab("Checks")).not.toBeInTheDocument();
    await expect.element(tab("Overflow")).toBeInTheDocument();
    await expectSelected("Loans");
    await expect.element(tab("Loans")).toHaveFocus();
  });

  it("closes the overflow menu and focuses a visible tab when the only overflow tab is removed", async () => {
    await mountTabs(
      <RemovableTabs labels={["Home", "Tx", "Loans", "Checks", "Liquidity"]} />,
    );
    await openOverflow();
    await expect.element(tab("Liquidity")).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await expect.element(overflowList()).not.toBeInTheDocument();
    await expect.element(tab("Overflow")).not.toBeInTheDocument();
    await tabCount(4);
    await expect.element(tab("Checks")).toHaveFocus();
    await expectSelected("Home");
  });

  it("focuses a visible tab when the focused overflow button is removed", async () => {
    await mountTabs(
      <RemovableTabs
        labels={["Home", "Tx", "Loans", "Checks", "Liquidity"]}
        preventFocusOnDismiss
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect.element(tab("Overflow")).toHaveFocus();
    await dismissButton("Loans").click();
    await expect.element(tab("Overflow")).not.toBeInTheDocument();
    await tabCount(4);
    await expect.element(tab("Checks")).toHaveFocus();
    await expectSelected("Home");
  });

  it("focuses the next overflow tab when an overflow tab is dismissed with the pointer", async () => {
    await mountTabs(<RemovableTabs />);
    await openOverflow();
    await dismissButton("With").click();
    await expect.element(tab("With")).not.toBeInTheDocument();
    await expect.poll(focusedOverflowTab).toBe("Lots");
    await waitForFrames();
    await expect.element(overflowList()).toBeVisible();
    expect(focusedOverflowTab()).toBe("Lots");
    await expectSelected("Home");
  });

  it("focuses the next overflow tab when an overflow tab is deleted with the keyboard", async () => {
    await mountTabs(<RemovableTabs />);
    await openOverflow();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(tab("With")).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await expect.element(tab("With")).not.toBeInTheDocument();
    await expect.poll(focusedOverflowTab).toBe("Lots");
    await waitForFrames();
    expect(focusedOverflowTab()).toBe("Lots");
  });

  it("focuses the next overflow tab when an overflow tab is dismissed through its action", async () => {
    await mountTabs(<RemovableTabs />);
    await openOverflow();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(tab("With")).toHaveFocus();
    await userEvent.tab();
    await expect.element(dismissButton("With")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(tab("With")).not.toBeInTheDocument();
    await expect.poll(focusedOverflowTab).toBe("Lots");
    await waitForFrames();
    expect(focusedOverflowTab()).toBe("Lots");
  });

  it("focuses the previous overflow tab when the last overflow tab is dismissed", async () => {
    await mountTabs(<RemovableTabs />);
    await openOverflow();
    await userEvent.keyboard("{End}");
    await expect.element(tab("Lots")).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await expect.element(tab("Lots")).not.toBeInTheDocument();
    await expect.poll(focusedOverflowTab).toBe("With");
    await waitForFrames();
    expect(focusedOverflowTab()).toBe("With");
  });

  it("focuses the tab selected by a controlled parent after the selected tab is dismissed", async () => {
    await mountTabs(<ControlledRemovableTabs />);
    await dismissButton("Loans").click();
    await expect.element(tab("Loans")).not.toBeInTheDocument();
    await expectSelected("Home");
    await expect.element(tab("Home")).toHaveFocus();
  });
});
