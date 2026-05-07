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
  Link,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  Panel,
  RadioButton,
  RadioButtonGroup,
  Spinner,
  StackLayout,
  Tab,
  TabAction,
  TabBar,
  TabList,
  type TabListProps,
  TabPanel,
  Tabs,
  TabTrigger,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import {
  AddIcon,
  BankCheckIcon,
  ChartLineIcon,
  CloseIcon,
  CreditCardIcon,
  FavoriteIcon,
  HomeIcon,
  MicroMenuIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import type { StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type ComponentType,
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { fn } from "storybook/test";

import "./tabs.stories.css";

export default {
  title: "Core/Tabs",
  component: Tabs,
  args: {
    value: undefined,
    onChange: fn(),
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

export const Bordered: StoryFn<typeof Tabs> = (args) => {
  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList appearance="bordered">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
        {tabs.map((label) => (
          <TabPanel value={label} key={label}>
            {label}
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

Bordered.args = {
  defaultValue: tabs[0],
};

export const Inline: StoryFn<typeof Tabs> = (args) => {
  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar>
          <TabList appearance="transparent">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>

        {tabs.map((label) => (
          <TabPanel value={label} key={label}>
            {label}
          </TabPanel>
        ))}
      </Tabs>
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
  Liquidity: ChartLineIcon,
};

export const WithIcon: StoryFn<typeof Tabs> = (args) => {
  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => {
              const Icon = tabToIcon[label];
              return (
                <Tab
                  value={label}
                  key={label}
                  disabled={label === "Transactions"}
                >
                  <TabTrigger>
                    <Icon aria-hidden /> {label}
                  </TabTrigger>
                </Tab>
              );
            })}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

WithIcon.args = {
  defaultValue: tabs[0],
};

export const WithBadge: StoryFn<typeof Tabs> = (args) => {
  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>
                  {label}
                  {label === "Transactions" ? (
                    <Badge value={2} aria-label="2 updates" />
                  ) : null}
                </TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

WithBadge.args = {
  defaultValue: tabs[0],
};

export const Overflow: StoryFn<typeof Tabs> = (args) => {
  return (
    <div
      className="container overflowContainer"
      data-testid="tabs-overflow-boundary"
    >
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList>
            {lotsOfTabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

Overflow.args = {
  defaultValue: lotsOfTabs[0],
};

export const Dismissible: StoryFn<typeof Tabs> = (args) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  const { announce } = useAriaAnnouncer();

  const handleDismissTab = (value: string) => {
    setTabs((old) => old.filter((tab) => tab !== value));
    announce(`${value} tab has been removed`, 150);
  };

  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger
                  onKeyDown={(event) => {
                    if (event.key === "Delete" && tabs.length > 1) {
                      handleDismissTab(label);
                    }
                  }}
                >
                  {label}
                </TabTrigger>
                {tabs.length > 1 ? (
                  <TabAction
                    onClick={() => {
                      handleDismissTab(label);
                    }}
                    aria-label="Dismiss tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabAction>
                ) : null}
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

Dismissible.args = {
  defaultValue: tabs[0],
};

export const DisabledTabs: StoryFn<typeof Tabs> = (args) => {
  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList appearance="bordered">
            {tabs.map((label) => (
              <Tab disabled={label === "Loans"} value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
        {tabs.map((label) => (
          <TabPanel value={label} key={label}>
            {label}
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

DisabledTabs.args = {
  defaultValue: tabs[0],
};

export const AddTabs: StoryFn<typeof Tabs> = (args) => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState("Home");
  const newCount = useRef(0);

  const { announce } = useAriaAnnouncer();

  return (
    <div className="container">
      <Tabs
        {...args}
        value={value}
        onChange={(_event, newValue) => setValue(newValue)}
      >
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
          <Button
            aria-label="Add tab"
            appearance="transparent"
            onClick={() => {
              const newTab = `New tab${newCount.current > 0 ? ` ${newCount.current}` : ""}`;
              newCount.current += 1;

              setTabs((old) => old.concat(newTab));
              setValue(newTab);
              announce(`${newTab} tab added`, 150);
            }}
          >
            <AddIcon aria-hidden />
          </Button>
        </TabBar>
      </Tabs>
    </div>
  );
};

export const Backgrounds = (): ReactElement => {
  const [variant, setVariant] =
    useState<TabListProps["activeColor"]>("primary");

  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value as TabListProps["activeColor"]);
  };

  return (
    <StackLayout gap={6}>
      <div className="container">
        <Tabs defaultValue={tabs[0]}>
          <TabBar divider>
            <TabList activeColor={variant} appearance="bordered">
              {tabs.map((label) => (
                <Tab value={label} key={label}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              ))}
            </TabList>
          </TabBar>
          {tabs.map((label) => (
            <TabPanel value={label} key={label} style={{ height: 200 }}>
              <Panel variant={variant}>{label}</Panel>
            </TabPanel>
          ))}
        </Tabs>
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

  useEffect(() => {
    if (open) {
      setValue("");
    }
  }, [open]);

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
          disabled={value.trim() === ""}
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

  const { announce } = useAriaAnnouncer();

  const handleConfirm = (newTab: string) => {
    setTabs((old) => old.concat(newTab));
    setConfirmationOpen(false);
    announce(`${newTab} tab added`, 150);
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
      <Tabs defaultValue="Home">
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
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
      </Tabs>
    </div>
  );
};

function DismissConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  onTransitionEnd,
  valueToRemove,
}: {
  open?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onTransitionEnd: () => void;
  valueToRemove?: string;
}) {
  return (
    <Dialog open={open} onTransitionEnd={onTransitionEnd}>
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

export const DismissWithConfirmation = () => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [valueToRemove, setValueToRemove] = useState<string | undefined>(
    undefined,
  );
  const [open, setOpen] = useState(false);

  const { announce } = useAriaAnnouncer();

  const handleConfirm = () => {
    setTabs((old) => old.filter((tab) => tab !== valueToRemove));
    setOpen(false);
    announce(`${valueToRemove} tab has been removed`, 150);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const clearValue = () => {
    setValueToRemove(undefined);
  };

  const handleDismissTab = (value: string) => {
    setOpen(true);
    setValueToRemove(value);
  };

  return (
    <div className="container">
      <DismissConfirmationDialog
        open={open}
        onCancel={handleCancel}
        valueToRemove={valueToRemove}
        onConfirm={handleConfirm}
        onTransitionEnd={clearValue}
      />
      <Tabs defaultValue="Home">
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger
                  onKeyDown={(event) => {
                    if (event.key === "Delete" && tabs.length > 1) {
                      handleDismissTab(label);
                    }
                  }}
                >
                  {label}
                </TabTrigger>
                {tabs.length > 1 ? (
                  <TabAction
                    onClick={() => {
                      handleDismissTab(label);
                    }}
                    aria-label="Dismiss tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabAction>
                ) : null}
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

export const WithInteractiveElementInPanel: StoryFn<typeof Tabs> = (args) => {
  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar>
          <TabList appearance="transparent">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>

        {tabs.map((label) => (
          <TabPanel value={label} key={label}>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
              sed elit in sem gravida aliquet id non justo. In hac habitasse
              platea dictumst. Morbi non dui vehicula risus feugiat egestas eget
              ac mi. Nullam accumsan aliquam orci, ornare pharetra nulla gravida
              sed. Sed lobortis ut neque at volutpat. Nunc non suscipit purus,
              id facilisis dolor. Class aptent taciti sociosqu ad litora
              torquent per conubia nostra, per inceptos himenaeos. Nullam
              pretium imperdiet massa, vitae suscipit sem laoreet quis. Maecenas
              mattis lacus tincidunt odio rhoncus tincidunt.
            </Text>
            <Link href="#">Link</Link>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

WithInteractiveElementInPanel.args = {
  defaultValue: tabs[0],
};

export const WithMenu: StoryFn<typeof Tabs> = (args) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  const [pinned, setPinned] = useState<string[]>([]);

  return (
    <div className="container">
      <Tabs {...args}>
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>
                  {pinned.includes(label) ? (
                    <FavoriteIcon aria-label="Pinned" />
                  ) : undefined}
                  {label}
                </TabTrigger>
                {tabs.length > 1 ? (
                  <Menu>
                    <MenuTrigger>
                      <TabAction aria-label="Settings">
                        <MicroMenuIcon aria-hidden />
                      </TabAction>
                    </MenuTrigger>
                    <MenuPanel>
                      <MenuItem
                        onClick={() => {
                          setPinned((old) => {
                            if (old.includes(label)) {
                              return old.filter((pin) => pin !== label);
                            }
                            return old.concat(label);
                          });
                        }}
                      >
                        {pinned.includes(label) ? "Unpin" : "Pin"}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setTabs((old) => old.filter((tab) => tab !== label));
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuPanel>
                  </Menu>
                ) : null}
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

WithMenu.args = {
  defaultValue: tabs[0],
};

export const Controlled: StoryFn = () => {
  const [tabs, setTabs] = useState(lotsOfTabs);
  const [value, setValue] = useState("Home");

  const handleChange = (_: SyntheticEvent | null, value: string) => {
    console.log(value);
    setValue(value);
  };

  const handleDismissTab = (value: string) => {
    setTabs((old) => old.filter((tab) => tab !== value));
  };

  return (
    <div className="container">
      <Tabs value={value} onChange={handleChange}>
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger
                  onKeyDown={(event) => {
                    if (event.key === "Delete" && tabs.length > 1) {
                      handleDismissTab(label);
                    }
                  }}
                >
                  {label}
                </TabTrigger>
                {tabs.length > 1 ? (
                  <TabAction
                    onClick={() => {
                      handleDismissTab(label);
                    }}
                    aria-label="Dismiss tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabAction>
                ) : null}
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};

export const AsyncDismissibleTabs: StoryFn = () => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);
  const [value, setValue] = useState("Home");
  const [closingTabs, setClosingTabs] = useState<string[]>([]);

  const handleChange = (_event: SyntheticEvent | null, nextValue: string) => {
    setValue(nextValue);
  };

  const handleDismiss = (tabToDismiss: string) => {
    setClosingTabs((current) =>
      current.includes(tabToDismiss) ? current : current.concat(tabToDismiss),
    );
    setTimeout(() => {
      setTabs((oldTabs) => {
        const removedIndex = oldTabs.indexOf(tabToDismiss);
        const nextTabs = oldTabs.filter((tab) => tab !== tabToDismiss);

        setValue((currentValue) => {
          if (currentValue !== tabToDismiss) {
            return currentValue;
          }

          return (
            nextTabs[Math.min(removedIndex, nextTabs.length - 1)] ??
            currentValue
          );
        });

        return nextTabs;
      });
      setClosingTabs((current) =>
        current.filter((tab) => tab !== tabToDismiss),
      );
    }, 1000);
  };

  return (
    <div className="container">
      <Tabs value={value} onChange={handleChange}>
        <TabBar inset divider>
          <TabList>
            {tabs.map((label) => (
              <Tab key={label} value={label}>
                <TabTrigger>{label}</TabTrigger>
                {tabs.length > 1 ? (
                  <TabAction
                    aria-label="Dismiss tab"
                    onClick={() => {
                      handleDismiss(label);
                    }}
                  >
                    {closingTabs.includes(label) ? (
                      <Spinner size="small" aria-hidden disableAnnouncer />
                    ) : (
                      <CloseIcon aria-hidden />
                    )}
                  </TabAction>
                ) : null}
              </Tab>
            ))}
          </TabList>
        </TabBar>
      </Tabs>
    </div>
  );
};
