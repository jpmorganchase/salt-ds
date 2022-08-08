import {
  Button,
  FormField,
  Portal,
  Tooltip,
  useDensity,
  useTooltip,
  useWindow,
  WindowContext,
} from "@jpmorganchase/uitk-core";
import {
  ButtonBar,
  CascadingMenu,
  Color,
  ColorChooser,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dropdown,
  ElectronWindow,
  MenuDescriptor,
  OrderedButton,
  SelectionChangeHandler,
  Toolbar,
} from "@jpmorganchase/uitk-lab";
import { useCallback, useRef, useState } from "react";

import {
  ExportIcon,
  NotificationIcon,
  ShareIcon,
  TearOutIcon,
} from "@jpmorganchase/uitk-icons";

import { usStateExampleData } from "./exampleData";
import { ToolbarAnchor } from "./ToolbarAnchor";

const densityDialogWidths = {
  touch: 640,
  low: 600,
  medium: 500,
  high: 500,
};

const initialSource: MenuDescriptor = {
  menuItems: [
    {
      title: "Level 1 Menu Item 2",
      menuItems: [
        {
          title: "Level 2 Menu Item",
        },
        {
          title: "Level 2 Menu Item",
          menuItems: [
            {
              title: "Level 3 Menu Item",
            },
            {
              title: "Level 3 Menu Item",
            },
          ],
        },
      ],
    },
    {
      title: "Level 1 Menu Item",
    },
    {
      title: "Level 1 Menu Item 2",
      menuItems: [
        {
          title: "Level 2 Menu Item",
        },
        {
          title: "Level 2 Menu Item",
        },
        {
          title: "Level 2 Menu Item",
          menuItems: [
            {
              title: "Level 3 Menu Item",
            },
            {
              title: "Level 3 Menu Item",
            },
          ],
        },
      ],
    },
  ],
};
const DefaultToolbar = ({ initialWidth = 315 }) => {
  const typeData = ["Open", "Close", "Discarted", "Resolved"];
  const rangeData = [
    "Today",
    "Yesterday",
    "Last Week",
    "Last Month",
    "Last Year",
  ];

  const [type, setType] = useState<string | undefined>(typeData[0]);
  const [range, setRange] = useState<string | undefined>(rangeData[0]);

  const logItemName = (buttonName: string) =>
    console.log(`${buttonName} button clicked'`);

  return (
    <Toolbar id="toolbar-default">
      <div data-testid="toolbar-handle">
        <ToolbarAnchor />
      </div>
      <Dropdown
        defaultSelected={range}
        onSelect={(_, item) => setRange(item || undefined)}
        source={rangeData}
        style={{ width: 100 }}
      />

      <Dropdown
        defaultSelected={type}
        onSelect={(_, item) => setType(item || undefined)}
        source={typeData}
        style={{ width: 90 }}
      />
      <Button onClick={() => logItemName("export")} variant="secondary">
        <ExportIcon /> Export
      </Button>
      <Button onClick={() => logItemName("share")} variant="secondary">
        <ShareIcon /> Share
      </Button>
      <Button onClick={() => logItemName("alerts")} variant="secondary">
        <NotificationIcon /> Set Alerts
      </Button>
      <Button onClick={() => logItemName("expand")} variant="secondary">
        <TearOutIcon /> Expand
      </Button>
    </Toolbar>
  );
};

// @ts-ignore
const Popper = ({ children, open, id, anchorEl = null }) => {
  const Window = useWindow();
  return open ? (
    <Portal>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Window id={id}>{children}</Window>
    </Portal>
  ) : null;
};

export const App = () => {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange: SelectionChangeHandler<string> = (e, item) => {
    console.log(e);
    setSelectedItem(item as string);
  };

  const density = useDensity();

  // Comment out the ButtonBar references until we have ButtonBar in the repo
  const densityBreakpoint = density === "touch" ? "xl" : "xs";

  const defaultColor = Color.makeColorFromHex("#D1F4C9");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };

  const [openPopper, setOpenPopper] = useState(false);
  const [openToolbarPopper, setOpenToolbarPopper] = useState(false);
  const anchorEl = useRef(null);
  const toolbarAnchorEl = useRef(null);

  const { getTriggerProps, getTooltipProps } = useTooltip();

  const [selectedItem, setSelectedItem] = useState("Alabama");

  return (
    // <PopperContext.Provider value={ElectronPopper}>
    <WindowContext.Provider value={ElectronWindow}>
      <>
        <Button data-testid="dialog-button" onClick={handleOpen}>
          Click to open dialog
        </Button>
        <Dialog
          disablePortal={true}
          id="example-1"
          open={open}
          onClose={handleClose}
          width={densityDialogWidths[density]}
        >
          <DialogTitle ref={headerRef} onClose={handleClose}>
            Congratulations! You have created a Dialog.{" "}
          </DialogTitle>
          <DialogContent>
            If you delete this file, you won’t be able to recover it again. Are
            you sure you want to delete it?
          </DialogContent>
          <DialogActions>
            <ButtonBar
              className={`DialogButtonBar-${density}Density`}
              stackAtBreakpoint={densityBreakpoint}
            >
              <OrderedButton variant="cta">CTA BUTTON</OrderedButton>
              <OrderedButton style={{ cursor: "pointer" }}>
                REGULAR BUTTON
              </OrderedButton>
              <OrderedButton
                className="DialogButtonBar-secondary"
                variant="secondary"
              >
                SECONDARY BUTTON
              </OrderedButton>
            </ButtonBar>
          </DialogActions>
        </Dialog>
      </>
      <Dropdown
        selected={selectedItem}
        source={usStateExampleData}
        onSelectionChange={handleChange}
      />
      <CascadingMenu
        disableClickAway
        initialSource={initialSource}
        itemToString={(item: { title: string }) => item && item.title}
        onItemClick={(sourceItem) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`You clicked: ${sourceItem.title}`);
          return undefined;
        }}
      >
        <Button data-testid="cascading-menu-trigger">
          Open/Close Cascading Menu
        </Button>
      </CascadingMenu>
      <ColorChooser
        color={selectedColor}
        onSelect={onSelect}
        onClear={onClear}
      />

      <Button
        {...getTriggerProps<typeof Button>({
          "data-testid": "tooltip-trigger",
        })}
      >
        Hover
      </Button>
      <Tooltip {...getTooltipProps({ title: "I am a tooltip" })} />

      <Button ref={anchorEl} onClick={() => setOpenPopper(!openPopper)}>
        Toggle Popper
      </Button>
      <Popper id="formfield1" anchorEl={anchorEl.current} open={openPopper}>
        <FormField data-close-on-click={false} label="Range">
          <Button data-testid="FormField">Test</Button>
        </FormField>
      </Popper>
      <Button
        data-testid="toolbar-trigger"
        ref={toolbarAnchorEl}
        onClick={() => setOpenToolbarPopper(!openToolbarPopper)}
      >
        Toggle Toolbar
      </Button>
      <Popper id="toolbar-popper" open={openToolbarPopper}>
        <DefaultToolbar />
      </Popper>
    </WindowContext.Provider>
    // </PopperContext.Provider>
  );
};
