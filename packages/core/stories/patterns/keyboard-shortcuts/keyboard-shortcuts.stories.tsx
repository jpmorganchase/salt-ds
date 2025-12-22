import {
  Button,
  Dialog,
  DialogContent,
  FlexLayout,
  FormFieldHelperText,
  Input,
  StackLayout,
  Switch,
  Text,
} from "@salt-ds/core";
import { FilterIcon } from "@salt-ds/icons";
import { Kbd, Table, TBody, TD, TH, THead, TR } from "@salt-ds/lab";
import type { Meta } from "@storybook/react-vite";
import React, { type ChangeEvent, type FC, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import "./keyboard-shortcuts.stories.css";

export default {
  title: "Patterns/Keyboard Shortcuts",
} as Meta;

type Shortcut = {
  label: string;
  keys: string[];
  description?: string;
};

const shortcutList: Shortcut[] = [
  {
    label: "Open command palette",
    keys: ["meta+option+p"],
  },
  {
    label: "Next",
    keys: ["meta+shift+e"],
  },
  {
    label: "Previous",
    keys: ["meta+e"],
  },
  {
    label: "Duplicate ticket",
    keys: ["meta+d"],
    description: "Make a copy of your ticket",
  },
  {
    label: "Set direction to buy",
    keys: ["meta+b"],
  },
  {
    label: "Set direction to sell",
    keys: ["meta+s"],
  },
  {
    label: "Bottom of list",
    keys: ["meta+end"],
  },
  {
    label: "Top of list",
    keys: ["meta+home"],
  },
  {
    label: "Test",
    keys: ["meta+u", "meta+y"],
    description: "Trigger test action with Cmd+U or Cmd+Y",
  },
];

function displayKeyName(key: string): string {
  const isMac = navigator.userAgent.toUpperCase().includes("MAC");

  const keyMap: Record<string, string> = {
    meta: isMac ? "⌘" : "ctrl",
    option: isMac ? "⌥" : "alt",
    shift: isMac ? "⇧" : "shift",
  };

  return keyMap[key] ?? key;
}
function highlightTextMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text
    .split(regex)
    .map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i}>{part}</strong>
      ) : (
        part
      ),
    );
}

const KeyboardShortcuts: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");

  useHotkeys(
    "meta+option+p",
    (e) => {
      e.preventDefault();
      alert("Open command palette triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+shift+e",
    (e) => {
      e.preventDefault();
      alert("Next triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+e",
    (e) => {
      e.preventDefault();
      alert("Previous triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+d",
    (e) => {
      e.preventDefault();
      alert("Duplicate ticket triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+b",
    (e) => {
      shortcutsEnabled && alert("Set direction to buy triggered");
    },
    { enabled: shortcutsEnabled },
    [shortcutsEnabled],
  );
  useHotkeys(
    "meta+s",
    (e) => {
      e.preventDefault();
      alert("Set direction to sell triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+end",
    (e) => {
      e.preventDefault();
      alert("Bottom of list triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+home",
    (e) => {
      e.preventDefault();
      alert("Top of list triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+u",
    (e) => {
      e.preventDefault();
      alert("Test shortcut triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+y",
    (e) => {
      e.preventDefault();
      alert("Test shortcut triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+shift+k",
    (event) => {
      event.preventDefault();
      setFilter("");
      setOpen(true);
    },
    { enabled: shortcutsEnabled },
  );

  const filteredShortcuts: Shortcut[] = shortcutList.filter((s) =>
    s.label.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  const handleDialogOpen = (): void => {
    setFilter("");
    setOpen(true);
  };
  const handleDialogChange = (value: boolean): void => {
    setOpen(value);
    if (value) setFilter("");
  };
  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setShortcutsEnabled(event.target.checked);
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setFilter(event.target.value);

  return (
    <>
      <StackLayout gap={1}>
        <Button data-testid="dialog-button" onClick={handleDialogOpen}>
          Keyboard shortcuts panel
        </Button>
        {shortcutsEnabled && (
          <FlexLayout align="center" gap={1} wrap>
            <Text>Press </Text>
            <FlexLayout align="center" gap={0.5}>
              <Kbd>{displayKeyName("meta")}</Kbd>+
              <Kbd>{displayKeyName("shift")}</Kbd>+<Kbd>K</Kbd>
            </FlexLayout>
            <Text>to open the keyboard shortcuts panel </Text>
          </FlexLayout>
        )}
      </StackLayout>
      <Dialog
        open={open}
        onOpenChange={handleDialogChange}
        id="keyboard-shortcuts-dialog"
        size="medium"
        className="keyboardShortcuts-dialog"
      >
        <DialogContent>
          <StackLayout gap={3}>
            <Switch
              checked={shortcutsEnabled}
              onChange={handleSwitchChange}
              label="Turn on keyboard shortcuts"
            />

            {shortcutsEnabled && (
              <StackLayout gap={1}>
                <Text className="keyboardShortcuts-actions-title" styleAs="h3">
                  Actions
                </Text>
                <StackLayout gap={filteredShortcuts.length ? 3 : 0.75}>
                  <Input
                    onChange={handleFilterChange}
                    value={filter}
                    bordered
                    variant="secondary"
                    placeholder="Filter actions"
                    startAdornment={
                      <FilterIcon color="secondary" aria-hidden="true" />
                    }
                    inputProps={{ "aria-label": "Filter actions" }}
                  />
                  {filteredShortcuts.length ? (
                    <StackLayout className="keyboardShortcuts-tableScroll">
                      <Table>
                        <THead>
                          <TR>
                            <TH>Action</TH>
                            <TH>Key combination</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {filteredShortcuts.map((shortcut, idx) => (
                            <TR key={shortcut.label + idx}>
                              <TD className="keyboardShortcuts-td">
                                <StackLayout
                                  gap={0.5}
                                  className="keyboardShortcuts-shortcuts"
                                >
                                  <Text>
                                    {highlightTextMatch(shortcut.label, filter)}
                                  </Text>
                                  {shortcut.description && (
                                    <Text color="secondary">
                                      {shortcut.description}
                                    </Text>
                                  )}
                                </StackLayout>
                              </TD>
                              <TD className="keyboardShortcuts-td">
                                <FlexLayout gap={0.5} wrap>
                                  {shortcut.keys.map((combo, comboIdx) => (
                                    <FlexLayout
                                      align="center"
                                      gap={0.5}
                                      key={combo + comboIdx}
                                      wrap
                                    >
                                      {combo.split("+").map((key, idx, arr) => (
                                        <FlexLayout
                                          align="center"
                                          wrap
                                          gap={0.5}
                                          key={key + idx}
                                        >
                                          <div className="keyboardShortcuts-kbd">
                                            {" "}
                                            <Kbd>{displayKeyName(key)}</Kbd>
                                          </div>

                                          {idx < arr.length - 1 && (
                                            <Text className="keyboardShortcuts-kbd">
                                              +
                                            </Text>
                                          )}
                                        </FlexLayout>
                                      ))}
                                      {comboIdx < shortcut.keys.length - 1 && (
                                        <Text>,</Text>
                                      )}
                                    </FlexLayout>
                                  ))}
                                </FlexLayout>
                              </TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                    </StackLayout>
                  ) : (
                    <FormFieldHelperText color="secondary">
                      No actions found
                    </FormFieldHelperText>
                  )}
                </StackLayout>
              </StackLayout>
            )}
          </StackLayout>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ShortcutPanel: FC = () => {
  const [shortcutsEnabled, setShortcutsEnabled] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");

  useHotkeys(
    "meta+option+p",
    (e) => {
      e.preventDefault();
      alert("Open command palette triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+shift+e",
    (e) => {
      e.preventDefault();
      alert("Next triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+e",
    (e) => {
      e.preventDefault();
      alert("Previous triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+d",
    (e) => {
      e.preventDefault();
      alert("Duplicate ticket triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+b",
    (e) => {
      shortcutsEnabled && alert("Set direction to buy triggered");
    },
    { enabled: shortcutsEnabled },
    [shortcutsEnabled],
  );
  useHotkeys(
    "meta+s",
    (e) => {
      e.preventDefault();
      alert("Set direction to sell triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+end",
    (e) => {
      e.preventDefault();
      alert("Bottom of list triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+home",
    (e) => {
      e.preventDefault();
      alert("Top of list triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+u",
    (e) => {
      e.preventDefault();
      alert("Test shortcut triggered");
    },
    { enabled: shortcutsEnabled },
  );
  useHotkeys(
    "meta+y",
    (e) => {
      e.preventDefault();
      alert("Test shortcut triggered");
    },
    { enabled: shortcutsEnabled },
  );

  const filteredShortcuts: Shortcut[] = shortcutList.filter((s) =>
    s.label.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setShortcutsEnabled(event.target.checked);
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setFilter(event.target.value);

  return (
    <>
      <StackLayout gap={3} className="keyboardShortcuts-panel">
        <Switch
          checked={shortcutsEnabled}
          onChange={handleSwitchChange}
          label="Turn on keyboard shortcuts"
        />
        {shortcutsEnabled && (
          <StackLayout gap={1}>
            <Text className="keyboardShortcuts-actions-title" styleAs="h3">
              Actions
            </Text>
            <StackLayout gap={filteredShortcuts.length ? 3 : 0.75}>
              <Input
                onChange={handleFilterChange}
                value={filter}
                bordered
                variant="secondary"
                placeholder="Filter actions"
                startAdornment={
                  <FilterIcon color="secondary" aria-hidden="true" />
                }
                inputProps={{ "aria-label": "Filter actions" }}
              />
              {filteredShortcuts.length ? (
                <StackLayout className="keyboardShortcuts-tableScroll">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Action</TH>
                        <TH>Key combination</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {filteredShortcuts.map((shortcut, idx) => (
                        <TR key={shortcut.label + idx}>
                          <TD className="keyboardShortcuts-td">
                            <StackLayout
                              gap={0.5}
                              className="keyboardShortcuts-shortcuts"
                            >
                              <Text>
                                {highlightTextMatch(shortcut.label, filter)}
                              </Text>
                              {shortcut.description && (
                                <Text color="secondary">
                                  {shortcut.description}
                                </Text>
                              )}
                            </StackLayout>
                          </TD>
                          <TD className="keyboardShortcuts-td">
                            <FlexLayout gap={0.5} wrap>
                              {shortcut.keys.map((combo, comboIdx) => (
                                <FlexLayout
                                  align="center"
                                  gap={0.5}
                                  key={combo + comboIdx}
                                  wrap
                                >
                                  {combo.split("+").map((key, idx, arr) => (
                                    <FlexLayout
                                      align="center"
                                      wrap
                                      gap={0.5}
                                      key={key + idx}
                                    >
                                      <div className="keyboardShortcuts-kbd" />
                                      <Kbd>{displayKeyName(key)}</Kbd>
                                      {idx < arr.length - 1 && (
                                        <Text className="keyboardShortcuts-kbd">
                                          +
                                        </Text>
                                      )}
                                    </FlexLayout>
                                  ))}
                                  {comboIdx < shortcut.keys.length - 1 && (
                                    <Text className="keyboardShortcuts-kbd">
                                      ,
                                    </Text>
                                  )}
                                </FlexLayout>
                              ))}
                            </FlexLayout>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </StackLayout>
              ) : (
                <FormFieldHelperText color="secondary">
                  No actions found
                </FormFieldHelperText>
              )}
            </StackLayout>
          </StackLayout>
        )}
      </StackLayout>
    </>
  );
};

export const Default = ShortcutPanel.bind({});
export const WithDialog = KeyboardShortcuts.bind({});
