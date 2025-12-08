import React, { ChangeEvent, SyntheticEvent, useState } from "react";
import {
  Button,
  ComboBox,
  Dialog,
  DialogContent,
  FlexLayout,
  StackLayout,
  Switch,
  Text,
  Label,
} from "@salt-ds/core";
import { FilterIcon } from "@salt-ds/icons";
import { Table, TBody, TD, TH, THead, TR, KeyboardKey } from "@salt-ds/lab";
import type { Meta } from "@storybook/react-vite";
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import "./keyboard-shortcuts.stories.css";

export default {
  title: "Patterns/Keyboard Shortcuts",
} as Meta;

// Keyboard shortcut data type
type KeyboardShortcut = {
  label: string;
  shortcut: string[];
  connector: string;
  action: () => void;
  description?: string;
};

const keyboardShortcuts: KeyboardShortcut[] = [
  {
    label: "Open command palette",
    shortcut: ["ctrl", "option", "p"],
    connector: "+",
    action: () => alert("Open command palette triggered!"),
  },
  {
    label: "Next",
    shortcut: ["ctrl", "shift", "e"],
    connector: "+",
    action: () => alert("Next triggered!"),
  },
  {
    label: "Previous",
    shortcut: ["ctrl", "e"],
    connector: "+",
    action: () => alert("Previous triggered!"),
  },
  {
    label: "Duplicate ticket",
    description: "Make a copy of your ticket",
    shortcut: ["ctrl", "d"],
    connector: "+",
    action: () => alert("Duplicate ticket triggered!"),
  },
  {
    label: "Set direction to buy",
    shortcut: ["ctrl", "b"],
    connector: "+",
    action: () => alert("Set direction to buy triggered!"),
  },
  {
    label: "Set direction to sell",
    shortcut: ["ctrl", "s"],
    connector: "+",
    action: () => alert("Set direction to sell triggered!"),
  },
  {
    label: "Bottom of list",
    shortcut: ["ctrl", "end"],
    connector: "+",
    action: () => alert("Bottom of list triggered!"),
  },
  {
    label: "Top of list",
    shortcut: ["ctrl", "home"],
    connector: "+",
    action: () => alert("Top of list triggered!"),
  },
];

// Utility: highlight search match
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? <strong key={i}>{part}</strong> : part
  );
}

// Table row for a shortcut
const ShortcutRow: React.FC<{ shortcut: KeyboardShortcut; filter: string }> = ({
  shortcut,
  filter,
}) => (
  <TR>
    <TD>
      <StackLayout gap={0.5}>
        <Text>{highlightMatch(shortcut.label, filter)}</Text>
        {shortcut.description && <Label color="secondary">{shortcut.description}</Label>}
      </StackLayout>
    </TD>
    <TD>
      <FlexLayout align="center" gap={0.5}>
        {shortcut.shortcut.map((keyName, idx) => (
          <React.Fragment key={keyName + idx}>
            <KeyboardKey aria-label={keyName}>{keyName}</KeyboardKey>
            {idx < shortcut.shortcut.length - 1 && <Text>{shortcut.connector}</Text>}
          </React.Fragment>
        ))}
      </FlexLayout>
    </TD>
  </TR>
);

// Register all hotkeys when enabled
const RegisterShortcuts: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  keyboardShortcuts.forEach((shortcut) => {
    // Join keys for react-hotkeys-hook (e.g., "ctrl+shift+e")
    const combo = shortcut.shortcut.join("+");
    useHotkeys(
      combo,
      (event) => {
        event.preventDefault();
        if (enabled) shortcut.action();
      },
      { enabled }
    );
  });
  return null;
};

const KeyboardShortcuts: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const [filter, setFilter] = useState("");

  const filteredShortcuts = keyboardShortcuts.filter((s) =>
    s.label.toLowerCase().includes(filter.trim().toLowerCase())
  );

  // Handlers
  const handleDialogOpen = () => setOpen(true);
  const handleDialogChange = (value: boolean) => setOpen(value);
  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) =>
    setShortcutsEnabled(event.target.checked);
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) =>
    setFilter(event.target.value);
  const handleFilterSelectionChange = (
    _: SyntheticEvent,
    newSelected: string[]
  ) => setFilter(newSelected.length === 1 ? newSelected[0] : "");

  return (
    <HotkeysProvider>
      {/* Register all shortcuts, only when enabled */}
      <RegisterShortcuts enabled={shortcutsEnabled} />
      <Button data-testid="dialog-button" onClick={handleDialogOpen}>
        Open Keyboard shortcuts panel
      </Button>
      <Dialog
        open={open}
        onOpenChange={handleDialogChange}
        id="keyboard-shortcuts-dialog"
        size="medium"
      >
        <DialogContent>
          <StackLayout gap={3}>
            <FlexLayout gap={1}>
              <Switch checked={shortcutsEnabled} onChange={handleSwitchChange} />
              <FlexLayout className="keyboardShortcuts-description">
                <Text>Turn on keyboard shortcuts</Text>
              </FlexLayout>
            </FlexLayout>
            {shortcutsEnabled && (
              <StackLayout gap={1}>
                <Text className="keyboardShortcuts-actions-title" styleAs="h3">
                  Actions
                </Text>
                <StackLayout gap={filteredShortcuts.length ? 3 : 0.75}>
                  <ComboBox
                    onChange={handleFilterChange}
                    onSelectionChange={handleFilterSelectionChange}
                    value={filter}
                    bordered
                    variant="secondary"
                    placeholder="Filter actions"
                    startAdornment={<FilterIcon color="secondary" />}
                  />
                  {filteredShortcuts.length ? (
                    <StackLayout style={{ overflow: "auto" }}>
                      <Table>
                        <THead>
                          <TR>
                            <TH>Action</TH>
                            <TH>Key combination</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {filteredShortcuts.map((shortcut, idx) => (
                            <ShortcutRow
                              key={shortcut.label + idx}
                              shortcut={shortcut}
                              filter={filter}
                            />
                          ))}
                        </TBody>
                      </Table>
                    </StackLayout>
                  ) : (
                    <Text color="secondary">No actions found</Text>
                  )}
                </StackLayout>
              </StackLayout>
            )}
          </StackLayout>
        </DialogContent>
      </Dialog>
    </HotkeysProvider>
  );
};

export const AddShortcuts = KeyboardShortcuts.bind({});