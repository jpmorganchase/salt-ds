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
  StackLayout,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import {
  AddIcon,
  BankCheckIcon,
  CloseIcon,
  CreditCardIcon,
  FavoriteIcon,
  HomeIcon,
  LineChartIcon,
  MicroMenuIcon,
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
        <TabBar inset divider>
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
        <TabBar inset divider>
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
        <TabBar inset divider>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>
                  {label}
                  {label === "Transactions" ? (
                    <Badge value={2} aria-label="2 updates" />
                  ) : null}
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
      <TabBar inset divider>
        <TabListNext style={{ margin: "auto", maxWidth: 360 }}>
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

  const { announce } = useAriaAnnouncer();

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabBar inset divider>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
                {tabs.length > 1 ? (
                  <TabNextAction
                    onClick={() => {
                      setTabs((old) => old.filter((tab) => tab !== label));
                      announce(`${label} tab has been closed`, 150);
                    }}
                    aria-label="Close tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabNextAction>
                ) : null}
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
        <TabBar inset divider>
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

  const { announce } = useAriaAnnouncer();

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext
        {...args}
        value={value}
        onChange={(_event, newValue) => setValue(newValue)}
      >
        <TabBar inset divider style={{ width: 500 }}>
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
              announce(`${newTab} tab added`, 150);
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
          <TabBar divider>
            <TabListNext activeColor={variant} appearance="bordered">
              {tabs.map((label) => (
                <TabNext value={label} key={label}>
                  <TabNextTrigger>{label}</TabNextTrigger>
                </TabNext>
              ))}
            </TabListNext>
          </TabBar>
          {tabs.map((label) => (
            <TabNextPanel value={label} key={label} style={{ height: 200 }}>
              <Panel variant={variant}>{label}</Panel>
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
      <TabsNext defaultValue="Home">
        <TabBar inset divider>
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

export const CloseWithConfirmation = () => {
  const [tabs, setTabs] = useState(lotsOfTabs);
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

  return (
    <div className="container">
      <CloseConfirmationDialog
        open={open}
        onCancel={handleCancel}
        valueToRemove={valueToRemove}
        onConfirm={handleConfirm}
        onTransitionEnd={clearValue}
      />
      <TabsNext defaultValue="Home">
        <TabBar inset divider>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
                {tabs.length > 1 ? (
                  <TabNextAction
                    onClick={() => {
                      setOpen(true);
                      setValueToRemove(label);
                    }}
                    aria-label="Close tab"
                  >
                    <CloseIcon aria-hidden />
                  </TabNextAction>
                ) : null}
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
        <TabBar>
          <TabListNext appearance="transparent">
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>

        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
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
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

WithInteractiveElementInPanel.args = {
  defaultValue: tabs[0],
};

export const WithMenu: StoryFn<typeof TabsNext> = (args) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  const [pinned, setPinned] = useState<string[]>([]);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabBar inset divider>
          <TabListNext>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                <TabNextTrigger>
                  {pinned.includes(label) ? (
                    <FavoriteIcon aria-label="Pinned" />
                  ) : undefined}
                  {label}
                </TabNextTrigger>
                {tabs.length > 1 ? (
                  <Menu>
                    <MenuTrigger>
                      <TabNextAction aria-label="Settings">
                        <MicroMenuIcon aria-hidden />
                      </TabNextAction>
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
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
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

  return (
    <TabsNext value={value} onChange={handleChange}>
      <TabBar inset divider>
        <TabListNext style={{ maxWidth: 350, margin: "auto" }}>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
              {tabs.length > 1 ? (
                <TabNextAction
                  onClick={() => {
                    setTabs((old) => old.filter((tab) => tab !== label));
                  }}
                  aria-label="Close tab"
                >
                  <CloseIcon aria-hidden />
                </TabNextAction>
              ) : null}
            </TabNext>
          ))}
        </TabListNext>
      </TabBar>
    </TabsNext>
  );
};
