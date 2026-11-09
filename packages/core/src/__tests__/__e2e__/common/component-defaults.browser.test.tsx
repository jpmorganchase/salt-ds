import {
  Banner,
  Button,
  Card,
  ComboBox,
  Drawer,
  Dropdown,
  Input,
  InteractableCard,
  Kbd,
  LinkButton,
  LinkCard,
  ListBox,
  MultilineInput,
  NumberInput,
  Option,
  Panel,
  SidePanel,
  SidePanelProvider,
  TabList,
  Table,
  Tag,
  Text,
  TFoot,
  THead,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  VerticalNavigation,
} from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

import { PillInput } from "../../../pill-input";

const elementByClass = (className: string) => {
  const element = document.querySelector(`.${className}`);
  if (!element) {
    throw new Error(`Could not find element with class ${className}`);
  }
  return page.elementLocator(element);
};

describe.skip("GIVEN ComponentDefaultsProvider integrated components", () => {
  it("SHOULD apply saltButton defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltButton: { props: { appearance: "transparent" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Button>Action</Button>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltButton-transparent"))
      .toBeVisible();
  });

  it("SHOULD apply saltInput defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltInput: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Input />
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltInput-bordered")).toBeVisible();
  });

  it("SHOULD apply saltDropdown defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltDropdown: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Dropdown>
          <Option value="one">One</Option>
        </Dropdown>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltDropdown-bordered")).toBeVisible();
  });

  it("SHOULD apply saltComboBox defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltComboBox: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <ComboBox>
          <Option value="one">One</Option>
        </ComboBox>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltPillInput-bordered"))
      .toBeVisible();
  });

  it("SHOULD apply saltNumberInput defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltNumberInput: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <NumberInput />
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltNumberInput-bordered"))
      .toBeVisible();
  });

  it("SHOULD apply saltToggleButton defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltToggleButton: { props: { appearance: "bordered" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <ToggleButton value="one">One</ToggleButton>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltToggleButton-bordered"))
      .toBeVisible();
  });

  it("SHOULD apply saltTooltip defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTooltip: { props: { hideArrow: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Tooltip open content="Tip">
          <Button>Trigger</Button>
        </Tooltip>
      </ComponentDefaultsProvider>,
    );

    const arrow = document.querySelector(".saltTooltip-arrow");
    expect(arrow).toBeNull();
  });

  it("SHOULD apply saltBanner defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltBanner: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Banner>Notice</Banner>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltBanner-secondary")).toBeVisible();
  });

  it("SHOULD apply saltCard defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltCard: { props: { variant: "ghost" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Card>Body</Card>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltCard-ghost")).toBeVisible();
  });

  it("SHOULD apply saltInteractableCard defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltInteractableCard: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <InteractableCard>Body</InteractableCard>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltInteractableCard-secondary"))
      .toBeVisible();
  });

  it("SHOULD apply saltPanel defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltPanel: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Panel>Body</Panel>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltPanel-secondary")).toBeVisible();
  });

  it("SHOULD apply saltTable defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTable: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Table>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </Table>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltTable-secondary")).toBeVisible();
  });

  it("SHOULD apply saltTHead defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTHead: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Table>
          <THead>
            <tr>
              <th>Head</th>
            </tr>
          </THead>
        </Table>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltTable-thead-secondary"))
      .toBeVisible();
  });

  it("SHOULD apply saltTFoot defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTFoot: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Table>
          <TFoot>
            <tr>
              <td>Foot</td>
            </tr>
          </TFoot>
        </Table>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltTable-tfoot-secondary"))
      .toBeVisible();
  });

  it("SHOULD apply saltKbd defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltKbd: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Kbd>Cmd</Kbd>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltKbd-secondary")).toBeVisible();
  });

  it("SHOULD apply saltTag defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTag: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Tag>Tag</Tag>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltTag-bordered")).toBeVisible();
  });

  it("SHOULD apply saltLinkCard defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltLinkCard: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <LinkCard href="#">Link</LinkCard>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltLinkCard-secondary"))
      .toBeVisible();
  });

  it("SHOULD apply saltDrawer defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltDrawer: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Drawer open disableScrim>
          Body
        </Drawer>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltDrawer-secondary")).toBeVisible();
  });

  it("SHOULD apply saltToolbar defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltToolbar: { props: { appearance: "transparent" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Toolbar />
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltToolbar-transparent"))
      .toHaveClass("saltToolbar-transparent");
  });

  it("SHOULD apply saltMultilineInput defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltMultilineInput: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <MultilineInput />
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltMultilineInput-bordered"))
      .toBeVisible();
  });

  it("SHOULD apply saltPillInput defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltPillInput: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <PillInput pills={["One"]} />
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltPillInput-bordered"))
      .toBeVisible();
  });

  it("SHOULD apply saltListBox defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltListBox: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <ListBox>
          <Option value="one">One</Option>
        </ListBox>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltListBox-bordered")).toBeVisible();
  });

  it("SHOULD apply saltTabList defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTabList: { props: { appearance: "transparent" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <TabList />
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltTabList-transparent"))
      .toHaveClass("saltTabList-transparent");
  });

  it("SHOULD apply saltVerticalNavigation defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltVerticalNavigation: { props: { appearance: "indicator" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <VerticalNavigation>
          <li>Item</li>
        </VerticalNavigation>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltVerticalNavigation-indicator"))
      .toBeVisible();
  });

  it("SHOULD apply saltToggleButtonGroup defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltToggleButtonGroup: { props: { appearance: "bordered" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <ToggleButtonGroup>
          <ToggleButton value="one">One</ToggleButton>
        </ToggleButtonGroup>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltToggleButton-bordered"))
      .toBeVisible();
  });

  it("SHOULD apply saltSidePanel defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltSidePanel: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <SidePanelProvider open>
          <SidePanel>Body</SidePanel>
        </SidePanelProvider>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltSidePanel-secondary"))
      .toBeVisible();
  });

  it("SHOULD apply saltLinkButton defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltLinkButton: { props: { sentiment: "accented" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <LinkButton href="#">Link</LinkButton>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltLinkButton-accented"))
      .toBeVisible();
  });

  it("SHOULD apply saltText defaults", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltText: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Text>Body</Text>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltText-secondary")).toBeVisible();
  });
});
