import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormField,
  FormFieldLabel,
  Input,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  AddIcon,
  BankCheckIcon,
  CloseIcon,
  CreditCardIcon,
  HomeIcon,
  LineChartIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import {
  TabBar,
  TabListNext,
  type TabListNextProps,
  TabNext,
  TabNextAction,
  TabNextPanel,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import {
  type ChangeEvent,
  type ComponentType,
  type ReactElement,
  useRef,
  useState,
} from "react";

import "./tabs-next.stories.css";

export default {
  title: "Lab/Tabs Next",
  component: TabsNext,
  args: {
    value: undefined,
    onChange: undefined,
  },
};

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
const lotsOfTabs = [
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

export const Bordered: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabBar padding separator>
          <TabListNext appearance="bordered">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

Bordered.args = {
  defaultValue: tabs[0],
};

export const Inline: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabListNext appearance="transparent">
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
            </TabNext>
          ))}
        </TabListNext>

        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

Inline.args = {
  defaultValue: tabs[0],
};

const tabToIcon: Record<string, ComponentType> = {
  Home: HomeIcon,
  Transactions: ReceiptIcon,
  Loans: CreditCardIcon,
  Checks: BankCheckIcon,
  Liquidity: LineChartIcon,
};

export const WithIcon: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabBar padding separator>
          <TabListNext>
            {tabs.map((label) => {
              const Icon = tabToIcon[label];
              return (
                <TabNext
                  value={label}
                  key={label}
                  disabled={label === "Transactions"}
                >
                  <TabNextTrigger>
                    <Icon aria-hidden /> {label}
                  </TabNextTrigger>
                </TabNext>
              );
            })}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </div>
  );
};

WithIcon.args = {
  defaultValue: tabs[0],
};

export const WithBadge: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabBar padding separator>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>
                  {label}
                  {label === "Transactions" && <Badge value={2} />}
                </TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </div>
  );
};

WithBadge.args = {
  defaultValue: tabs[0],
};

export const Overflow: StoryFn<typeof TabsNext> = (args) => {
  return (
    <TabsNext {...args}>
      <TabBar padding separator>
        <TabListNext style={{ maxWidth: 350, margin: "auto" }}>
          {lotsOfTabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};

Overflow.args = {
  defaultValue: lotsOfTabs[0],
};

export const Closable: StoryFn<typeof TabsNext> = (args) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabBar padding separator>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
                {tabs.length > 1 && (
                  <TabNextAction
                    onClick={() => {
                      setTabs(tabs.filter((tab) => tab !== label));
                    }}
                    aria-label="Close tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabNextAction>
                )}
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </div>
  );
};

Closable.args = {
  defaultValue: tabs[0],
};

export const DisabledTabs: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabBar padding separator>
          <TabListNext appearance="bordered">
            {tabs.map((label) => (
              <TabNext disabled={label === "Loans"} value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

DisabledTabs.args = {
  defaultValue: tabs[0],
};

export const AddTabs: StoryFn<typeof TabsNext> = (args) => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState("Home");
  const newCount = useRef(0);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext
        {...args}
        value={value}
        onChange={(_event, newValue) => setValue(newValue)}
      >
        <TabBar padding separator style={{ width: 500 }}>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
          <Button
            aria-label="Add tab"
            appearance="transparent"
            onClick={() => {
              const newTab = `New tab${newCount.current > 0 ? ` ${newCount.current}` : ""}`;
              newCount.current += 1;

              setTabs((old) => old.concat(newTab));
            }}
          >
            <AddIcon aria-hidden />
          </Button>
        </TabBar>
      </TabsNext>
    </div>
  );
};

export const Backgrounds = (): ReactElement => {
  const [variant, setVariant] =
    useState<TabListNextProps["activeColor"]>("primary");

  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value as TabListNextProps["activeColor"]);
  };

  return (
    <StackLayout gap={6}>
      <div style={{ alignItems: "center", width: "40vw" }}>
        <TabsNext defaultValue={tabs[0]}>
          <TabListNext activeColor={variant} appearance="transparent">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
          {tabs.map((label) => (
            <TabNextPanel value={label} key={label} style={{ height: 200 }}>
              {label}
            </TabNextPanel>
          ))}
        </TabsNext>
      </div>
      <FormField style={{ width: "auto" }}>
        <FormFieldLabel>Select tabstrip color</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          value={variant}
          onChange={handleVariantChange}
        >
          <RadioButton label="Primary" value="primary" />
          <RadioButton label="Secondary" value="secondary" />
          <RadioButton label="Tertiary" value="tertiary" />
        </RadioButtonGroup>
      </FormField>
    </StackLayout>
  );
};

function AddTabDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <Dialog open={open}>
      <DialogHeader header="Add new tab" />
      <DialogContent>
        <FormField>
          <FormFieldLabel>New tab name</FormFieldLabel>
          <Input
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setValue(event.target.value);
            }}
          />
        </FormField>
      </DialogContent>
      <DialogActions>
        <Button appearance="solid" sentiment="negative" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          appearance="solid"
          sentiment="accented"
          onClick={() => {
            onConfirm(value);
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const AddWithDialog = () => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleConfirm = (newTab: string) => {
    setTabs((old) => old.concat(newTab));
    setConfirmationOpen(false);
  };

  const handleCancel = () => {
    setConfirmationOpen(false);
  };

  return (
    <div className="container">
      <AddTabDialog
        open={confirmationOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <TabsNext defaultValue="Home">
        <TabBar padding separator>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
          <Button
            appearance="transparent"
            aria-label="Add tab"
            onClick={() => {
              setConfirmationOpen(true);
            }}
          >
            <AddIcon aria-hidden />
          </Button>
        </TabBar>
      </TabsNext>
    </div>
  );
};

function CloseConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  valueToRemove,
}: {
  open?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  valueToRemove?: string;
}) {
  return (
    <Dialog open={open}>
      <DialogHeader header={`Remove ${valueToRemove}?`} />
      <DialogActions>
        <Button appearance="bordered" sentiment="accented" onClick={onCancel}>
          No
        </Button>
        <Button appearance="solid" sentiment="accented" onClick={onConfirm}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const CloseWithConfirmation = () => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [valueToRemove, setValueToRemove] = useState<string | undefined>(
    undefined,
  );

  const handleConfirm = () => {
    setTabs(tabs.filter((tab) => tab !== valueToRemove));
    setValueToRemove(undefined);
  };

  const handleCancel = () => {
    setValueToRemove(undefined);
  };

  return (
    <div className="container">
      <CloseConfirmationDialog
        open={!!valueToRemove}
        valueToRemove={valueToRemove}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <TabsNext defaultValue="Home">
        <TabBar padding separator>
          <TabListNext
            onClose={(_event, closedTab) => {
              setValueToRemove(closedTab);
            }}
          >
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
                {tabs.length > 1 && (
                  <TabNextAction aria-label="Close tab">
                    <CloseIcon aria-hidden />
                  </TabNextAction>
                )}
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </div>
  );
};

export const WithInteractiveElementInPanel: StoryFn<typeof TabsNext> = (
  args,
) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabListNext appearance="transparent">
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
            </TabNext>
          ))}
        </TabListNext>

        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
            <Button>Click me</Button>
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

WithInteractiveElementInPanel.args = {
  defaultValue: tabs[0],
};
