import {
  Button,
  ComboBox,
  GoToInput,
  Input,
  Kbd,
  LinkButton,
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  NumberInput,
  OnSolidButton,
  Option,
  Pagination,
  Paginator,
  Pill,
  SaltProvider,
  Tag,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  DateInputSingle,
  LocalizationProvider,
} from "@salt-ds/date-components";
import type { CSSProperties, ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";

// Components take their height from their content, with their design height
// as a minimum. These tests check that defaults keep the design height and
// that wrapped labels and enlarged text grow the component instead of
// overflowing it.

const DENSITIES = ["high", "medium", "touch"] as const;
const LONG_LABEL = "Submit application form now";

// Doubles the medium density text size, like a browser's text-only zoom.
const ENLARGED_TEXT = {
  "--salt-text-fontSize": "24px",
  "--salt-text-lineHeight": "32px",
  "--salt-text-label-fontSize": "22px",
  "--salt-text-label-lineHeight": "28px",
};

type SizingCase = {
  name: string;
  selector: string;
  render: (label: string) => ReactNode;
  label?: string;
  // The label can wrap onto more than one line.
  wraps?: boolean;
  // Has an input field that should fill the component's height.
  field?: boolean;
  // Renders in a portal, outside any wrapping element.
  portal?: boolean;
};

const CASES: SizingCase[] = [
  {
    name: "Button",
    selector: ".saltButton",
    render: (label) => <Button>{label}</Button>,
    wraps: true,
  },
  {
    name: "LinkButton",
    selector: ".saltLinkButton",
    render: (label) => <LinkButton href="#">{label}</LinkButton>,
    wraps: true,
  },
  {
    name: "ToggleButton",
    selector: ".saltToggleButton",
    render: (label) => <ToggleButton value="a">{label}</ToggleButton>,
    wraps: true,
  },
  {
    name: "ToggleButtonGroup",
    selector: ".saltToggleButtonGroup .saltToggleButton",
    render: (label) => (
      <ToggleButtonGroup>
        <ToggleButton value="a">{label}</ToggleButton>
        <ToggleButton value="b">Beta</ToggleButton>
      </ToggleButtonGroup>
    ),
    wraps: true,
  },
  {
    name: "OnSolidButton",
    selector: ".saltOnSolidButton",
    render: (label) => <OnSolidButton>{label}</OnSolidButton>,
    wraps: true,
  },
  {
    name: "Pill",
    selector: ".saltPill",
    render: (label) => <Pill>{label}</Pill>,
  },
  {
    name: "Tag",
    selector: ".saltTag",
    render: (label) => <Tag>{label}</Tag>,
  },
  {
    name: "Kbd",
    selector: ".saltKbd",
    label: "Ctrl",
    render: (label) => <Kbd>{label}</Kbd>,
  },
  {
    name: "Paginator",
    selector: ".saltPageButton",
    render: () => (
      <Pagination count={5}>
        <Paginator />
      </Pagination>
    ),
  },
  {
    name: "GoToInput",
    selector: ".saltGoToInput-input",
    field: true,
    render: () => (
      <Pagination count={5}>
        <GoToInput />
      </Pagination>
    ),
  },
  {
    name: "Input",
    selector: ".saltInput",
    field: true,
    render: () => <Input defaultValue="Value" />,
  },
  {
    name: "NumberInput",
    selector: ".saltNumberInput",
    render: () => <NumberInput defaultValue={5} />,
  },
  {
    name: "ComboBox with truncated pills",
    selector: ".saltPillInput",
    field: true,
    render: () => (
      <ComboBox multiselect truncate defaultSelected={["One", "Two"]}>
        <Option value="One" />
        <Option value="Two" />
      </ComboBox>
    ),
  },
  {
    name: "MenuGroup",
    selector: ".saltMenuGroup-label",
    portal: true,
    render: (label) => (
      <Menu open>
        <MenuTrigger>
          <Button>Open</Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuGroup label={label}>
            <MenuItem>Item</MenuItem>
          </MenuGroup>
        </MenuPanel>
      </Menu>
    ),
  },
  {
    name: "DateInput",
    selector: ".saltDateInput",
    field: true,
    render: () => (
      <LocalizationProvider DateAdapter={AdapterDateFns}>
        <DateInputSingle />
      </LocalizationProvider>
    ),
  },
];

const px = (value: string) => Number.parseFloat(value) || 0;

async function renderAt(density: (typeof DENSITIES)[number], node: ReactNode) {
  await cleanup();
  await render(
    <SaltProvider density={density} mode="light">
      {node}
    </SaltProvider>,
  );
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

function getElement(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`${selector} wasn't rendered`);
  return element;
}

// The border-box height that min-height gives the element.
function minimumHeight(element: HTMLElement) {
  const style = getComputedStyle(element);
  const minHeight = px(style.minHeight);
  if (style.boxSizing === "border-box") return minHeight;
  return (
    minHeight +
    px(style.paddingTop) +
    px(style.paddingBottom) +
    px(style.borderTopWidth) +
    px(style.borderBottomWidth)
  );
}

// How far the element's text extends beyond its top and bottom edges.
function textOverflow(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  let top = box.top;
  let bottom = box.bottom;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(walker.currentNode);
    for (const rect of range.getClientRects()) {
      top = Math.min(top, rect.top);
      bottom = Math.max(bottom, rect.bottom);
    }
  }
  for (const field of element.querySelectorAll("input")) {
    const rect = field.getBoundingClientRect();
    const lineHeight = px(getComputedStyle(field).lineHeight);
    const clipped = Math.max(0, lineHeight - rect.height);
    top = Math.min(top, rect.top - clipped / 2);
    bottom = Math.max(bottom, rect.bottom + clipped / 2);
  }
  return box.top - top + (bottom - box.bottom);
}

function expectFieldToFillParent(element: HTMLElement) {
  const field = element.querySelector("input");
  if (!field?.parentElement) throw new Error("No input field");
  const parentStyle = getComputedStyle(field.parentElement);
  const contentHeight =
    field.parentElement.clientHeight -
    px(parentStyle.paddingTop) -
    px(parentStyle.paddingBottom);
  expect(field.getBoundingClientRect().height).toBeCloseTo(contentHeight, 0);
}

afterEach(() => {
  for (const name of Object.keys(ENLARGED_TEXT)) {
    document.documentElement.style.removeProperty(name);
  }
});

describe.each(DENSITIES)("Given %s density", (density) => {
  describe.each(CASES)("$name", (sizingCase) => {
    const { selector, label = "Label", wraps, field, portal } = sizingCase;

    it("keeps its minimum height by default", async () => {
      await renderAt(density, sizingCase.render(label));
      const element = getElement(selector);

      expect(element.getBoundingClientRect().height).toBeCloseTo(
        minimumHeight(element),
        0,
      );
      expect(textOverflow(element)).toBeLessThanOrEqual(1);
      if (field) expectFieldToFillParent(element);
    });

    it.skipIf(portal)("doesn't stretch in a flex row", async () => {
      await renderAt(
        density,
        <div style={{ display: "flex" }}>
          <div style={{ height: 120, width: 20, flex: "none" }} />
          {sizingCase.render(label)}
        </div>,
      );
      const element = getElement(selector);

      expect(element.getBoundingClientRect().height).toBeCloseTo(
        minimumHeight(element),
        0,
      );
    });

    it("grows to fit enlarged text", async () => {
      for (const [name, value] of Object.entries(ENLARGED_TEXT)) {
        document.documentElement.style.setProperty(name, value);
      }
      await renderAt(density, sizingCase.render(label));
      const element = getElement(selector);

      expect(element.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        minimumHeight(element) - 0.5,
      );
      expect(textOverflow(element)).toBeLessThanOrEqual(1);
      if (field) expectFieldToFillParent(element);
    });

    it.skipIf(!wraps)("grows to fit a wrapped label", async () => {
      await renderAt(
        density,
        <div style={{ width: 90 }}>{sizingCase.render(LONG_LABEL)}</div>,
      );
      const element = getElement(selector);

      expect(element.getBoundingClientRect().height).toBeGreaterThan(
        minimumHeight(element),
      );
      expect(textOverflow(element)).toBeLessThanOrEqual(1);
    });
  });

  it("still lets --saltButton-height set an exact height", async () => {
    await renderAt(
      density,
      <>
        <Button style={{ "--saltButton-height": "9px" } as CSSProperties}>
          +
        </Button>
        <div style={{ height: 40 }}>
          <Button style={{ "--saltButton-height": "100%" } as CSSProperties}>
            Submit
          </Button>
        </div>
      </>,
    );
    const [small, full] = document.querySelectorAll(".saltButton");

    expect(small.getBoundingClientRect().height).toBeCloseTo(9, 0);
    expect(full.getBoundingClientRect().height).toBeCloseTo(40, 0);
  });
});
