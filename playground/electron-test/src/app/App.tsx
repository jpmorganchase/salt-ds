import React, { useState, useRef, useCallback } from "react";
import {
  CascadingMenu,
  Dialog,
  Dropdown,
  MenuDescriptor,
  Popper,
  Tooltip,
  WindowContext,
  ElectronWindow,
  ColorChooser,
  Color,
  DialogActions,
  DialogContent,
  DialogTitle,
  OrderedButton,
  ButtonBar,
  Toolbar,
  FormField,
} from "@brandname/lab";

import { Button, useDensity } from "@brandname/core";

import {
  ExportIcon,
  NotificationIcon,
  ShareIcon,
  TearOutIcon,
} from "@brandname/icons";

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
    <Toolbar id="toolbar-default" wrapChildrenWithFormFields={false}>
      <div data-testid="toolbar-handle">
        <ToolbarAnchor />
      </div>
      <FormField
        data-close-on-click={false}
        label="Range"
        data-activation-indicator
        variant="theme"
      >
        <Dropdown
          initialSelectedItem={range}
          onSelect={(_, item) => setRange(item || undefined)}
          source={rangeData}
          style={{ width: 100 }}
        />
      </FormField>
      <FormField
        data-close-on-click={false}
        label="Type"
        data-activation-indicator
        variant="theme"
      >
        <Dropdown
          initialSelectedItem={type}
          onSelect={(_, item) => setType(item || undefined)}
          source={typeData}
          style={{ width: 90 }}
        />
      </FormField>
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

// There's nothing here. Just used to confirm whether font & icons are rendering fine.
export const App = () => {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (_: any, selectedItem: any) => {
    console.log("selection changed", selectedItem);
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

  return (
    // <PopperContext.Provider value={ElectronPopper}>
    <WindowContext.Provider value={ElectronWindow}>
      <>
        <Button data-testid="dialog-button" onClick={handleOpen}>
          Click to open dialog
        </Button>
        <Dialog
          className="Dialog-alignTop"
          id="steve-1"
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
        initialSelectedItem={usStateExampleData[0]}
        source={usStateExampleData}
        onChange={handleChange}
      />
      <CascadingMenu
        disableClickAway
        initialSource={initialSource}
        itemToString={(item) => item && item.title}
        onItemClick={(sourceItem) => {
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
      <Tooltip placement="right" title="I am a tooltip">
        <Button data-testid="tooltip-trigger">Hover</Button>
      </Tooltip>

      <Button ref={anchorEl} onClick={() => setOpenPopper(!openPopper)}>
        Toggle Popper
      </Button>
      <Popper anchorEl={anchorEl.current} open={openPopper}>
        <FormField
          data-close-on-click={false}
          label="Range"
          data-activation-indicator
          variant="theme"
        >
          <Button
            data-testid="FormField"
          >
            Test
          </Button>
        </FormField>
      </Popper>
      <Button
        data-testid="toolbar-trigger"
        ref={toolbarAnchorEl}
        onClick={() => setOpenToolbarPopper(!openToolbarPopper)}
      >
        Toggle Toolbar
      </Button>
      <Popper
        anchorEl={toolbarAnchorEl.current}
        id="toolbar-popper"
        open={openToolbarPopper}
      >
        <DefaultToolbar />
      </Popper>
    </WindowContext.Provider>
    // </PopperContext.Provider>
  );
};
