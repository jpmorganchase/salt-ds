import { Button, Dropdown, Option, Toolbar, Tooltray } from "@salt-ds/core";
import { DownloadIcon, SettingsIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import styles from "./index.module.css";
import { typeOptions } from "./toolbarExampleData";

export const Appearance = (): ReactElement => (
  <ResizableExample>
    <div className={styles.example}>
      <Toolbar aria-label="Bordered toolbar">
        <Tooltray>
          <Dropdown
            bordered
            defaultSelected={[typeOptions[0]]}
            style={{ width: 140 }}
          >
            {typeOptions.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </Tooltray>
        <Tooltray align="end">
          <Button appearance="transparent" aria-label="Download">
            <DownloadIcon aria-hidden />
          </Button>
          <Button appearance="transparent" aria-label="Settings">
            <SettingsIcon aria-hidden />
          </Button>
          <Button appearance="solid">Create view</Button>
        </Tooltray>
      </Toolbar>
      <Toolbar appearance="transparent" aria-label="Transparent toolbar">
        <Tooltray>
          <Dropdown
            bordered
            defaultSelected={[typeOptions[0]]}
            style={{ width: 140 }}
          >
            {typeOptions.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </Tooltray>
        <Tooltray align="end">
          <Button appearance="transparent" aria-label="Download">
            <DownloadIcon aria-hidden />
          </Button>
          <Button appearance="transparent" aria-label="Settings">
            <SettingsIcon aria-hidden />
          </Button>
          <Button appearance="solid">Create view</Button>
        </Tooltray>
      </Toolbar>
    </div>
  </ResizableExample>
);
