import {
  Tab,
  TabBar,
  TabList,
  TabPanel,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type ReactElement, useEffect, useState } from "react";
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

type ResponsiveOverflowWindow = Cypress.AUTWindow & {
  __setResponsiveOverflowWidth?: (width: number) => void;
  __setDynamicOverflowWidth?: (width: number) => void;
};

type OverflowOrderWindow = Cypress.AUTWindow & {
  __overflowOrderObserver?: MutationObserver;
  __overflowOrderSnapshots?: string[][];
};

type PortalContractWindow = Cypress.AUTWindow & {
  __setPortalContractWidth?: (width: number) => void;
};

let nextTrackedTabInstanceId = 0;

function TrackedTabContent({ label }: { label: string }) {
  const [instanceId] = useState(() => {
    nextTrackedTabInstanceId += 1;
    return nextTrackedTabInstanceId;
  });

  return (
    <span data-instance-label={label}>{`${label} instance ${instanceId}`}</span>
  );
}

function OverflowWithSelectorSafeValues() {
  return (
    <div style={{ width: 198 }}>
      <Tabs defaultValue={selectorSafeTabs[0]}>
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
        <Tabs defaultValue={tabs[0].value}>
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
    Object.assign(window, {
      __setResponsiveOverflowWidth: setWidth,
    });

    return () => {
      delete (
        window as Window & {
          __setResponsiveOverflowWidth?: typeof setWidth;
        }
      ).__setResponsiveOverflowWidth;
    };
  }, []);

  return (
    <div style={{ width }}>
      <Tabs defaultValue={selectorSafeTabs[0]}>
        <TabBar inset divider>
          <TabList aria-label="Responsive overflow tablist">
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
      <Tabs
        value={selected}
        onChange={(_event, nextValue) => setSelected(nextValue)}
      >
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
        {`
          .tabsNextClassSized {
            width: 198px;
          }

          .tabsNextClassSizedWide {
            width: 1048px;
            max-width: 100%;
          }
        `}
      </style>
      <div
        className={
          wide
            ? "tabsNextClassSized tabsNextClassSizedWide"
            : "tabsNextClassSized"
        }
      >
        <Tabs defaultValue={selectorSafeTabs[0]}>
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
      <button onClick={() => setWide((current) => !current)} type="button">
        Toggle class width
      </button>
    </>
  );
}

function OverflowWithinContainer({ width }: { width: number }) {
  return (
    <div style={{ width }}>
      <Overflow />
    </div>
  );
}

function DynamicOverflowBoundary() {
  const [width, setWidth] = useState(408);

  useEffect(() => {
    Object.assign(window, {
      __setDynamicOverflowWidth: setWidth,
    });

    return () => {
      delete (
        window as Window & {
          __setDynamicOverflowWidth?: typeof setWidth;
        }
      ).__setDynamicOverflowWidth;
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
    Object.assign(window, {
      __setPortalContractWidth: setWidth,
    });

    return () => {
      delete (
        window as Window & {
          __setPortalContractWidth?: typeof setWidth;
        }
      ).__setPortalContractWidth;
    };
  }, []);

  return (
    <div style={{ width }}>
      <Tabs defaultValue={selectorSafeTabs[0]}>
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

function clickOverflowTab(name: string | RegExp) {
  cy.findByRole("tablist", { name: "Overflow tab options" })
    .should("be.visible")
    .within(() => {
      cy.findByRole("tab", { name }).click();
    });

  cy.findByRole("tab", { name: "Overflow" }).should(
    "have.attr",
    "aria-expanded",
    "false",
  );
}

function assertSelectedMainTab(name: string) {
  cy.findByRole("tablist").within(() => {
    cy.findByRole("tab", { name, selected: true }).should("be.visible");
  });
}

function mountTabs(
  element: ReactElement,
  options?: { width?: number | string },
) {
  cy.mount(
    <div style={{ width: options?.width ?? 1280, minWidth: 0 }}>{element}</div>,
  );
}

describe("Given a Tabstrip", () => {
  it("should render with tablist and tab roles", () => {
    mountTabs(<Bordered />);
    cy.findByRole("tablist").should("be.visible");
    cy.findAllByRole("tab").should("have.length", 5);
  });

  it("should support keyboard navigation and wrap", () => {
    mountTabs(<Bordered />);
    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("Home");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
  });

  it("should support selection with a mouse", () => {
    const changeSpy = cy.stub().as("changeSpy");
    mountTabs(<Bordered onChange={changeSpy} />);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).click();
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Transactions",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should support selection with the keyboard", () => {
    const changeSpy = cy.stub().as("changeSpy");
    mountTabs(<Bordered onChange={changeSpy} />);
    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.realPress("ArrowRight");
    cy.realPress("Enter");
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Transactions",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.realPress("Space");
    cy.findByRole("tab", { name: "Loans" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Loans",
    );
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");
  });

  it("should allow keyboard access into and out of the overflow menu", () => {
    mountTabs(<Overflow />);

    cy.findAllByRole("tab").should("have.length", 5);

    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("tab", { name: "Overflow" }).should("be.focused");

    cy.realPress("Enter");

    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");

    cy.realPress("Escape");
    cy.findByRole("tab", { name: "Overflow" }).should("be.focused");
  });

  it("should allow tabs to be disabled", () => {
    const changeSpy = cy.stub().as("changeSpy");
    mountTabs(<DisabledTabs onChange={changeSpy} />);
    cy.findByRole("tab", { name: "Loans" }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
    cy.findByRole("tab", { name: "Loans" }).click();
    cy.findByRole("tab", { name: "Loans" }).should(
      "have.attr",
      "aria-selected",
      "false",
    );
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");
  });

  it("should overflow into a menu when there is not enough space to show all tabs", () => {
    mountTabs(<Overflow />);
    cy.findAllByRole("tab").should("have.length", 5);
    cy.findByRole("tab", { name: "Overflow" }).should("be.visible");
  });

  it("should allow keyboard navigation in the menu", () => {
    mountTabs(
      <>
        <Overflow />
        <button>end</button>
      </>,
    );

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("tab", { name: "With" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("tab", { name: "Screens" }).should("be.focused");
    cy.realPress("Home");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("Escape");
    cy.findByRole("tab", { name: "Overflow" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should navigate past a disabled tab in the overflow menu", () => {
    mountTabs(<OverflowWithDisabledHiddenTab />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Transactions" })
      .should("be.focused")
      .and("have.attr", "aria-disabled", "true");

    cy.realPress("ArrowDown");
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");
  });

  it("should restore focus correctly after opening the menu with a mouse", () => {
    mountTabs(
      <>
        <Overflow />
        <button>end</button>
      </>,
    );

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("Escape");
    cy.findByRole("tab", { name: "Overflow" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should dismiss the overflow menu when a click is detected outside", () => {
    mountTabs(<Overflow />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findAllByRole("tab").should("have.length", 18);

    cy.get("body").click(0, 0);
    cy.findAllByRole("tab").should("have.length", 5);
  });

  it("should allow selection in the menu", () => {
    mountTabs(<Overflow />);

    cy.findAllByRole("tab").should("have.length", 5);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");

    clickOverflowTab("Liquidity");
    cy.findByRole("tab", { name: "Liquidity", selected: true })
      .should("have.attr", "aria-selected", "true")
      .and("be.focused");

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.realPress("Enter");
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "not.exist",
    );
    cy.findByRole("tab", { name: "Checks" })
      .should("have.attr", "aria-selected", "true")
      .should("be.focused");
  });

  it("should not temporarily remove an extra main tab when selecting from overflow", () => {
    mountTabs(<Overflow />);

    cy.window().then((win) => {
      const overflowOrderWindow = win as OverflowOrderWindow;
      const tablist = win.document.querySelector('[role="tablist"]');

      expect(tablist).to.exist;
      if (!tablist) {
        throw new Error("Expected tablist to exist");
      }

      const getMainTabOrder = () =>
        Array.from(
          tablist.querySelectorAll(':scope > [data-tabslot] [role="tab"]'),
        ).map((tab) => tab.textContent?.trim() ?? "");

      overflowOrderWindow.__overflowOrderSnapshots = [getMainTabOrder()];
      overflowOrderWindow.__overflowOrderObserver = new win.MutationObserver(
        () => {
          overflowOrderWindow.__overflowOrderSnapshots?.push(getMainTabOrder());
        },
      );
      overflowOrderWindow.__overflowOrderObserver.observe(tablist, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-selected"],
      });
    });

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Liquidity");

    cy.window().then(
      (win) =>
        new Cypress.Promise<void>((resolve) => {
          const overflowOrderWindow = win as OverflowOrderWindow;
          win.requestAnimationFrame(() => {
            win.requestAnimationFrame(() => {
              overflowOrderWindow.__overflowOrderObserver?.disconnect();
              resolve();
            });
          });
        }),
    );

    cy.window().then((win) => {
      const overflowOrderWindow = win as OverflowOrderWindow;
      const snapshots = overflowOrderWindow.__overflowOrderSnapshots ?? [];

      expect(snapshots).to.deep.include([
        "Home",
        "Transactions",
        "Loans",
        "Liquidity",
      ]);
      expect(snapshots).not.to.deep.include([
        "Home",
        "Transactions",
        "Liquidity",
      ]);
    });
  });

  it("should announce when a selected overflow tab moves to the main list", () => {
    mountTabs(<Overflow />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Liquidity");
    assertSelectedMainTab("Liquidity");
    cy.get("[aria-live]", { timeout: 8000 }).should(
      "contain.text",
      "Liquidity moved to main tab list",
    );
  });

  it("should announce when the first selection comes from overflow", () => {
    mountTabs(<OverflowWithoutInitialSelection />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Liquidity");
    assertSelectedMainTab("Liquidity");
    cy.get("[aria-live]", { timeout: 8000 }).should(
      "contain.text",
      "Liquidity moved to main tab list",
    );
  });

  it("should make the first visible tab tabbable when there is no initial selection", () => {
    mountTabs(
      <>
        <OverflowWithoutInitialSelection />
        <button type="button">After</button>
      </>,
    );

    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "After" }).should("be.focused");
  });

  it("should announce when a controlled parent immediately applies an overflow selection", () => {
    mountTabs(<OverflowWithControlledSelection />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Liquidity");

    assertSelectedMainTab("Liquidity");
    cy.get("[aria-live]", { timeout: 8000 }).should(
      "contain.text",
      "Liquidity moved to main tab list",
    );
  });

  it("should not announce when the same overflow value is later set externally after being ignored", () => {
    mountTabs(<OverflowWithIgnoredOverflowSelection />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Liquidity");
    cy.findByRole("tab", { name: "Home", selected: true }).should("be.visible");

    cy.findByRole("button", { name: "Select Liquidity externally" }).click();

    assertSelectedMainTab("Liquidity");
    cy.get("[aria-live]").should(
      "not.contain.text",
      "Liquidity moved to main tab list",
    );
  });

  it("should preserve custom tab props and content instances while moving through overflow", () => {
    let homeInstance = "";
    let liquidityInstance = "";

    mountTabs(<OverflowWithTrackedTabContent />);

    cy.findByRole("tablist", { name: "Portal contract tablist" }).within(() => {
      cy.get('[data-slotid="main:Home"] [data-tab-host="Home"]').should(
        "exist",
      );
    });

    cy.get('[data-instance-label="Home"]')
      .invoke("text")
      .then((text) => {
        homeInstance = text;
      });
    cy.get('[data-instance-label="Liquidity"]')
      .invoke("text")
      .then((text) => {
        liquidityInstance = text;
      });

    cy.get('[data-root-marker="Home"][data-root-state="preserved"]').should(
      "exist",
    );

    cy.window().then((win) => {
      const portalContractWindow = win as PortalContractWindow;
      portalContractWindow.__setPortalContractWidth?.(1000);
    });

    cy.findByRole("tab", { name: "Overflow" }).should("not.exist");

    cy.then(() => {
      cy.get('[data-instance-label="Home"]').should("have.text", homeInstance);
    });
    cy.then(() => {
      cy.get('[data-instance-label="Liquidity"]').should(
        "have.text",
        liquidityInstance,
      );
    });

    cy.window().then((win) => {
      const portalContractWindow = win as PortalContractWindow;
      portalContractWindow.__setPortalContractWidth?.(198);
    });

    cy.findByRole("tab", { name: "Overflow" }).should("be.visible");
    cy.findByRole("tab", { name: "Overflow" }).click();

    cy.findByRole("tablist", { name: "Overflow tab options" })
      .should("be.visible")
      .within(() => {
        cy.get(
          '[data-root-marker="Liquidity"][data-root-state="preserved"]',
        ).should("exist");
      });

    cy.then(() => {
      cy.get('[data-instance-label="Liquidity"]').should(
        "have.text",
        liquidityInstance,
      );
    });

    clickOverflowTab(/^Liquidity instance /);

    cy.findByRole("tablist", { name: "Portal contract tablist" }).within(() => {
      cy.get(
        '[data-root-marker="Liquidity"][data-root-state="preserved"]',
      ).should("exist");
    });
    cy.then(() => {
      cy.get('[data-instance-label="Liquidity"]').should(
        "have.text",
        liquidityInstance,
      );
    });
  });

  it("should allow selection in the menu when only having enough space for the newly selected tab", () => {
    mountTabs(<OverflowWithinContainer width={140} />);

    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.findAllByRole("tab").should("have.length", 2);

    cy.findByRole("tab", { name: "Overflow" }).click();

    cy.findAllByRole("tab").should("have.length", 18); // overflow menu shown

    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    clickOverflowTab("Liquidity");

    cy.findAllByRole("tab").should("have.length", 2); // overflow menu hidden

    cy.findByRole("tab", { name: "Liquidity", selected: true }).should(
      "be.focused",
    );
  });

  it("should allow overflow selection when values contain selector characters", () => {
    mountTabs(<OverflowWithSelectorSafeValues />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab('Loan "A"');

    cy.findByRole("tab", { name: 'Loan "A"', selected: true }).should(
      "be.focused",
    );
  });

  it("should keep the overflow menu closed when overflow returns after being removed by resize", () => {
    mountTabs(<OverflowAfterContainerWidthChange />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.window().then((win) => {
      const responsiveWindow = win as ResponsiveOverflowWindow;
      responsiveWindow.__setResponsiveOverflowWidth?.(1000);
    });
    cy.findByRole("tab", { name: "Overflow" }).should("not.exist");
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "not.exist",
    );

    cy.window().then((win) => {
      const responsiveWindow = win as ResponsiveOverflowWindow;
      responsiveWindow.__setResponsiveOverflowWidth?.(150);
    });
    cy.findByRole("tab", { name: "Overflow" })
      .should("be.visible")
      .and("have.attr", "aria-expanded", "false");
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "not.exist",
    );
  });

  it("should recompute overflow when sizing is driven by CSS classes", () => {
    mountTabs(<OverflowAfterClassBasedWidthChange />);

    cy.findByRole("tablist", { name: "Class sized overflow tablist" }).within(
      () => {
        cy.findByRole("tab", { name: "Overflow" }).should("be.visible");
      },
    );

    cy.findByRole("button", { name: "Toggle class width" }).click();

    cy.findByRole("tablist", { name: "Class sized overflow tablist" }).within(
      () => {
        cy.findByRole("tab", { name: "Overflow" }).should("not.exist");
      },
    );

    cy.findByRole("button", { name: "Toggle class width" }).click();

    cy.findByRole("tablist", { name: "Class sized overflow tablist" }).within(
      () => {
        cy.findByRole("tab", { name: "Overflow" })
          .should("be.visible")
          .and("have.attr", "aria-expanded", "false");
      },
    );
  });

  it("should recompute overflow when tab content changes width without resizing the container", () => {
    mountTabs(<OverflowAfterWidthOnlyContentChange />);

    cy.findByRole("tablist", { name: "Width change tablist" }).within(() => {
      cy.findByRole("tab", { name: "Overflow" }).should("not.exist");
    });

    cy.findByRole("button", { name: "Expand label" }).click();

    cy.findByRole("tablist", { name: "Width change tablist" }).within(() => {
      cy.findByRole("tab", { name: "Overflow" }).should("be.visible");
    });
  });

  it("should keep a pinned overflow tab visible when selection moves to an already visible tab", () => {
    mountTabs(<Overflow />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Liquidity");
    assertSelectedMainTab("Liquidity");

    cy.findByRole("tab", { name: "Transactions" }).click();
    assertSelectedMainTab("Transactions");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.visible");
  });

  it("should support adding tabs", () => {
    mountTabs(<AddTabs />);
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Add tab" }).click();
    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "false",
    );
    cy.findByRole("tab", { name: "New tab" })
      .should("be.visible")
      .and("have.attr", "aria-selected", "true");
    cy.findByRole("button", { name: "Add tab" }).should("be.focused");
  });

  it("should reserve space for the add button when tabs overflow", () => {
    mountTabs(
      <div style={{ width: 420 }}>
        <AddTabs />
      </div>,
    );

    cy.findByRole("button", { name: "Add tab" }).click();
    cy.findByRole("button", { name: "Add tab" }).click();
    cy.findByRole("button", { name: "Add tab" }).click();

    cy.findByRole("tab", { name: "Overflow" }).should("be.visible");

    cy.findByRole("tablist").then(($tablist) => {
      cy.findByRole("button", { name: "Add tab" }).then(($button) => {
        const tablistRect = $tablist[0].getBoundingClientRect();
        const buttonRect = $button[0].getBoundingClientRect();

        expect(tablistRect.right).to.be.at.most(buttonRect.left);
      });
    });
  });

  it("should support adding tabs with confirmation", () => {
    mountTabs(<AddWithDialog />);
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Add tab" }).click();

    cy.findByRole("dialog").should("be.visible");
    cy.findByLabelText("New tab name").click();
    cy.realType("New tab");
    cy.findByRole("button", { name: "Confirm" }).click();

    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Add tab" }).should("be.focused");

    cy.get("body").then(($body) => {
      if ($body.find("[data-overflowbutton]").length > 0) {
        cy.findByRole("tab", { name: "Overflow" }).click();
        cy.findByRole("tablist", { name: "Overflow tab options" }).within(
          () => {
            cy.findByRole("tab", { name: "New tab" }).should("be.visible");
          },
        );
        return;
      }

      cy.findByRole("tab", { name: "New tab" }).should("be.visible");
    });
  });

  it("should add the correct aria when tab actions are used", () => {
    mountTabs(<Dismissible />);

    cy.findByRole("tab", { name: "Home" }).should(
      "have.accessibleDescription",
      "1 action available",
    );
  });

  it("should support closing tabs with a mouse", () => {
    mountTabs(<Dismissible />);

    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findAllByRole("tab").should("have.length", 5);

    cy.findByRole("button", { name: "Liquidity Dismiss tab" }).click();
    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.findByRole("button", { name: "Loans Dismiss tab" }).click();
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.findByRole("button", { name: "Home Dismiss tab" }).click();
    cy.findAllByRole("tab").should("have.length", 2);
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should restore focus when selected tab removal is async", () => {
    mountTabs(<AsyncDismissibleTabs />);

    cy.findByRole("button", { name: "Home Dismiss tab" }).click();
    cy.findByRole("tab", { name: "Transactions" })
      .should("have.attr", "aria-selected", "true")
      .and("be.focused");
  });

  it("should call onChange with null when selection moves automatically after removal", () => {
    const changeSpy = cy.stub().as("changeSpy");
    mountTabs(<Dismissible onChange={changeSpy} />);

    cy.findByRole("button", { name: "Home Dismiss tab" }).click();

    cy.findByRole("tab", { name: "Transactions" })
      .should("have.attr", "aria-selected", "true")
      .and("be.focused");

    cy.get("@changeSpy").should("have.been.calledWith", null, "Transactions");
  });

  it("should support closing with a keyboard", () => {
    mountTabs(<Dismissible />);
    cy.findAllByRole("tab").should("have.length", 5);

    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Home Dismiss tab" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Transactions Dismiss tab" }).should(
      "be.focused",
    );

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Home Dismiss tab" }).should("be.focused");

    cy.realPress("Enter");

    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should support closing with confirmation", () => {
    mountTabs(<DismissWithConfirmation />);
    cy.findAllByRole("tab").should("have.length", 3);

    cy.findAllByRole("button", { name: "Home Dismiss tab" }).click();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("button", { name: "No" }).click();
    cy.findByRole("dialog").should("not.to.exist");
    cy.findByRole("button", { name: "Home Dismiss tab" }).should("be.focused");

    cy.findAllByRole("button", { name: "Home Dismiss tab" }).click();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("button", { name: "Yes" }).click();
    cy.findByRole("dialog").should("not.to.exist");
    cy.findAllByRole("tab").should("have.length", 2);
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should set tab-index 0 on the panel when it contains non-tabbable elements", () => {
    mountTabs(<Bordered />);
    cy.findByRole("tabpanel").should("have.attr", "tabIndex", "0");
  });

  it("should not set tab-index 0 on the panel when it contains tabbable elements", () => {
    mountTabs(<WithInteractiveElementInPanel />);
    cy.findByRole("tabpanel").should("not.have.attr", "tabIndex");
  });

  it("should associate panels with tabs", () => {
    mountTabs(<Bordered />);

    cy.findByRole("tabpanel", { name: "Home" }).should("be.visible");
  });

  it("should dynamically overflow tabs", () => {
    mountTabs(<DynamicOverflowBoundary />);
    cy.findAllByRole("tab").should("have.length", 5);

    cy.window().then((win) => {
      const dynamicOverflowWindow = win as ResponsiveOverflowWindow;
      dynamicOverflowWindow.__setDynamicOverflowWidth?.(548);
    });
    cy.findAllByRole("tab").should("have.length", 7);

    cy.window().then((win) => {
      const dynamicOverflowWindow = win as ResponsiveOverflowWindow;
      dynamicOverflowWindow.__setDynamicOverflowWidth?.(248);
    });
    cy.findAllByRole("tab").should("have.length", 3);
  });

  it("should support empty-string tab values", () => {
    mountTabs(<TabsWithEmptyStringValue />);

    cy.findByRole("tab", { name: "Empty" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tabpanel", { name: "Empty" }).should("be.visible");

    cy.findByRole("tab", { name: "Transactions" }).click();

    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tabpanel", { name: "Transactions" }).should("be.visible");
  });

  it("should keep an empty-string selection visible after selecting it from overflow", () => {
    mountTabs(<OverflowWithEmptyStringValue />);

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("Empty");

    cy.findByRole("tab", { name: "Empty", selected: true }).should(
      "be.focused",
    );
    cy.findAllByRole("tab").should("have.length", 2);
  });

  it("should support a controlled API", () => {
    mountTabs(
      <div style={{ width: 526 }}>
        <Controlled />
      </div>,
    );

    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.findByRole("tab", { name: "Transactions" }).click();
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Loans" }).should("be.focused");

    clickOverflowTab("Lots");
    cy.findByRole("tab", { name: "Lots", selected: true })
      .should("be.focused")
      .and("have.attr", "aria-selected", "true");

    cy.findByRole("button", { name: "Lots Dismiss tab" }).click();
    cy.findByRole("tab", { name: "Transactions" })
      .should("have.attr", "aria-selected", "true")
      .and("be.focused");
  });

  it("should follow visible tab order when navigating with arrow keys after selecting from overflow", () => {
    mountTabs(<Overflow />);

    // Wait for overflow to be ready
    cy.findAllByRole("tab").should("have.length", 5);

    // Open overflow menu and select "With"
    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    clickOverflowTab("With");
    cy.findByRole("tab", { name: "With", selected: true })
      .should("be.visible")
      .and("be.focused");

    // Go to the first tab
    cy.realPress("Home");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");

    // Navigate right through all visible tabs
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");

    // "With" should come before Overflow in the navigation order
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "With" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Overflow" }).should("be.focused");

    // Wrapping back to Home
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
  });

  it("should close the overflow menu and move focus past the tablist when Tab is pressed from the menu", () => {
    mountTabs(
      <>
        <Overflow />
        <button>after</button>
      </>,
    );

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");

    cy.realPress("Tab");

    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "not.exist",
    );
    cy.findByRole("button", { name: "after" }).should("be.focused");
  });

  it("should close the overflow menu and move focus to the overflow trigger when Shift+Tab is pressed from the menu", () => {
    mountTabs(
      <>
        <button>before</button>
        <Overflow />
      </>,
    );

    cy.findByRole("tab", { name: "Overflow" }).click();
    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "be.visible",
    );

    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");

    cy.realPress(["Shift", "Tab"]);

    cy.findByRole("tablist", { name: "Overflow tab options" }).should(
      "not.exist",
    );
    cy.findByRole("tab", { name: "Overflow" }).should("be.focused");
  });

  it(
    "should flip overflow menu placement if there is enough space",
    { viewportWidth: 430 },
    () => {
      cy.get("body").invoke("css", "display", "block");

      mountTabs(<Overflow />, { width: 408 });
      cy.findAllByRole("tab").should("have.length", 5);

      cy.findByRole("tab", { name: "Overflow" }).click();
      cy.findByRole("tablist", { name: "Overflow tab options" }).should(
        "be.visible",
      );

      // no horizontal overflow, menu should flip in horizontally
      cy.get("html").then((body) => {
        const { clientWidth, scrollWidth } = body[0];
        expect(clientWidth).to.equal(scrollWidth);
      });
    },
  );
});
