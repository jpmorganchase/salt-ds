import type { VirtualElement } from "@floating-ui/react";
import {
  Button,
  Card,
  Menu,
  MenuGroup,
  type MenuGroupProps,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import {
  CopyIcon,
  ExportIcon,
  MicroMenuIcon,
  PasteIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Core/Menu",
  component: Menu,
} as Meta<typeof Menu>;

export const SingleLevel: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Paste");
          }}
        >
          Paste
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Export");
          }}
        >
          Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Settings");
          }}
        >
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

function EditStylingMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Edit styling</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Column");
          }}
        >
          Column
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Cell");
          }}
        >
          Cell
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Row");
          }}
        >
          Row
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}

function ClearStylingMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Clear styling</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Column");
          }}
        >
          Column
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Cell");
          }}
        >
          Cell
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Row");
          }}
        >
          Row
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}

export const MultiLevel: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <EditStylingMenu />
        <ClearStylingMenu />
        <MenuItem
          onClick={() => {
            alert("Export");
          }}
        >
          Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Settings");
          }}
        >
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const GroupedItems: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup label="Actions">
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuGroup>
        <MenuGroup label="Styling">
          <EditStylingMenu />
          <ClearStylingMenu />
        </MenuGroup>
        <MenuGroup label="Configurations">
          <MenuItem>Export</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const SeparatorOnly: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <EditStylingMenu />
          <ClearStylingMenu />
        </MenuGroup>
        <MenuGroup>
          <MenuItem>Export</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const Icons: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>
          <CopyIcon aria-hidden />
          Copy
        </MenuItem>
        <MenuItem>
          <ExportIcon aria-hidden />
          Export
        </MenuItem>
        <MenuItem>
          <SettingsIcon aria-hidden />
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const IconWithGroups: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup>
          <MenuItem>
            <CopyIcon aria-hidden />
            Copy
          </MenuItem>
          <MenuItem
            disabled
            onClick={() => {
              alert("Paste");
            }}
          >
            <PasteIcon aria-hidden />
            Paste
          </MenuItem>
        </MenuGroup>
        <MenuGroup label="Styling">
          <EditStylingMenu />
          <ClearStylingMenu />
        </MenuGroup>
        <MenuGroup label="Configurations">
          <MenuItem>
            <ExportIcon aria-hidden />
            Export
          </MenuItem>
          <MenuItem>
            <SettingsIcon aria-hidden />
            Settings
          </MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const ContextMenu: StoryFn = () => {
  const [virtualElement, setVirtualElement] = useState<VirtualElement | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card
        style={{
          width: 300,
          aspectRatio: 2 / 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          //React 16 support
          event.persist();
          setVirtualElement({
            getBoundingClientRect: () => ({
              width: 0,
              height: 0,
              x: event.clientX,
              y: event.clientY,
              top: event.clientY,
              right: event.clientX,
              bottom: event.clientY,
              left: event.clientX,
            }),
          });
          setOpen(true);
        }}
      >
        Right click here
      </Card>
      <Menu
        getVirtualElement={() => virtualElement}
        open={open}
        onOpenChange={setOpen}
      >
        <MenuPanel>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Move</MenuItem>
          <MenuItem>Delete</MenuItem>
        </MenuPanel>
      </Menu>
    </>
  );
};

const features = [
  {
    name: "Account overview",
    id: "account_overview",
    description: " Your financial summary.",
  },
  {
    name: "Investment portfolio",
    id: "investment_portfolio",
    description: "Track and manage your investments.",
  },
  {
    name: "Budget planner",
    id: "budget_planner",
    description: "Create and monitor your financial goals.",
  },
];

export const Descriptions: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        {Object.values(features).map(({ name, description, id }) => (
          <MenuItem id={id} key={id}>
            <StackLayout gap={0.5}>
              <Text>{name}</Text>
              <Text styleAs="label" color="secondary">
                {description}
              </Text>
            </StackLayout>
          </MenuItem>
        ))}
      </MenuPanel>
    </Menu>
  );
};

export const WithTooltip: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <Tooltip content="Open Menu">
        <MenuTrigger>
          <Button appearance="transparent" aria-label="Open Menu">
            <MicroMenuIcon aria-hidden />
          </Button>
        </MenuTrigger>
      </Tooltip>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Paste");
          }}
        >
          Paste
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Export");
          }}
        >
          Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Settings");
          }}
        >
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const WithDisabledItems: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <Menu>
          <MenuTrigger>
            <MenuItem disabled>Edit styling</MenuItem>
          </MenuTrigger>
          <MenuPanel>
            <MenuItem
              onClick={() => {
                alert("Column");
              }}
            >
              Column
            </MenuItem>
            <MenuItem
              onClick={() => {
                alert("Cell");
              }}
            >
              Cell
            </MenuItem>
          </MenuPanel>
        </Menu>
        <MenuItem
          disabled
          onClick={() => {
            alert("Export");
          }}
        >
          Export
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const SingleSelection: StoryFn<typeof Menu> = (args) => {
  const [sort, setSort] = useState<string[]>(["name"]);

  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Sort by"
          selectionVariant="single"
          selected={sort}
          onSelectionChange={(_event, newSelected) => setSort(newSelected)}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
          <MenuItem value="size">Size</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const MultipleSelection: StoryFn<typeof Menu> = (args) => {
  const [columns, setColumns] = useState<string[]>(["owner", "size"]);

  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Columns"
          selectionVariant="multiple"
          selected={columns}
          onSelectionChange={(_event, newSelected) => setColumns(newSelected)}
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
          <MenuItem value="size">Size</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const MixedSelection: StoryFn<typeof Menu> = (args) => {
  const [sort, setSort] = useState<string[]>(["name"]);
  const [columns, setColumns] = useState<string[]>(["owner", "size"]);

  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Sort by"
          selectionVariant="single"
          selected={sort}
          onSelectionChange={(_event, newSelected) => setSort(newSelected)}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
        </MenuGroup>
        <MenuGroup
          label="Columns"
          selectionVariant="multiple"
          selected={columns}
          onSelectionChange={(_event, newSelected) => setColumns(newSelected)}
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="size">Size</MenuItem>
          <MenuItem disabled value="type">
            Type
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <EditStylingMenu />
          <MenuItem
            onClick={() => {
              alert("Export");
            }}
          >
            Export
          </MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

function SortByMenu(
  props: Pick<MenuGroupProps, "onSelectionChange" | "selected">,
) {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Sort by</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup aria-label="Sort by" selectionVariant="single" {...props}>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
          <MenuItem value="size">Size</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
}

export const SelectionInSubmenu: StoryFn<typeof Menu> = (args) => {
  const [sort, setSort] = useState<string[]>(["name"]);

  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <SortByMenu
          selected={sort}
          onSelectionChange={(_event, newSelected) => setSort(newSelected)}
        />
      </MenuPanel>
    </Menu>
  );
};

function DensityMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Density</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          aria-label="Density"
          name="density"
          selectionVariant="single"
          defaultSelected={["medium"]}
        >
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
}

export const UncontrolledSelection: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Sort by"
          name="sortBy"
          selectionVariant="single"
          defaultSelected={["name"]}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
        </MenuGroup>
        <MenuGroup
          label="Columns"
          name="columns"
          selectionVariant="multiple"
          defaultSelected={["owner", "size"]}
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="size">Size</MenuItem>
          <MenuItem value="type">Type</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <DensityMenu />
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};
