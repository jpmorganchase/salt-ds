import {
  Tab,
  TabBar,
  TabList,
  TabPanel,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createTabNavigation } from "../../site/src/utils/tabNavigation";
import { act, renderWithSalt } from "./render";

const tabs = [
  { value: "examples", label: "Examples" },
  { value: "usage", label: "How to use" },
  { value: "accessibility", label: "Accessibility" },
];
const routeFor = (value: string) => `/salt/components/button/${value}`;

function DocumentationPage({
  value,
  navigation,
  onNavigate,
}: {
  value: string;
  navigation: ReturnType<typeof createTabNavigation>;
  onNavigate: (value: string) => void;
}) {
  const route = routeFor(value);
  const registerTabBar = useCallback(
    (element: HTMLDivElement | null) => {
      navigation.registerTabBar(route, element);
    },
    [navigation, route],
  );
  useLayoutEffect(() => navigation.commitRoute(route), [navigation, route]);

  const handleChange = (event: SyntheticEvent | null, nextValue: string) => {
    const source =
      event?.target instanceof Element
        ? event.target.closest('[role="tab"]')
        : null;
    if (source) navigation.requestFocus(routeFor(nextValue), nextValue, source);
    onNavigate(nextValue);
  };

  return (
    <Tabs value={value} onChange={handleChange}>
      <TabBar ref={registerTabBar}>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value}>
              <TabTrigger>{tab.label}</TabTrigger>
            </Tab>
          ))}
        </TabList>
      </TabBar>
      {tabs.map((tab) => (
        <TabPanel key={tab.value} value={tab.value}>
          {tab.value === value && `${tab.label} document`}
        </TabPanel>
      ))}
    </Tabs>
  );
}

function DocumentationHost({
  initialValue = "examples",
  loadPage = async () => undefined,
  width = 600,
}: {
  initialValue?: string;
  loadPage?: () => Promise<void>;
  width?: number;
}) {
  const [navigation] = useState(createTabNavigation);
  const [value, setValue] = useState(initialValue);
  useEffect(() => () => navigation.cancel(), [navigation]);

  return (
    <div style={{ width }}>
      <input aria-label="Site search" />
      {/* App Router replaces this subtree while the namespace frame persists. */}
      <DocumentationPage
        key={value}
        value={value}
        navigation={navigation}
        onNavigate={(nextValue) => {
          void loadPage().then(() => setValue(nextValue));
        }}
      />
      <a href="#footer">Footer link</a>
    </div>
  );
}

function deferredPage() {
  let resolve!: () => void;
  const ready = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { loadPage: () => ready, resolve: () => resolve() };
}

async function selectHowToUse() {
  await settleTabLayout();
  page.getByRole("tab", { name: "Examples", exact: true }).element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect
    .element(page.getByRole("tab", { name: "How to use", exact: true }))
    .toHaveFocus();
  await userEvent.keyboard("{Enter}");
}

async function settleTabLayout() {
  // TabList replaces its initial inline triggers with portal-backed triggers.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

it("keeps keyboard navigation in the documentation tabs after replacing the page", async () => {
  await renderWithSalt(<DocumentationHost />);
  await settleTabLayout();
  const previousTab = page
    .getByRole("tab", { name: "How to use", exact: true })
    .element();

  await selectHowToUse();

  const selectedTab = page.getByRole("tab", {
    name: "How to use",
    exact: true,
  });
  await expect.element(selectedTab).toHaveAttribute("aria-selected", "true");
  await settleTabLayout();
  expect(previousTab.isConnected).toBe(false);
  await expect.element(selectedTab).toHaveFocus();

  await userEvent.keyboard("{ArrowRight}");
  await expect
    .element(page.getByRole("tab", { name: "Accessibility", exact: true }))
    .toHaveFocus();
});

it("does not autofocus the selected tab on a direct document load", async () => {
  await renderWithSalt(<DocumentationHost initialValue="usage" />);
  await settleTabLayout();

  await expect
    .element(page.getByRole("tab", { name: "How to use", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(document.body);
});

it("restores focus when keyboard navigation starts from the overflow tab menu", async () => {
  await renderWithSalt(<DocumentationHost width={160} />);
  const overflow = page.getByRole("tab", { name: "Overflow", exact: true });
  await expect.element(overflow).toBeVisible();
  overflow.element().focus();
  await userEvent.keyboard("{Enter}");

  const overflowOptions = page.getByRole("tablist", {
    name: "Overflow tab options",
  });
  await expect.element(overflowOptions).toBeVisible();
  await expect
    .element(
      overflowOptions.getByRole("tab", { name: "How to use", exact: true }),
    )
    .toHaveFocus();
  await userEvent.keyboard("{Enter}");

  const selectedTab = page.getByRole("tab", {
    name: "How to use",
    exact: true,
  });
  await expect.element(selectedTab).toHaveAttribute("aria-selected", "true");
  await settleTabLayout();
  await expect.element(selectedTab).toHaveFocus();
});

it("keeps focus on the reader's next link when a pending document finishes loading", async () => {
  const pending = deferredPage();
  await renderWithSalt(<DocumentationHost loadPage={pending.loadPage} />);
  await selectHowToUse();

  await userEvent.tab();
  await expect
    .element(page.getByRole("tabpanel", { name: "Examples", exact: true }))
    .toHaveFocus();
  await userEvent.tab();
  const footerLink = page.getByRole("link", { name: "Footer link" });
  await expect.element(footerLink).toHaveFocus();
  await act(async () => pending.resolve());

  await expect
    .element(page.getByRole("tab", { name: "How to use", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  await settleTabLayout();
  await expect.element(footerLink).toHaveFocus();
});

it("respects focus moved to search while a document is loading", async () => {
  const pending = deferredPage();
  await renderWithSalt(<DocumentationHost loadPage={pending.loadPage} />);
  await selectHowToUse();

  const search = page.getByRole("textbox", { name: "Site search" });
  search.element().focus();
  await act(async () => pending.resolve());

  await expect
    .element(page.getByRole("tab", { name: "How to use", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  await settleTabLayout();
  await expect.element(search).toHaveFocus();
});

it("discards pending tab focus when browser history navigation intervenes", async () => {
  const pending = deferredPage();
  await renderWithSalt(<DocumentationHost loadPage={pending.loadPage} />);
  await selectHowToUse();

  window.dispatchEvent(new PopStateEvent("popstate"));
  await act(async () => pending.resolve());

  const selectedTab = page.getByRole("tab", {
    name: "How to use",
    exact: true,
  });
  await expect.element(selectedTab).toHaveAttribute("aria-selected", "true");
  await settleTabLayout();
  expect(document.activeElement).toBe(document.body);
});
