import { Button, Dropdown, Option } from "@salt-ds/core";
import { DownloadIcon, SettingsIcon } from "@salt-ds/icons";
import { ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import { typeOptions } from "./toolbarExampleData";

export const Appearance = (): ReactElement => (
  <div className={styles.example}>
    <ToolbarNext aria-label="Bordered toolbar">
      <TooltrayNext>
        <Dropdown
          bordered
          defaultSelected={[typeOptions[0]]}
          style={{ width: 140 }}
        >
          {typeOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext align="end">
        <Button appearance="transparent" aria-label="Download">
          <DownloadIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="Settings">
          <SettingsIcon aria-hidden />
        </Button>
        <Button appearance="solid">Create view</Button>
      </TooltrayNext>
    </ToolbarNext>
    <ToolbarNext appearance="transparent" aria-label="Transparent toolbar">
      <TooltrayNext>
        <Dropdown
          bordered
          defaultSelected={[typeOptions[0]]}
          style={{ width: 140 }}
        >
          {typeOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext align="end">
        <Button appearance="transparent" aria-label="Download">
          <DownloadIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="Settings">
          <SettingsIcon aria-hidden />
        </Button>
        <Button appearance="solid">Create view</Button>
      </TooltrayNext>
    </ToolbarNext>
  </div>
);
