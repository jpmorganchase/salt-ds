import {
  Button,
  Dialog,
  DialogContent,
  FlexLayout,
  FormFieldHelperText,
  Input,
  Kbd,
  StackLayout,
  Switch,
  Table,
  TBody,
  TD,
  Text,
  TH,
  THead,
  TR,
} from "@salt-ds/core";
import { FilterIcon } from "@salt-ds/icons";
import React, { type ChangeEvent, type FC, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import importedStyles from "./example.module.css";

const styles = importedStyles as unknown as Record<string, string>;

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
    meta: isMac ? "cmd" : "ctrl",
    option: isMac ? "option" : "alt",
    shift: "shift",
  };

  return keyMap[key] ?? key;
}

function highlightTextMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
      <strong key={i}>{part}</strong>
    ) : (
      part
    ),
  );
}

const KeyboardShortcuts: FC = () => {
  const [open, setOpen] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(false);
  const [filter, setFilter] = useState("");

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
      e.preventDefault();
      alert("Set direction to buy triggered");
    },
    { enabled: shortcutsEnabled },
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

  const filteredShortcuts: Shortcut[] = shortcutList.filter((s) => {
    const searchText = filter.trim().toLowerCase();
    return (
      s.label.toLowerCase().includes(searchText) ||
      s.description?.toLowerCase().includes(searchText)
    );
  });

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
        <Button
          data-testid="dialog-button"
          onClick={handleDialogOpen}
          className={styles.button}
        >
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
        aria-label="Keyboard shortcuts"
        open={open}
        onOpenChange={handleDialogChange}
        size="medium"
        className={styles.dialog}
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
                <Text className={styles.actionsTitle} styleAs="h3">
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
                    <StackLayout className={styles.tableScroll}>
                      <Table>
                        <THead>
                          <TR>
                            <TH>Action</TH>
                            <TH>Key combination</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {filteredShortcuts.map((shortcut) => (
                            <TR key={shortcut.label}>
                              <TD className={styles.tableCell}>
                                <StackLayout
                                  gap={0.5}
                                  className={styles.shortcuts}
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
                              <TD className={styles.tableCell}>
                                <FlexLayout gap={0.5} wrap>
                                  {shortcut.keys.map((combo, comboIdx) => (
                                    <FlexLayout
                                      align="center"
                                      gap={0.5}
                                      // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                                      key={`${combo}-${comboIdx}`}
                                      wrap
                                    >
                                      {combo.split("+").map((key, idx, arr) => (
                                        <FlexLayout
                                          align="center"
                                          wrap
                                          gap={0.5}
                                          // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                                          key={`${combo}-${key}-${idx}`}
                                        >
                                          <div className={styles.keyboardKey}>
                                            {" "}
                                            <Kbd>{displayKeyName(key)}</Kbd>
                                          </div>

                                          {idx < arr.length - 1 && (
                                            <Text className={styles.keyboardKey}>
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
      e.preventDefault();
      alert("Set direction to buy triggered");
    },
    { enabled: shortcutsEnabled },
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

  const filteredShortcuts: Shortcut[] = shortcutList.filter((s) => {
    const searchText = filter.trim().toLowerCase();
    return (
      s.label.toLowerCase().includes(searchText) ||
      s.description?.toLowerCase().includes(searchText)
    );
  });

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setShortcutsEnabled(event.target.checked);
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setFilter(event.target.value);

  return (
    <StackLayout gap={3}>
      <Switch
        checked={shortcutsEnabled}
        onChange={handleSwitchChange}
        label="Turn on keyboard shortcuts"
      />
      {shortcutsEnabled && (
        <StackLayout gap={1}>
          <Text className={styles.actionsTitle} styleAs="h3">
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
              <StackLayout className={styles.tableScroll}>
                <Table>
                  <THead>
                    <TR>
                      <TH>Action</TH>
                      <TH>Key combination</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {filteredShortcuts.map((shortcut) => (
                      <TR key={shortcut.label}>
                        <TD className={styles.tableCell}>
                          <StackLayout
                            gap={0.5}
                            className={styles.shortcuts}
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
                        <TD className={styles.tableCell}>
                          <FlexLayout gap={0.5} wrap>
                            {shortcut.keys.map((combo, comboIdx) => (
                              <FlexLayout
                                align="center"
                                gap={0.5}
                                // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                                key={`${combo}-${comboIdx}`}
                                wrap
                              >
                                {combo.split("+").map((key, idx, arr) => (
                                  <FlexLayout
                                    align="center"
                                    wrap
                                    gap={0.5}
                                    // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                                    key={`${combo}-${key}-${idx}`}
                                  >
                                    <div className={styles.keyboardKey}>
                                      <Kbd>{displayKeyName(key)}</Kbd>
                                    </div>
                                    {idx < arr.length - 1 && (
                                      <Text className={styles.keyboardKey}>
                                        +
                                      </Text>
                                    )}
                                  </FlexLayout>
                                ))}
                                {comboIdx < shortcut.keys.length - 1 && (
                                  <Text className={styles.keyboardKey}>
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
  );
};

export const Default = ShortcutPanel.bind({});
export const WithDialog = KeyboardShortcuts.bind({});
